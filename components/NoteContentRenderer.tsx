'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Box, Typography, alpha } from '@/lib/openbricks/primitives';
import { preProcessMarkdown } from '@/lib/markdown';
import { VoiceNotePlayer } from '@/components/LinkRenderer';
import { parseObjectBlocks, type SecondaryObjectPayload } from '@/lib/note-object-secondary';
import { APPWRITE_CONFIG } from '@/lib/appwrite/config';
import { StorageService } from '@/lib/services/storage';
import { getRowSecure } from '@/lib/actions/secure-ops';

marked.setOptions({
  gfm: true,
  breaks: true,
});

interface NoteContentRendererProps {
  content?: string | null;
  format?: string | null;
  emptyFallback?: React.ReactNode;
  preview?: boolean;
}

export function NoteContentRenderer({
  content,
  format = 'text',
  emptyFallback = <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.3)' }}>This note is empty.</Typography>,
}: NoteContentRendererProps) {
  const objectBlocks = useMemo(() => {
    const blocks = parseObjectBlocks(content || '');
    if (!blocks.length) return [{ type: 'text' as const, content: (content || '').trim() }];

    const nodes: Array<{ type: 'text'; content: string } | { type: 'object'; payload: SecondaryObjectPayload }> = [];
    let cursor = 0;
    const source = content || '';
    for (const block of blocks) {
      if (cursor < block.start) {
        nodes.push({ type: 'text', content: source.slice(cursor, block.start) });
      }
      nodes.push({ type: 'object', payload: block.payload });
      cursor = block.end;
    }
    if (cursor < source.length) {
      nodes.push({ type: 'text', content: source.slice(cursor) });
    }
    return nodes;
  }, [content]);

  const parts = useMemo(() => {
    const trimmed = content?.trim();
    if (!trimmed) return [];

    const voiceNoteRegex = /(\[voice:[a-zA-Z0-9_-]+\])/g;
    return trimmed.split(voiceNoteRegex);
  }, [content]);

  if (format === 'doodle') {
    return (
      <Box>
        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.3)' }}>
          Sketch notes are no longer supported. Create a new text note to continue.
        </Typography>
      </Box>
    );
  }

  if (parts.length === 0) {
    return <Box>{emptyFallback}</Box>;
  }

  const renderMarkdownText = (text: string, keyPrefix: string) => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const voiceNoteRegex = /(\[voice:[a-zA-Z0-9_-]+\])/g;
    const voiceParts = trimmed.split(voiceNoteRegex);
    return voiceParts.map((part, index) => {
      const match = part.match(/^\[voice:([a-zA-Z0-9_-]+)\]$/);
      if (match) {
        const fileId = match[1];
        return (
          <Box key={`${keyPrefix}-voice-${index}`} sx={{ my: 1.5, display: 'block' }} onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
            <VoiceNotePlayer fileId={fileId} />
          </Box>
        );
      }
      const processed = preProcessMarkdown(part);
      const rawHtml = marked.parse(processed) as string;
      const sanitizedHtml = typeof window !== 'undefined' ? DOMPurify.sanitize(rawHtml) : rawHtml;
      return (
        <Box
          key={`${keyPrefix}-text-${index}`}
          component="div"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          sx={{ display: 'inline' }}
        />
      );
    });
  };

  return (
    <Box
      sx={{
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '1.125rem',
        lineHeight: 1.75,
        '& p': { mb: 3 },
        '& h1': {
          fontSize: '2.25rem',
          fontWeight: 900,
          mb: 4,
          mt: 4,
          color: 'white',
          letterSpacing: '-0.02em',
        },
        '& h2': {
          fontSize: '1.875rem',
          fontWeight: 800,
          mb: 3,
          mt: 4,
          color: 'white',
          letterSpacing: '-0.01em',
        },
        '& h3': {
          fontSize: '1.5rem',
          fontWeight: 700,
          mb: 2,
          mt: 3,
          color: 'white',
        },
        '& ul, & ol': { mb: 3, pl: 4 },
        '& li': { mb: 1 },
        '& blockquote': {
          borderLeft: '4px solid #6366F1',
          pl: 3,
          py: 1,
          my: 4,
          bgcolor: alpha('#6366F1', 0.05),
          borderRadius: '0 12px 12px 0',
          fontStyle: 'italic',
          color: 'rgba(255, 255, 255, 0.8)',
        },
        '& code': {
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          px: 1,
          py: 0.5,
          borderRadius: '6px',
          fontSize: '0.9em',
          fontFamily: 'monospace',
          color: '#6366F1',
        },
        '& pre': {
          bgcolor: 'rgba(0, 0, 0, 0.3)',
          p: 3,
          borderRadius: '16px',
          overflowX: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          my: 4,
          '& code': {
            bgcolor: 'transparent',
            p: 0,
            color: 'inherit',
          },
        },
        '& img': {
          maxWidth: '100%',
          borderRadius: '16px',
          my: 4,
        },
        '& hr': {
          border: 'none',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          my: 6,
        },
        '& a': {
          color: '#6366F1',
          textDecoration: 'none',
          fontWeight: 600,
          borderBottom: '1px solid transparent',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderBottomColor: '#6366F1',
          },
        },
      }}
    >
      {objectBlocks.map((node, index) => {
        if (node.type === 'text') {
          return <React.Fragment key={`node-${index}`}>{renderMarkdownText(node.content, `node-${index}`)}</React.Fragment>;
        }
        return <SecondaryObjectShell key={`obj-${index}`} payload={node.payload} />;
      })}
    </Box>
  );
}

function SecondaryObjectShell({ payload }: { payload: SecondaryObjectPayload }) {
  const [title, setTitle] = useState(payload.label || payload.href || `${payload.childKind}:${payload.childId}`);
  const [status, setStatus] = useState<'loading' | 'ready' | 'no-access'>('loading');
  const bucketId = payload.bucketId || APPWRITE_CONFIG.BUCKETS.GENERAL_STORAGE;
  const isImage = payload.childKind === 'image';

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      if (payload.childKind === 'link') {
        if (!active) return;
        setStatus('ready');
        return;
      }
      if (payload.childKind === 'file' || payload.childKind === 'image' || payload.childKind === 'voice') {
        if (!active) return;
        setStatus('ready');
        return;
      }
      try {
        const map: Record<string, { db: string; table: string }> = {
          task: { db: APPWRITE_CONFIG.DATABASES.FLOW, table: APPWRITE_CONFIG.TABLES.FLOW.TASKS },
          form: { db: APPWRITE_CONFIG.DATABASES.FLOW, table: APPWRITE_CONFIG.TABLES.FLOW.FORMS },
          note: { db: APPWRITE_CONFIG.DATABASES.NOTE, table: APPWRITE_CONFIG.TABLES.NOTE.NOTES },
          vault: { db: APPWRITE_CONFIG.DATABASES.VAULT, table: APPWRITE_CONFIG.TABLES.VAULT.CREDENTIALS },
        };
        const target = map[payload.childKind];
        if (!target) {
          setStatus('ready');
          return;
        }
        const row = await getRowSecure(target.db, target.table, payload.childId);
        if (!active) return;
        setTitle(row?.title || row?.name || title);
        setStatus('ready');
      } catch {
        if (!active) return;
        setStatus('no-access');
      }
    };
    void hydrate();
    return () => {
      active = false;
    };
  }, [payload.childId, payload.childKind, title]);

  const themeColor = payload.appTheme === 'vault' ? '#10B981' : payload.appTheme === 'flow' ? '#22C55E' : '#6366F1';

  return (
    <Box sx={{ my: 2, p: 1.5, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)' }}>
      {isImage ? (
        <Box
          component="img"
          src={StorageService.getFilePreview(payload.childId, bucketId, 720, 420).toString()}
          alt={payload.label || 'Attached image'}
          sx={{ maxWidth: '100%', borderRadius: '10px', display: 'block' }}
        />
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: themeColor, textTransform: 'uppercase' }}>
              {payload.childKind}
            </Typography>
            <Typography sx={{ fontSize: '0.92rem', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {status === 'loading' ? 'Loading preview...' : status === 'no-access' ? 'No access to this object' : title}
            </Typography>
          </Box>
          {(payload.childKind === 'file' || payload.childKind === 'voice') && (
            <Box
              component="a"
              href={StorageService.getFileView(payload.childId, bucketId).toString()}
              target="_blank"
              rel="noreferrer"
              sx={{ color: themeColor, fontSize: '0.8rem', fontWeight: 700 }}
            >
              Open
            </Box>
          )}
          {payload.childKind === 'link' && payload.href && (
            <Box component="a" href={payload.href} target="_blank" rel="noreferrer" sx={{ color: themeColor, fontSize: '0.8rem', fontWeight: 700 }}>
              Visit
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export default NoteContentRenderer;
