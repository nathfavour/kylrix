'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { Container, Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Feed } from '@/components/social/Feed';
import { ChatList } from '@/components/chat/ChatList';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useFAB } from '@/context/FABContext';
import { useUnifiedDrawer } from '@/context/UnifiedDrawerContext';
import { MessageSquare, Phone, Plus } from 'lucide-react';

function ConnectHomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [composeIntent, setComposeIntent] = useState<{
    noteId: string;
    noteTitle?: string;
    noteContent?: string;
    noteLink?: string;
    draftText?: string;
  } | null>(null);
  const { setConfiguration, resetConfiguration } = useFAB();
  const { open: openUnified } = useUnifiedDrawer();

  useEffect(() => {
    setConfiguration({
      isVisible: true,
      mainColor: '#F59E0B',
      actions: [
        { id: 'chat', label: 'NEW CHAT', icon: <MessageSquare size={20} />, onClick: () => openUnified('new-chat') },
        { id: 'channel', label: 'NEW CHANNEL', icon: <Plus size={20} />, onClick: () => openUnified('new-channel') },
        { id: 'huddle', label: 'START HUDDLE', icon: <Phone size={20} />, onClick: () => router.push('/connect/calls?start=1') }]
    });
    return () => resetConfiguration();
  }, [setConfiguration, resetConfiguration, router, openUnified]);

  const shouldCompose = useMemo(() => searchParams.get('compose') === '1', [searchParams]);

  useEffect(() => {
    if (!shouldCompose) return;
    const queryNoteId = String(searchParams.get('noteId') || '').trim();
    let nextIntent: {
      noteId: string;
      noteTitle?: string;
      noteContent?: string;
      noteLink?: string;
      draftText?: string;
    } | null = null;

    if (queryNoteId) {
      nextIntent = {
        noteId: queryNoteId,
        noteTitle: String(searchParams.get('noteTitle') || '').trim(),
        noteContent: '',
        noteLink: String(searchParams.get('noteLink') || '').trim(),
        draftText: String(searchParams.get('draftText') || '').trim(),
      };
    } else if (typeof window !== 'undefined') {
      const raw = window.sessionStorage.getItem('kylrix:compose-note-intent');
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as {
            noteId?: string;
            noteTitle?: string;
            noteContent?: string;
            noteLink?: string;
            draftText?: string;
          };
          const noteId = String(parsed?.noteId || '').trim();
          if (noteId) {
            nextIntent = {
              noteId,
              noteTitle: String(parsed?.noteTitle || '').trim(),
              noteContent: String(parsed?.noteContent || '').trim(),
              noteLink: String(parsed?.noteLink || '').trim(),
              draftText: String(parsed?.draftText || '').trim(),
            };
          }
        } catch {}
        window.sessionStorage.removeItem('kylrix:compose-note-intent');
      }
    }

    if (nextIntent) setComposeIntent(nextIntent);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('compose');
    params.delete('noteId');
    params.delete('noteTitle');
    params.delete('noteContent');
    params.delete('noteLink');
    params.delete('draftText');
    params.delete('composeKey');
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname);
  }, [pathname, router, searchParams, shouldCompose]);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  if (isDesktop) {
    return (
      <Container maxWidth="lg" sx={{ py: 2, pointerEvents: 'auto' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 4, alignItems: 'flex-start' }}>
          {/* Moments Column */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'var(--font-clash)', color: '#fff', mb: 3 }}>
              Moments
            </Typography>
            <Feed view="personal" composeIntent={composeIntent} />
          </Box>

          {/* Threads Column */}
          <Box sx={{ 
            bgcolor: '#161412', 
            borderRadius: '24px', 
            p: 3, 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto' as const,
            position: 'sticky' as const,
            top: '108px',
          }}>
            <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'var(--font-clash)', color: '#fff', mb: 3 }}>
              Threads
            </Typography>
            <ChatList activeTab="public" hideTabs={true} />
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 2, pointerEvents: 'auto' }}>
      <Feed view="personal" composeIntent={composeIntent} />
    </Container>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <ConnectHomeContent />
    </Suspense>
  );
}
