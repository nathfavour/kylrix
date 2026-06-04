'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Avatar,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  alpha,
  CircularProgress,
  Stack,
  Paper,
} from '@/lib/mui-tailwind/material';
import {
  Close as CloseIcon,
  Flag as FlagIcon,
  CalendarMonth as CalendarIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Description as NotesIcon,
  VideoCall as MeetingIcon,
  Send as SendIcon,
  AutoFixHigh as AutoFixHighIcon,
  ArrowBack as BackIcon,
} from '@/lib/mui-tailwind/icons';
import { formatTime } from '@/lib/time-util';
import { Query } from 'appwrite';
import { useTask } from '@/context/TaskContext';
import { Priority, TaskStatus } from '@/types';
import { useLayout } from '@/context/LayoutContext';
import { useAI } from '@/hooks/useAI';
import { useMediaQuery } from '@/lib/mui-tailwind/material';
import { useTheme } from '@/lib/mui-tailwind/material';
import { useAuth } from '@/context/auth/AuthContext';
import { useUnifiedDrawer } from '@/context/UnifiedDrawerContext';
import { notes as noteApi } from '@/lib/kylrixflow';
import UserSearch from '@/components/UserSearch';
import { getResourceCollaboratorsSecure } from '@/lib/actions/secure-ops';
import { account } from '@/lib/appwrite';
import { UsersService } from '@/lib/services/users';
import { FolderKanban } from 'lucide-react';
import ProjectLinker from '@/components/projects/ProjectLinker';
import type { CollaboratorPermission, TaskCollaborator } from '@/types';
import { createGhostNoteForResource, promoteGhostResourceThreadToStory } from '@/lib/actions/client-ops';
import { createComment, listComments, getNote } from '@/lib/appwrite/note';
import { client } from '@/lib/appwrite/client';
import { APPWRITE_CONFIG } from '@/lib/appwrite/config';
import { usePresence } from '@/components/providers/PresenceProvider';
import { useToast } from '@/components/ui/Toast';
import { AppwriteService } from '@/lib/appwrite';
import { IdentityAvatar } from '@/components/IdentityBadge';
import { Clock, FileText, Globe } from 'lucide-react';

const priorityColors: Record<Priority, string> = {
  low: '#A1A1AA',
  medium: '#14B8A6',
  high: '#F59E0B',
  urgent: '#EF4444',
};

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Completed',
  blocked: 'Blocked',
  cancelled: 'Cancelled',
};

interface TaskDetailsProps {
  taskId: string;
  onBack?: () => void;
}

export default function TaskDetails({ taskId, onBack }: TaskDetailsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const { open: openUnified } = useUnifiedDrawer();
  const { closeSecondarySidebar } = useLayout();

  const handleClose = () => {
    if (onBack) {
      onBack();
    } else {
      closeSecondarySidebar();
    }
  };
  const { joinResource, resourcePresence } = usePresence();

  useEffect(() => {
      if (taskId) {
          return joinResource(
              APPWRITE_CONFIG.DATABASES.FLOW,
              APPWRITE_CONFIG.TABLES.FLOW.TASKS,
              taskId
          );
      }
  }, [taskId, joinResource]);

  const {
    tasks,
    updateTask,
    completeTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addComment,
    listTaskCollaborators,
    addTaskCollaborator,
    updateTaskCollaborator,
    deleteTaskCollaborator,
    projects,
    labels,
  } = useTask();

  const task = React.useMemo(() => {
    const current = tasks.find((t) => t.id === taskId);
    if (!current) return null;

    const childSubtasks = tasks
      .filter((candidate) => candidate.parentTaskId === taskId)
      .map((child) => ({
        id: child.id,
        title: child.title,
        completed: child.status === 'done',
        createdAt: child.createdAt,
        completedAt: child.status === 'done' ? child.completedAt : undefined,
      }));

    return {
      ...current,
      subtasks: [...(current.subtasks || []), ...childSubtasks],
    };
  }, [tasks, taskId]);
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [noteQuery, setNoteQuery] = useState('');
  const [noteResults, setNoteResults] = useState<any[]>([]);
  const [isSearchingNotes, setIsSearchingNotes] = useState(false);
  const [linkedNoteTitles, setLinkedNoteTitles] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null);
  const [priorityAnchor, setPriorityAnchor] = useState<null | HTMLElement>(null);
  const [taskParticipantProfiles, setTaskParticipantProfiles] = useState<any[]>([]);
  const [isLoadingAssignees, setIsLoadingAssignees] = useState(false);
  const [taskCollaboratorRows, setTaskCollaboratorRows] = useState<TaskCollaborator[]>([]);
  const [pendingCollaborators, setPendingCollaborators] = useState<any[]>([]);
  const [showProjectLinker, setShowProjectLinker] = useState(false);
  const [pendingCollaboratorPermission, setPendingCollaboratorPermission] = useState<CollaboratorPermission>('write');

  // Huddle Discussion State & Effects
  const { showSuccess, showError } = useToast();
  const [huddleMessages, setHuddleMessages] = useState<any[]>([]);
  const [huddleLoading, setHuddleLoading] = useState(false);
  const [huddleSending, setHuddleSending] = useState(false);
  const [isHuddleInit, setIsHuddleInit] = useState(false);
  const [huddleTimeRemaining, setHuddleTimeRemaining] = useState('');
  const huddleMessageEndRef = React.useRef<HTMLDivElement>(null);

  // Check if Huddle is initialized and set timer countdown
  React.useEffect(() => {
    if (!taskId) return;
    let active = true;

    const checkHuddle = async () => {
      try {
        const note = await getNote(taskId);
        if (!active) return;
        if (note && note.metadata) {
          setIsHuddleInit(true);
          const noteMeta = JSON.parse(note.metadata);
          const expiresAt = new Date(noteMeta.expiresAt).getTime();
          const updateTimer = () => {
            const diff = expiresAt - Date.now();
            if (diff <= 0) {
              setHuddleTimeRemaining('Expired');
            } else {
              const days = Math.floor(diff / (24 * 60 * 60 * 1000));
              const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
              setHuddleTimeRemaining(`${days}d ${hours}h remaining`);
            }
          };
          updateTimer();
        }
      } catch (err) {
        if (active) setIsHuddleInit(false);
      }
    };

    checkHuddle();

    return () => { active = false; };
  }, [taskId]);

  // Load comments and subscribe to Appwrite comments
  React.useEffect(() => {
    if (!taskId || !isHuddleInit) return;
    let active = true;
    setHuddleLoading(true);

    const loadHuddleComments = async () => {
      try {
        const res = await listComments(taskId);
        if (!active) return;
        const msgs = await Promise.all(
          res.rows.map(async (row: any) => {
            let senderName = 'Collaborator';
            if (user && row.userId === user.$id) {
              senderName = user.name || 'You';
            } else {
              try {
                const profile = await AppwriteService.getProfile(row.userId);
                if (profile) senderName = profile.name || 'Collaborator';
              } catch {}
            }
            return {
              id: row.$id,
              senderId: row.userId,
              senderName,
              content: row.content,
              timestamp: new Date(row.createdAt).getTime(),
            };
          })
        );

        msgs.sort((a: any, b: any) => a.timestamp - b.timestamp);
        setHuddleMessages(msgs);
      } catch (err) {
        console.error('Failed to load huddle comments:', err);
      } finally {
        if (active) setHuddleLoading(false);
      }
    };

    loadHuddleComments();

    const unsubscribe = client.subscribe(
      `databases.${APPWRITE_CONFIG.DATABASES.NOTE}.collections.comments.documents`,
      async (response: any) => {
        if (!active) return;
        const events = response.events;
        const payload = response.payload;

        if (events.some((e: string) => e.includes('.create')) && payload.noteId === taskId) {
          let senderName = 'Collaborator';
          if (user && payload.userId === user.$id) {
            senderName = user.name || 'You';
          } else {
            try {
              const profile = await AppwriteService.getProfile(payload.userId);
              if (profile) senderName = profile.name || 'Collaborator';
            } catch {}
          }
          const msg = {
            id: payload.$id,
            senderId: payload.userId,
            senderName,
            content: payload.content,
            timestamp: new Date(payload.createdAt).getTime(),
          };
          setHuddleMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg].sort((a, b) => a.timestamp - b.timestamp);
          });
        }
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [taskId, isHuddleInit, user]);

  React.useEffect(() => {
    huddleMessageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [huddleMessages]);

  const handleInitHuddle = async () => {
    if (!task) return;
    setHuddleLoading(true);
    try {
      await createGhostNoteForResource(taskId, 'task', `${task.title} Discussion`);
      setIsHuddleInit(true);
      showSuccess('Discussion huddle initialized!');
    } catch (err) {
      console.error('Failed to init huddle:', err);
      showError('Failed to initialize huddle.');
    } finally {
      setHuddleLoading(false);
    }
  };

  const handleSendHuddleMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || huddleSending) return;
    setHuddleSending(true);
    try {
      await createComment(taskId, newComment.trim());
      setNewComment('');
    } catch (err) {
      console.error('Failed to send comment:', err);
      showError('Failed to send message.');
    } finally {
      setHuddleSending(false);
    }
  };

  const handleSaveHuddleAsStory = async () => {
    setHuddleLoading(true);
    try {
      await promoteGhostResourceThreadToStory(taskId, 'task');
      showSuccess('Discussion promoted to a permanent Story note!');
      setIsHuddleInit(false);
      setHuddleMessages([]);
    } catch (err) {
      console.error('Failed to save story:', err);
      showError('Failed to promote discussion.');
    } finally {
      setHuddleLoading(false);
    }
  };

  // AI Integration
  const { generate } = useAI();
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);

  const handleGenerateSubtasks = async () => {
    const currentTask = task;
    if (!currentTask?.title) return;
    setIsGeneratingSubtasks(true);
    try {
      const prompt = `You are a Project Manager. The user wants to '${currentTask.title}'. Generate a JSON array of 5 concrete, actionable sub-tasks. Return ONLY the JSON array of strings.`;
      const result = await generate(prompt);
      const text = typeof result === 'string' ? result : (result as any).text;
      // Clean up markdown code blocks if present
      const jsonString = text.replace(/```json\n|\n```/g, '').replace(/```/g, '');
      const subtasks = JSON.parse(jsonString);
      
      if (Array.isArray(subtasks)) {
        await Promise.all(
          subtasks
            .filter((st: unknown) => typeof st === 'string')
            .map((st: string) => addSubtask(currentTask.id, st))
        );
      }
    } catch (error: unknown) {
      console.error("Failed to generate subtasks", error);
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  const handleStartEdit = () => {
    const currentTask = task;
    if (!currentTask) return;
    setEditTitle(currentTask.title);
    setEditDescription(currentTask.description || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const currentTask = task;
    if (!currentTask) return;
    updateTask(currentTask.id, {
      title: editTitle,
      description: editDescription || undefined,
    });
    setIsEditing(false);
  };

  const handleAddSubtask = async () => {
    const currentTask = task;
    if (!currentTask) return;
    if (newSubtask.trim()) {
      await addSubtask(currentTask.id, newSubtask.trim());
      setNewSubtask('');
    }
  };

  const handleAddComment = () => {
    const currentTask = task;
    if (!currentTask) return;
    if (newComment.trim()) {
      addComment(currentTask.id, newComment.trim());
      setNewComment('');
    }
  };

  const handleAttachNote = async (noteId: string) => {
    const currentTask = task;
    if (!currentTask) return;
    const next = Array.from(new Set([...(currentTask.linkedNotes || []), noteId]));
    await updateTask(currentTask.id, { linkedNotes: next });
    setNoteQuery('');
    setNoteResults([]);
  };

  const handleDetachNote = async (noteId: string) => {
    const currentTask = task;
    if (!currentTask) return;
    const next = (currentTask.linkedNotes || []).filter((id) => id !== noteId);
    await updateTask(currentTask.id, { linkedNotes: next });
  };

  React.useEffect(() => {
    let active = true;

    const searchNotes = async () => {
      if (!task) return;
      if (noteQuery.trim().length < 2) {
        setNoteResults([]);
        setIsSearchingNotes(false);
        return;
      }

      setIsSearchingNotes(true);
      try {
        const res = await noteApi.list([
          Query.or([
            Query.search('searchTitle', noteQuery.trim()),
            Query.search('content', noteQuery.trim())]),
          Query.limit(6)]);
        if (!active) return;
        setNoteResults(res.rows.filter((row: any) => row.$id !== task.id));
      } catch (error) {
        console.error('Failed to search notes', error);
        if (active) setNoteResults([]);
      } finally {
        if (active) setIsSearchingNotes(false);
      }
    };

    const timer = setTimeout(searchNotes, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [noteQuery, task]);

  React.useEffect(() => {
    let active = true;
    const loadLinkedNotes = async () => {
      if (!task) return;
      const next: Record<string, string> = {};
      for (const noteId of task.linkedNotes || []) {
        try {
          const note = await noteApi.get(noteId);
          next[noteId] = note?.title || noteId;
        } catch (_error) {
          next[noteId] = noteId;
        }
      }
      if (active) setLinkedNoteTitles(next);
    };

    loadLinkedNotes();
    return () => {
      active = false;
    };
  }, [task]);

  // Fetch hydrated assignee profiles (Non-blocking background fetch)
  React.useEffect(() => {
    let active = true;
    const fetchAssigneeProfiles = async () => {
      if (!taskId) return;
      
      // Defer slightly for smooth sidebar mount
      await new Promise(resolve => setTimeout(resolve, 400));
      if (!active) return;

      setIsLoadingAssignees(true);
      try {
        const { jwt } = await account.createJWT();
        if (!active) return;
        
        const { collaborators } = await getResourceCollaboratorsSecure({
            resourceId: taskId,
            resourceType: 'task',
            jwt
        });
        if (active) setTaskParticipantProfiles(collaborators);
      } catch (err) {
        console.error('Failed to fetch assignee profiles:', err);
      } finally {
        if (active) setIsLoadingAssignees(false);
      }
    };

    fetchAssigneeProfiles();
    return () => { active = false; };
  }, [taskId]);

  if (!task) {
    return (
        <Box sx={{ p: 6, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
            <Typography variant="h6" color="text.secondary">Task details unavailable</Typography>
            <Button variant="outlined" size="small" onClick={handleClose}>Go Back</Button>
        </Box>
    );
  }

  const project = projects.find((p) => p.id === task.projectId);
  const taskLabels = labels.filter((l) => task.labels.includes(l.id));
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const subtaskProgress = task.subtasks.length > 0
    ? (completedSubtasks / task.subtasks.length) * 100
    : 0;

  const handleStatusChange = (status: TaskStatus) => {
    updateTask(task.id, { status });
    setStatusAnchor(null);
  };

  const handlePriorityChange = (priority: Priority) => {
    updateTask(task.id, { priority });
    setPriorityAnchor(null);
  };

  const handleAddCollaborators = async () => {
    if (!task || pendingCollaborators.length === 0) return;
    await Promise.all(
      pendingCollaborators.map((user) =>
        addTaskCollaborator(task.id, user.id, pendingCollaboratorPermission)
      )
    );
    setPendingCollaborators([]);
  };

  const handleCollaboratorPermissionChange = async (collaboratorId: string, permission: CollaboratorPermission) => {
    if (!task) return;
    await updateTaskCollaborator(task.id, collaboratorId, permission);
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!task) return;
    await deleteTaskCollaborator(task.id, collaboratorId);
  };

  return (
    <Box className="task-detail-root" sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#161412', overflow: 'hidden' }}>
      {/* Header (Dual-Row Layout - Fixed at top) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: { xs: 2, md: 2.5 }, pb: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.05)', bgcolor: '#161412' }}>
        {/* Row 1: Title & Close Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
            {onBack ? (
              <IconButton onClick={onBack} sx={{ color: theme.palette.text.secondary, flexShrink: 0 }}>
                <BackIcon />
              </IconButton>
            ) : (
              <IconButton onClick={handleClose} sx={{ color: theme.palette.text.secondary, flexShrink: 0, display: { xs: 'inline-flex', sm: 'none' } }}>
                <BackIcon />
              </IconButton>
            )}
            {isEditing ? (
              <TextField 
                fullWidth 
                variant="standard" 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)} 
                onBlur={() => handleSaveEdit()} 
                autoFocus 
                InputProps={{ 
                  disableUnderline: true, 
                  sx: { 
                    fontSize: '1.25rem', 
                    fontWeight: 900, 
                    color: 'white', 
                    fontFamily: '"Space Grotesk", sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em' 
                  } 
                }} 
              />
            ) : (
              <Typography 
                variant="h6" 
                onClick={handleStartEdit} 
                noWrap
                sx={{ 
                  cursor: 'pointer', 
                  fontWeight: 900, 
                  fontFamily: '"Space Grotesk", sans-serif',
                  color: '#A855F7',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '1.1rem',
                  flex: 1
                }}
              >
                {task.title}
              </Typography>
            )}
          </Box>

          {!onBack && (
            <Tooltip title="Close">
              <IconButton
                onClick={handleClose}
                sx={{
                  color: theme.palette.text.secondary,
                  display: { xs: 'none', sm: 'inline-flex' },
                  '&:hover': { color: 'white', bgcolor: alpha(theme.palette.text.primary, 0.08) }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Row 2: Action Toolbar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={statusLabels[task.status]}
            size="small"
            onClick={(e) => setStatusAnchor(e.currentTarget)}
            sx={{ 
              cursor: 'pointer',
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontWeight: 800,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              borderRadius: '8px',
            }}
          />

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title="Action hub">
            <IconButton onClick={() => setShowProjectLinker(true)} sx={{ color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <ActionIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit task">
            <IconButton onClick={handleStartEdit} sx={{ color: theme.palette.text.secondary }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete task">
            <IconButton 
              onClick={() => {
                openUnified('delete-confirm', {
                  title: 'Delete Goal?',
                  description: `"${task.title}"`,
                  onConfirm: () => { /* implement delete logic if needed */ }
                });
              }} 
              sx={{ color: theme.palette.text.secondary }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Scrollable Content Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 2.5 }, pt: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {/* Content Card (Pitch Black Sub-Region) */}
        <Box sx={{ p: 2.5, borderRadius: '28px', bgcolor: '#0A0908', border: '1px solid #1C1A18', minHeight: { xs: 200, md: 260 }, boxShadow: '0 12px 32px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Typography variant="caption" sx={{ color: '#A855F7', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>Objective details</Typography>
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            {isEditing ? (
              <TextField 
                fullWidth 
                multiline 
                rows={6} 
                variant="standard" 
                value={editDescription} 
                onChange={(e) => setEditDescription(e.target.value)} 
                onBlur={() => handleSaveEdit()}
                InputProps={{ 
                  disableUnderline: true, 
                  sx: { color: 'rgba(255,255,255,0.85)', fontSize: '1rem', lineHeight: 1.8 } 
                }} 
              />
            ) : (
              <Typography 
                variant="body1" 
                onClick={handleStartEdit}
                sx={{ color: 'text.secondary', fontSize: '1rem', lineHeight: 1.8, fontFamily: 'var(--font-satoshi)', cursor: 'text' }}
              >
                {task.description || 'No detailed parameters provided.'}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Execution Track Section (Pitch Black Sub-Region) */}
        <Box sx={{ p: 2.5, borderRadius: '28px', bgcolor: '#0A0908', border: '1px solid #1C1A18', boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#A855F7', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Execution Track</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>{completedSubtasks} / {task.subtasks.length}</Typography>
          </Box>
          <Box sx={{ width: '100%', height: 4, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2, mb: 3, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${subtaskProgress}%`, bgcolor: '#A855F7', transition: 'width 0.4s' }} />
          </Box>
          <List disablePadding>
            {task.subtasks.map((subtask) => (
              <ListItem key={subtask.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}><Checkbox size="small" checked={subtask.completed} onChange={() => toggleSubtask(task.id, subtask.id)} sx={{ color: 'rgba(255, 255, 255, 0.1)', '&.Mui-checked': { color: '#A855F7' } }} /></ListItemIcon>
                <ListItemText primary={subtask.title} primaryTypographyProps={{ sx: { fontSize: '0.9rem', textDecoration: subtask.completed ? 'line-through' : 'none', color: subtask.completed ? 'text.disabled' : 'text.primary' } }} />
              </ListItem>
            ))}
          </List>
          <Box sx={{ display: 'flex', gap: 1, mt: 2, p: 0.5, bgcolor: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <TextField fullWidth size="small" placeholder="Add sub-task..." value={newSubtask} variant="standard" onChange={(e) => setNewSubtask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()} InputProps={{ disableUnderline: true, sx: { px: 1.5, fontSize: '0.85rem' } }} />
            <IconButton size="small" onClick={handleGenerateSubtasks} disabled={isGeneratingSubtasks} sx={{ color: '#A855F7' }}>{isGeneratingSubtasks ? <CircularProgress size={16} /> : <AutoFixHighIcon sx={{ fontSize: 18 }} />}</IconButton>
          </Box>
        </Box>

        {/* Actionable Meta Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5, px: 1 }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#A855F7', fontWeight: 900, textTransform: 'uppercase', mb: 1.5, display: 'block' }}>Project Domain</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: project?.color || '#6366F1' }} />
              <Typography variant="body2" sx={{ fontWeight: 800 }}>{project?.name || 'Inbox'}</Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#A855F7', fontWeight: 900, textTransform: 'uppercase', mb: 1.5, display: 'block' }}>Urgency Level</Typography>
            <Box onClick={(e) => setPriorityAnchor(e.currentTarget)} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
              <FlagIcon sx={{ fontSize: 18, color: priorityColors[task.priority] }} />
              <Typography variant="body2" sx={{ fontWeight: 800, color: priorityColors[task.priority] }}>{task.priority.toUpperCase()}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Huddle Section (Pitch Black Sub-Region) */}
        <Box sx={{ p: 2.5, borderRadius: '28px', bgcolor: '#0A0908', border: '1px solid #1C1A18', boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#A855F7', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Public Huddle Thread</Typography>
            {isHuddleInit && huddleTimeRemaining && <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 800 }}>{huddleTimeRemaining}</Typography>}
          </Stack>

          {!isHuddleInit ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Globe size={24} style={{ color: '#A855F7', margin: '0 auto 12px' }} />
              <Button size="small" onClick={handleInitHuddle} sx={{ bgcolor: '#A855F7', color: '#fff', fontWeight: 800, textTransform: 'none', borderRadius: '8px' }}>Start Huddle</Button>
            </Box>
          ) : (
            <>
              <Box sx={{ maxHeight: 240, overflowY: 'auto', mb: 2 }}>
                {huddleMessages.map((msg) => (
                  <Box key={msg.id} sx={{ mb: 1.5, textAlign: msg.senderId === user?.$id ? 'right' : 'left' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800, display: 'block', mb: 0.25 }}>{msg.senderName}</Typography>
                    <Box sx={{ p: 1.25, borderRadius: '12px', display: 'inline-block', bgcolor: msg.senderId === user?.$id ? '#A855F7' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)', color: '#fff' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{msg.content}</Typography>
                    </Box>
                  </Box>
                ))}
                <div ref={huddleMessageEndRef} />
              </Box>
              <Box component="form" onSubmit={handleSendHuddleMessage} sx={{ display: 'flex', gap: 1, p: 1, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <TextField fullWidth size="small" placeholder="Message..." variant="standard" value={newComment} onChange={(e) => setNewComment(e.target.value)} InputProps={{ disableUnderline: true, sx: { px: 1, fontSize: '0.85rem' } }} />
                <IconButton size="small" type="submit" sx={{ color: '#A855F7' }}><SendIcon sx={{ fontSize: 16 }} /></IconButton>
              </Box>
            </>
          )}
        </Box>

        {/* Metadata */}
        <Box sx={{ mt: 'auto', pt: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>Created {formatNoteCreatedDate(task as any)}</Typography>
        </Box>
      </Box>

      {/* Select Menus */}
      <Menu anchorEl={statusAnchor} open={Boolean(statusAnchor)} onClose={() => setStatusAnchor(null)} PaperProps={{ sx: { bgcolor: '#161412', border: '1px solid #1C1A18', borderRadius: '12px', backgroundImage: 'none' } }}>
        {Object.entries(statusLabels).map(([status, label]) => (
          <MenuItem key={status} onClick={() => handleStatusChange(status as TaskStatus)} selected={task.status === status} sx={{ fontSize: '0.85rem', color: '#fff' }}>{label}</MenuItem>
        ))}
      </Menu>

      <Menu anchorEl={priorityAnchor} open={Boolean(priorityAnchor)} onClose={() => setPriorityAnchor(null)} PaperProps={{ sx: { bgcolor: '#161412', border: '1px solid #1C1A18', borderRadius: '12px', backgroundImage: 'none' } }}>
        {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => (
          <MenuItem key={p} onClick={() => handlePriorityChange(p)} selected={task.priority === p} sx={{ fontSize: '0.85rem', color: '#fff', gap: 1 }}><FlagIcon sx={{ fontSize: 16, color: priorityColors[p] }} />{p.toUpperCase()}</MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
