'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { 
  WorkflowStep, 
  WorkflowChain, 
  getStepImportance, 
  getNegationActionId 
} from './workflow-engine';

export type TelemetryNiche = 
  | 'workspace'      // Notes, Sheets, Document management
  | 'productivity'   // Tasks, Goals, Calendars, Events
  | 'connect'        // Chats, Calls, Huddles, Social Moments
  | 'security'       // Vault, Credentials, Keychains, Passkeys
  | 'intelligence'   // Smart Assistants, AI Model Routing
  | 'billing'        // Subscriptions, Tokens, Ledgers
  | 'system';        // Settings, Devices, Authentication

export interface LocalEvent {
  niche: TelemetryNiche;
  app: string;
  action: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface EphemeralSuggestion {
  id: string;
  title: string;
  description: string;
  niche: TelemetryNiche;
  actionLabel?: string;
  actionHref?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PulseRecord {
  lastPulseAt: string;
  dismissCount: number;
  totalPulseCount: number;
}

export interface CompiledLocalContext {
  activeNiches: string[];
  recentApps: string[];
  lastSearchQuery?: string;
  flowTransitions: string[];
  timestamp: string;
  activeWorkflowSteps?: string[];
}

interface LocalContextType {
  events: LocalEvent[];
  suggestions: EphemeralSuggestion[];
  bufferEvent: (event: Omit<LocalEvent, 'timestamp'>) => void;
  dismissSuggestion: (id: string) => void;
  compileContextForAI: () => CompiledLocalContext;
  
  // Workflow Recording Engine
  isRecording: boolean;
  currentWorkflow: WorkflowStep[];
  savedWorkflows: Record<string, WorkflowChain>;
  startRecording: () => void;
  stopRecording: (name: string, description: string, niche: TelemetryNiche) => WorkflowChain | null;
  clearSavedWorkflows: () => void;
  updateWorkflow: (workflowId: string, updated: WorkflowChain) => void;
}

const LocalContext = createContext<LocalContextType | undefined>(undefined);

const MAX_EVENTS = 40;
const PULSE_INTERVAL_MS = 60000 * 15; // 15-minute background integrity pulse

// Frequency spacing tiers (ms) based on dismissals
const COOLDOWN_TIERS = [
  0,                    // 0: Fresh pattern
  3600000 * 4,          // 1: 4 hours
  3600000 * 24,         // 2: 1 day
  3600000 * 24 * 3,     // 3: 3 days
  3600000 * 24 * 7,     // 4: 1 week
  3600000 * 24 * 14,    // 5: 2 weeks
];

export function LocalContextProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [suggestions, setSuggestions] = useState<EphemeralSuggestion[]>([]);
  const [pulseHistory, setPulseHistory] = useState<Record<string, PulseRecord>>({});
  const pathname = usePathname();

  // Workflow Engine States
  const [isRecording, setIsRecording] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowStep[]>([]);
  const [savedWorkflows, setSavedWorkflows] = useState<Record<string, WorkflowChain>>({});

  // Use refs to avoid re-binding the global window listener on state changes
  const isRecordingRef = useRef(isRecording);
  const bufferEventRef = useRef<(event: Omit<LocalEvent, 'timestamp'>) => void>(() => {});

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Load state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedEvents = localStorage.getItem('kylrix_action_cache_v1');
        if (cachedEvents) {
          const parsed = JSON.parse(cachedEvents) as LocalEvent[];
          const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
          const now = Date.now();
          setEvents(parsed.filter(e => now - new Date(e.timestamp).getTime() < ONE_WEEK));
        }

        const storedPulse = localStorage.getItem('kylrix_pulse_registry_v1');
        if (storedPulse) setPulseHistory(JSON.parse(storedPulse));

        const storedWorkflows = localStorage.getItem('kylrix_saved_workflows');
        if (storedWorkflows) setSavedWorkflows(JSON.parse(storedWorkflows));

      } catch (err) {
        console.warn('[LocalContextEngine] Integrity check failed during hydration.');
      }
    }
  }, []);

  const addSuggestion = useCallback((suggestion: Omit<EphemeralSuggestion, 'id' | 'timestamp'>) => {
    const actionKey = (suggestion as any).metadata?.actionKey || suggestion.title;
    const history = pulseHistory[actionKey];
    const now = Date.now();

    // Frequency Spacing Logic: Increasingly space out ignored/dismissed pulses
    if (history) {
      const tierIndex = Math.min(history.dismissCount, COOLDOWN_TIERS.length - 1);
      const cooldown = COOLDOWN_TIERS[tierIndex];
      const elapsed = now - new Date(history.lastPulseAt).getTime();

      if (elapsed < cooldown) {
        return; // Suppress: Pattern in frequency cooldown
      }
    }

    const id = Math.random().toString(36).substring(2, 9);
    const newSuggestion: EphemeralSuggestion = {
      ...suggestion,
      id,
      timestamp: new Date().toISOString()
    };
    
    setSuggestions(prev => {
      // Avoid visual duplicates for the same title
      if (prev.some(s => s.title === suggestion.title)) return prev;
      return [newSuggestion, ...prev].slice(0, 5);
    });

    // Register active pulse in registry
    setPulseHistory(prev => {
      const updated = {
        ...prev,
        [actionKey]: {
          lastPulseAt: new Date().toISOString(),
          dismissCount: prev[actionKey]?.dismissCount || 0,
          totalPulseCount: (prev[actionKey]?.totalPulseCount || 0) + 1
        }
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('kylrix_pulse_registry_v1', JSON.stringify(updated));
      }
      return updated;
    });

    console.log('[LocalContextEngine] Pulse Generated:', actionKey);
  }, [pulseHistory]);

  const dismissSuggestion = useCallback((id: string) => {
    setSuggestions(prev => {
      const target = prev.find(s => s.id === id);
      if (target) {
        const actionKey = target.metadata?.actionKey || target.title;
        
        // Increase dismiss weight to space out future pulses for this pattern
        setPulseHistory(current => {
          const updated = {
            ...current,
            [actionKey]: {
              ...(current[actionKey] || { lastPulseAt: new Date().toISOString(), totalPulseCount: 1 }),
              dismissCount: (current[actionKey]?.dismissCount || 0) + 1
            }
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem('kylrix_pulse_registry_v1', JSON.stringify(updated));
          }
          return updated;
        });

        console.log('[LocalContextEngine] Pattern De-incentivized:', actionKey);
      }
      return prev.filter(s => s.id !== id);
    });
  }, []);

  const runHeuristics = useCallback((currentEvents: LocalEvent[]) => {
    const now = new Date().getTime();
    const lastEvent = currentEvents[currentEvents.length - 1];

    // 1. Confident Context Suggestion Engine (Repeated patterns)
    const actionCounts: Record<string, number> = {};
    currentEvents.forEach(e => {
      const key = `${e.niche}.${e.app}.${e.action}`;
      actionCounts[key] = (actionCounts[key] || 0) + 1;
    });

    Object.entries(actionCounts).forEach(([actionKey, count]) => {
      if (count >= 3) {
        const parts = actionKey.split('.');
        const niche = parts[0] as TelemetryNiche;
        const app = parts[1];

        let title = '';
        let description = '';
        let actionLabel = '';
        let actionHref = '';

        if (app === 'note') {
          title = 'Quick Note Shortcut';
          description = 'You frequently manage notes. Jump straight back to your workspace notes?';
          actionLabel = 'Write note';
          actionHref = '/note/notes';
        } else if (app === 'projects') {
          title = 'Workflow Hub Suggestion';
          description = 'Review your recorded workflows to speed up task automation in Projects?';
          actionLabel = 'Manage workflows';
          actionHref = '/projects/workflows';
        } else if (app === 'flow') {
          title = 'Synergize Your Tasks';
          description = 'Coordinate outstanding goals in the Productivity Center?';
          actionLabel = 'Open flows';
          actionHref = '/flow/tasks';
        } else if (app === 'vault') {
          title = 'Secure Password Manager';
          description = 'Review and audit vault item sharing rules?';
          actionLabel = 'Manage secrets';
          actionHref = '/vault/sharing';
        } else if (app === 'connect') {
          title = 'Connect Huddles';
          description = 'Start a persistent workspace call with your team?';
          actionLabel = 'Open connect';
          actionHref = '/connect';
        }

        if (title) {
          addSuggestion({
            title,
            description,
            niche,
            actionLabel,
            actionHref,
            metadata: { actionKey }
          } as any);
        }
      }
    });

    // 2. Navigation & Friction Heuristics
    if (lastEvent?.niche === 'connect' && (lastEvent.app === 'connect' || lastEvent.app === 'moments') && lastEvent.action === 'page_view') {
      const recentSearch = currentEvents.find(e => 
        e.app === 'search' && 
        (e.action === 'search_focused' || e.action === 'search_typing') &&
        (now - new Date(e.timestamp).getTime() < 20000)
      );

      const clickedResult = currentEvents.find(e => 
        e.app === 'search' && 
        e.action === 'search_clicked_result' &&
        new Date(e.timestamp).getTime() > (recentSearch ? new Date(recentSearch.timestamp).getTime() : 0)
      );

      if (recentSearch && !clickedResult) {
        addSuggestion({
          title: 'Explore Moments Content',
          description: 'Browse the active public channels and user updates inside Moments.',
          niche: 'connect',
          actionLabel: 'Explore moments',
          actionHref: '/connect',
          metadata: { actionKey: 'search_to_moments' }
        });
      }
    }

    if (lastEvent?.niche === 'intelligence' && lastEvent.app === 'agents' && lastEvent.action === 'page_view') {
      const hasKey = typeof window !== 'undefined' && (
        localStorage.getItem('byokKey') || 
        localStorage.getItem('google_api_key') || 
        localStorage.getItem('secure_vault_active')
      );

      if (!hasKey) {
        addSuggestion({
          title: 'Secure Smart Assistants',
          description: 'Supply your private API key in Settings to unleash offline intelligent assistants.',
          niche: 'intelligence',
          actionLabel: 'Set up assistants',
          actionHref: '/settings/agents',
          metadata: { actionKey: 'byok_setup_prompt' }
        });
      }
    }

    if (lastEvent?.niche === 'productivity' && lastEvent.app === 'flow' && lastEvent.action === 'page_view') {
      const recentNoteView = currentEvents.find(e => 
        e.niche === 'workspace' && 
        e.app === 'note' && 
        e.action === 'page_view' &&
        (now - new Date(e.timestamp).getTime() < 15000)
      );

      if (recentNoteView) {
        addSuggestion({
          title: 'Bridge Notes & Tasks',
          description: 'Keep your notes open in the side panel while managing tasks?',
          niche: 'productivity',
          actionLabel: 'Open notes',
          actionHref: '/note/notes',
          metadata: { actionKey: 'notes_tasks_synergy' }
        });
      }
    }
  }, [addSuggestion]);

  const bufferEvent = useCallback((eventInput: Omit<LocalEvent, 'timestamp'>) => {
    const newEvent: LocalEvent = {
      ...eventInput,
      timestamp: new Date().toISOString()
    };

    setEvents(prev => {
      const updated = [...prev, newEvent];
      const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      const valid = updated.filter(e => now - new Date(e.timestamp).getTime() < ONE_WEEK).slice(-MAX_EVENTS);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('kylrix_action_cache_v1', JSON.stringify(valid));
      }
      return valid;
    });

    // Immediate reactive pulse on event arrival
    setTimeout(() => {
      setEvents(current => {
        runHeuristics(current);
        return current;
      });
    }, 50);

  }, [runHeuristics]);

  // Background Pulse Effect: Re-evaluate context occasionally without user interaction
  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(current => {
        runHeuristics(current);
        return current;
      });
    }, PULSE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [runHeuristics]);

  // Keep bufferEvent Ref current for global listener
  useEffect(() => {
    bufferEventRef.current = bufferEvent;
  }, [bufferEvent]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const actionEl = target.closest('[data-action-id]') as HTMLElement;
      if (!actionEl) return;

      const actionId = actionEl.getAttribute('data-action-id');
      if (!actionId) return;

      const parts = actionId.split('.');
      const niche = (parts[0] || 'system') as TelemetryNiche;
      const app = parts[1] || 'unknown';
      const context = parts[2] || 'unknown';
      const action = parts[3] || 'unknown';
      const element = parts[4] || 'unknown';

      bufferEventRef.current({
        niche,
        app,
        action: `${context}_${action}_${element}`,
        metadata: { actionId }
      });

      if (isRecordingRef.current) {
        const importance = getStepImportance(actionId);
        const negationActionId = getNegationActionId(actionId);
        const newStep: WorkflowStep = {
          actionId,
          timestamp: new Date().toISOString(),
          importance,
          negationActionId,
          isDynamic: false
        };
        setCurrentWorkflow(prev => [...prev, newStep]);
      }
    };

    window.addEventListener('click', handleGlobalClick, true);
    return () => window.removeEventListener('click', handleGlobalClick, true);
  }, []);

  useEffect(() => {
    if (!pathname) return;

    const getNicheAndApp = (path: string): { niche: TelemetryNiche; app: string } => {
      if (path.startsWith('/note')) return { niche: 'workspace', app: 'note' };
      if (path.startsWith('/vault')) return { niche: 'security', app: 'vault' };
      if (path.startsWith('/flow')) return { niche: 'productivity', app: 'flow' };
      if (path.startsWith('/connect')) return { niche: 'connect', app: 'connect' };
      if (path.startsWith('/projects')) return { niche: 'workspace', app: 'projects' };
      if (path.startsWith('/settings/agents')) return { niche: 'intelligence', app: 'agents' };
      if (path.startsWith('/settings')) return { niche: 'system', app: 'settings' };
      if (path.startsWith('/agents')) return { niche: 'intelligence', app: 'agents' };
      return { niche: 'system', app: 'home' };
    };

    const { niche, app } = getNicheAndApp(pathname);
    bufferEvent({
      niche,
      app,
      action: 'page_view',
      metadata: { path: pathname }
    });
  }, [pathname, bufferEvent]);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setCurrentWorkflow([]);
  }, []);

  const stopRecording = useCallback((name: string, description: string, niche: TelemetryNiche) => {
    setIsRecording(false);
    if (currentWorkflow.length === 0) return null;

    const workflowId = Math.random().toString(36).substring(2, 9);
    const newWorkflow: WorkflowChain = {
      id: workflowId,
      name,
      description,
      niche,
      steps: currentWorkflow,
      isPublic: false,
      isAnonymized: false,
      createdAt: new Date().toISOString()
    };

    setSavedWorkflows(prev => {
      const updated = { ...prev, [workflowId]: newWorkflow };
      if (typeof window !== 'undefined') {
        localStorage.setItem('kylrix_saved_workflows', JSON.stringify(updated));
      }
      return updated;
    });

    return newWorkflow;
  }, [currentWorkflow]);

  const updateWorkflow = useCallback((workflowId: string, updated: WorkflowChain) => {
    setSavedWorkflows(prev => {
      const next = { ...prev, [workflowId]: updated };
      if (typeof window !== 'undefined') {
        localStorage.setItem('kylrix_saved_workflows', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const clearSavedWorkflows = useCallback(() => {
    setSavedWorkflows({});
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kylrix_saved_workflows');
    }
  }, []);

  const compileContextForAI = useCallback((): CompiledLocalContext => {
    const activeNichesSet = new Set<TelemetryNiche>();
    const recentAppsSet = new Set<string>();
    const flowTransitions: string[] = [];
    let lastSearchQuery: string | undefined;
    
    events.forEach(e => {
      activeNichesSet.add(e.niche);
      recentAppsSet.add(e.app);
      if (e.action === 'page_view' && e.metadata?.path) {
        flowTransitions.push(e.metadata.path);
      }
      if (e.app === 'search' && e.metadata?.query) {
        lastSearchQuery = e.metadata.query;
      }
    });

    return {
      activeNiches: Array.from(activeNichesSet),
      recentApps: Array.from(recentAppsSet),
      lastSearchQuery: lastSearchQuery,
      flowTransitions: flowTransitions.slice(-5),
      timestamp: new Date().toISOString(),
      activeWorkflowSteps: currentWorkflow.map(step => step.actionId)
    };
  }, [events, currentWorkflow]);

  return (
    <LocalContext.Provider
      value={{
        events,
        suggestions,
        bufferEvent,
        dismissSuggestion,
        compileContextForAI,
        isRecording,
        currentWorkflow,
        savedWorkflows,
        startRecording,
        stopRecording,
        clearSavedWorkflows,
        updateWorkflow
      }}
    >
      {children}
    </LocalContext.Provider>
  );
}

export function useLocalContext() {
  const context = useContext(LocalContext);
  if (!context) {
    throw new Error('useLocalContext must be used within a LocalContextProvider');
  }
  return context;
}
