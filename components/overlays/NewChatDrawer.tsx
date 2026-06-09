'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Stack,
    alpha,
    useTheme,
    useMediaQuery
} from '@/lib/mui-tailwind/material';
import { X, ShieldCheck, MessageSquare } from 'lucide-react';
import { ChatService } from '@/lib/services/chat';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useSudo } from '@/context/SudoContext';
import { ecosystemSecurity } from '@/lib/ecosystem/security';
import toast from 'react-hot-toast';
import UserSearch from '@/components/UserSearch';
import { createGhostNoteChat, listGhostNoteChats } from '@/lib/actions/client-ops';

const DRAWER_SX = {
    borderTopLeftRadius: '26px',
    borderTopRightRadius: '26px',
    bgcolor: '#161412',
    borderTop: '1px solid #34322F',
    maxWidth: 720,
    width: '100%',
    mx: 'auto',
    maxHeight: '60vh'
};

const isValidPublicKey = (key: string | null | undefined): boolean => {
    if (!key) return false;
    try {
        const normalized = key.replace(/-/g, '+').replace(/_/g, '/');
        const binary = atob(normalized);
        return binary.length === 32;
    } catch {
        return false;
    }
};

export function NewChatDrawer({
    isOpen,
    onClose,
    mode = 'secure',
}: {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'secure' | 'thread';
}) {
    const { user } = useAuth();
    const router = useRouter();
    const { requestSudo } = useSudo();
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

    const copy = useMemo(() => {
        if (mode === 'thread') {
            return {
                title: 'New Thread',
                helper: 'Search for any user to start a thread.',
                loading: 'Starting thread...',
                success: 'Thread ready!',
                errorPrefix: 'Failed to create thread',
            };
        }

        return {
            title: 'Secure Chat',
            helper: 'Search for any user to start a secure chat.',
            loading: 'Opening secure chat...',
            success: 'Secure chat ready!',
            errorPrefix: 'Failed to create secure chat',
        };
    }, [mode]);

    const startChat = useCallback(async (targetUser: any) => {
        if (!user) return;
        const targetUserId = targetUser.id || targetUser.$id;
        const useThreadFlow =
            mode === 'thread' ||
            !ecosystemSecurity.status.isUnlocked ||
            !isValidPublicKey(targetUser.publicKey);

        if (useThreadFlow) {
            try {
                toast.loading(copy.loading, { id: 'ghost-init' });
                const existingGhosts = await listGhostNoteChats();
                const foundGhost = existingGhosts.find((c: any) => {
                    let metadataObj: any = {};
                    try {
                        metadataObj = typeof c.metadata === 'string' ? JSON.parse(c.metadata) : (c.metadata || {});
                    } catch {}
                    const participants = c.collaborators || metadataObj.participants || [];
                    return participants.includes(targetUserId);
                });

                if (foundGhost) {
                    toast.dismiss('ghost-init');
                    router.push(`/connect/chat/${foundGhost.$id}`);
                    onClose();
                    return;
                }

                const title = targetUser.displayName || targetUser.username || targetUser.title || (mode === 'thread' ? 'Thread' : 'Secure Chat');
                const newGhost = await createGhostNoteChat(title, [user.$id, targetUserId]);
                toast.success(copy.success, { id: 'ghost-init' });
                router.push(`/connect/chat/${newGhost.$id}`);
                onClose();
            } catch (error: any) {
                console.error('Failed to create thread chat:', error);
                toast.error(`${copy.errorPrefix}: ${error?.message || 'Unknown error'}`, { id: 'ghost-init' });
            }
            return;
        }

        try {
            const existing = await ChatService.getConversations(user.$id);
            const found = existing.rows.find((c: any) =>
                c.type === 'direct' && c.participants.includes(targetUserId)
            );
            if (found) {
                router.push(`/connect/chat/${found.$id}`);
                onClose();
                return;
            }
        } catch {}

        requestSudo({
            onSuccess: async () => {
                try {
                    await ecosystemSecurity.ensureE2EIdentity(user.$id);
                    const newConv = await ChatService.createConversation([user.$id, targetUserId], 'direct');
                    toast.success(copy.success, { id: 'ghost-init' });
                    router.push(`/connect/chat/${newConv.$id}`);
                    onClose();
                } catch (error: any) {
                    toast.error(`${copy.errorPrefix}: ${error.message}`);
                }
            }
        });
    }, [user, router, onClose, requestSudo, mode, copy]);

    useEffect(() => {
        if (selectedUsers.length > 0) {
            startChat(selectedUsers[0]);
            setSelectedUsers([]);
        }
    }, [selectedUsers, startChat]);

    if (!isOpen) return null;

    return (
        <Drawer
            anchor={isDesktop ? 'right' : 'bottom'}
            open={isOpen}
            onClose={onClose}
            keepMounted={false}
            disablePortal={true}
            PaperProps={{
                sx: {
                    ...DRAWER_SX,
                    borderTopLeftRadius: isDesktop ? 0 : DRAWER_SX.borderTopLeftRadius,
                    borderTopRightRadius: isDesktop ? 0 : DRAWER_SX.borderTopRightRadius,
                    borderLeft: isDesktop ? '1px solid #34322F' : undefined,
                    width: isDesktop ? 'min(480px, 90vw)' : DRAWER_SX.width,
                    maxHeight: isDesktop ? '100dvh' : DRAWER_SX.maxHeight,
                    height: isDesktop ? '100dvh' : 'auto',
                },
            }}
        >
            <Box sx={{ p: 2.75, pb: 'calc(2.75rem + env(safe-area-inset-bottom))' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ p: 1, borderRadius: '12px', bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B' }}>
                            <MessageSquare size={20} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'var(--font-clash)' }}>
                            {copy.title}
                        </Typography>
                    </Stack>
                    <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)' }}><X size={20} /></IconButton>
                </Box>

                <Box sx={{ flex: 1 }}>
                    <UserSearch
                        label="SEARCH GLOBAL DIRECTORY"
                        placeholder="Search by name, @username, or User ID"
                        selectedUsers={selectedUsers}
                        onSelect={(u) => setSelectedUsers([u])}
                        onRemove={() => setSelectedUsers([])}
                        multiple={false}
                        excludeIds={user?.$id ? [user.$id] : []}
                        inlineResults={true}
                    />

                    {!selectedUsers.length && (
                        <Box sx={{ textAlign: 'center', py: 6, opacity: 0.5 }}>
                            <ShieldCheck size={40} strokeWidth={1} style={{ marginBottom: 12 }} />
                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                                {copy.helper}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
}
