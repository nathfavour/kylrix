'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  alpha,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { authenticator } from 'otplib';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { ArrowLeft, Check, Copy, Eye, EyeOff, KeyRound, ListTodo, Shield, Sparkles, FileText, Upload } from 'lucide-react';

import Logo from '@/components/Logo';
import { storage } from '@/lib/appwrite/client';
import { decryptGhostBinaryFromBytes, decryptGhostData } from '@/lib/encryption/ghost-crypto';
import { isSendObjectMeta, parseSendGhostMetadata } from '@/lib/send/metadata';
import { sharedNotePublicUrl } from '@/lib/send/shared-note-api';
import type { SendFilePayload, SendKind, SendPasswordPayload, SendTaskPayload, SendTotpPayload } from '@/lib/send/types';

const SURFACE = '#161412';
const RIM = '1px solid #34322F';
const PRIMARY = '#6366F1';

const readOnlyFieldSx = {
  '& .MuiOutlinedInput-root': { bgcolor: '#000000', borderRadius: '12px' },
  '& .MuiInputLabel-root': { color: '#9B9691', fontFamily: 'var(--font-satoshi)' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#34322F' },
  '& .MuiInputBase-input': { color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' },
} as const;

interface Props {
  noteId: string;
  keyParam?: string;
}

export function SendReceiveClient({ noteId, keyParam }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<SendKind | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [titlePlain, setTitlePlain] = useState('');
  const [noteMarkdown, setNoteMarkdown] = useState('');
  const [passwordPayload, setPasswordPayload] = useState<SendPasswordPayload | null>(null);
  const [totpPayload, setTotpPayload] = useState<SendTotpPayload | null>(null);
  const [taskPayload, setTaskPayload] = useState<SendTaskPayload | null>(null);
  const [fileManifest, setFileManifest] = useState<SendFilePayload | null>(null);
  const [fileBlobUrl, setFileBlobUrl] = useState<string | null>(null);
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [totpLive, setTotpLive] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const hasKey = Boolean(keyParam?.trim());

  const tickTotp = useCallback((secret: string) => {
    try {
      authenticator.options = {
        ...authenticator.options,
        step: 30,
        digits: 6,
        algorithm: 'sha1',
      } as typeof authenticator.options;
      const normalized = secret.replace(/\s+/g, '').toUpperCase();
      const code = authenticator.generate(normalized);
      setTotpLive(code);
    } catch {
      setTotpLive('—');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let revokeObjectUrl: string | null = null;

    const run = async () => {
      setLoading(true);
      setError(null);
      setNoteMarkdown('');
      setPasswordPayload(null);
      setTotpPayload(null);
      setTaskPayload(null);
      setFileManifest(null);
      setFileBlobUrl(null);
      setTextPreview(null);

      try {
        const res = await fetch(sharedNotePublicUrl(noteId), { cache: 'no-store' });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Could not load this send link.');
        }
        const note = await res.json();
        const meta = parseSendGhostMetadata(note.metadata);

        if (!isSendObjectMeta(meta)) {
          throw new Error('This link is not a Send object. Open it as a shared note instead.');
        }

        if (meta.expiresAt && new Date(meta.expiresAt) < new Date()) {
          throw new Error('This send link has expired.');
        }

        setExpiresAt(meta.expiresAt || null);
        setKind(meta.send_object.kind);

        if (!hasKey) {
          throw new Error('This send link needs the full URL including the decryption key.');
        }

        const dk = keyParam?.trim() || '';
        const isEncrypted = note.isEncrypted === true;

        if (isEncrypted && !hasKey) {
          throw new Error('This send link needs the full URL including the decryption key.');
        }

        const plainTitle = isEncrypted ? await decryptGhostData(note.title || '', dk) : (note.title || '');
        const plainContent = isEncrypted ? await decryptGhostData(note.content || '', dk) : (note.content || '');

        setTitlePlain(plainTitle);

        switch (meta.send_object.kind) {
          case 'note':
          case 'discussion':
            setNoteMarkdown(plainContent);
            break;
          case 'password': {
            let parsed: SendPasswordPayload;
            try {
              parsed = JSON.parse(plainContent) as SendPasswordPayload;
            } catch {
              throw new Error('Invalid password payload.');
            }
            setPasswordPayload(parsed);
            if (parsed.totpSecret) {
              tickTotp(parsed.totpSecret);
            }
            break;
          }
          case 'totp': {
            let parsed: SendTotpPayload;
            try {
              parsed = JSON.parse(plainContent) as SendTotpPayload;
            } catch {
              throw new Error('Invalid TOTP payload.');
            }
            setTotpPayload(parsed);
            tickTotp(parsed.secret);
            break;
          }
          case 'task': {
            let parsed: SendTaskPayload;
            try {
              parsed = JSON.parse(plainContent) as SendTaskPayload;
            } catch {
              throw new Error('Invalid task payload.');
            }
            setTaskPayload(parsed);
            break;
          }
          case 'file': {
            let manifest: SendFilePayload;
            try {
              manifest = JSON.parse(plainContent) as SendFilePayload;
            } catch {
              throw new Error('Invalid file manifest.');
            }
            const bucketId = meta.send_object?.bucketId || manifest.bucketId;
            const fileId = meta.send_object?.fileId || manifest.fileId;
            if (!bucketId || !fileId) {
              throw new Error('Incomplete file manifest.');
            }
            manifest = { ...manifest, bucketId, fileId };

            const downloadUrl = storage.getFileDownload(bucketId, fileId);
            const fileRes = await fetch(downloadUrl);
            if (!fileRes.ok) {
              throw new Error('Could not download file.');
            }
            const fileBuf = await fileRes.arrayBuffer();
            const plainBuf = isEncrypted ? decryptGhostBinaryFromBytes(fileBuf, dk) : fileBuf;
            const blob = new Blob([plainBuf], { type: manifest.mimeType || 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            revokeObjectUrl = url;

            if (!cancelled) {
              setFileManifest(manifest);
              setFileBlobUrl(url);
              const mime = manifest.mimeType || '';
              if (mime.startsWith('text/') || mime === 'application/json') {
                try {
                  setTextPreview(new TextDecoder().decode(plainBuf));
                } catch {
                  setTextPreview(null);
                }
              }
            }
            break;
          }
          default:
            throw new Error('Unknown send type.');
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Something went wrong.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
      if (revokeObjectUrl) {
        URL.revokeObjectURL(revokeObjectUrl);
      }
    };
  }, [noteId, keyParam, hasKey, tickTotp]);

  useEffect(() => {
    const secret = passwordPayload?.totpSecret || totpPayload?.secret || null;
    if (!secret) return;
    tickTotp(secret);
    const id = window.setInterval(() => tickTotp(secret), 1000);
    return () => window.clearInterval(id);
  }, [passwordPayload?.totpSecret, totpPayload?.secret, tickTotp]);

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(label);
      window.setTimeout(() => setCopiedField(null), 1800);
    } catch {
      setCopiedField(null);
    }
  };

  const expiryChip = useMemo(() => {
    if (!expiresAt) return null;
    const d = new Date(expiresAt);
    return (
      <Chip
        size="small"
        label={`Expires ${d.toLocaleString()}`}
        sx={{ bgcolor: alpha('#fff', 0.06), color: 'rgba(255,255,255,0.75)', border: RIM }}
      />
    );
  }, [expiresAt]);

  const kindIcon = useMemo(() => {
    switch (kind) {
      case 'note':
        return <FileText size={18} />;
      case 'password':
        return <KeyRound size={18} />;
      case 'totp':
        return <Shield size={18} />;
      case 'task':
        return <ListTodo size={18} />;
      case 'file':
        return <Upload size={18} />;
      default:
        return <Sparkles size={18} />;
    }
  }, [kind]);

  const fileMime = fileManifest?.mimeType || '';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0A0908', color: '#ffffff', fontFamily: 'var(--font-satoshi)' }}>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          borderBottom: '1px solid #34322F',
          bgcolor: '#0A0908',
        }}
      >
        <Container maxWidth="lg" sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            component={Link}
            href="/send"
            startIcon={<ArrowLeft size={18} />}
            sx={{
              color: 'rgba(255,255,255,0.65)',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { color: '#fff', bgcolor: alpha('#fff', 0.06) },
            }}
          >
            Send
          </Button>
          <Box sx={{ flex: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Logo variant="icon" size={26} />
            <Typography sx={{ fontFamily: 'var(--font-clash)', fontWeight: 600 }}>Receive</Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          {expiryChip}
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 }, pb: 10 }}>
        {loading && (
          <LinearProgress
            sx={{
              mb: 3,
              borderRadius: 1,
              bgcolor: alpha('#fff', 0.06),
              '& .MuiLinearProgress-bar': { bgcolor: PRIMARY },
            }}
          />
        )}

        {error && (
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: SURFACE, border: RIM, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Cannot open send</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.55)', mb: 2 }}>{error}</Typography>
            <Button
              component={Link}
              href={`/note/shared/${noteId}${keyParam ? `/${keyParam}` : ''}`}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Try shared note viewer
            </Button>
          </Paper>
        )}

        {!loading && !error && kind && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: '24px',
              bgcolor: '#161412',
              border: '1px solid #34322F',
              boxShadow: '0 4px 4px -4px rgba(0,0,0,0.9), 0 2px 3px -3px rgba(37,35,33,0.9)',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Stack spacing={2.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: alpha(PRIMARY, 0.12),
                    border: `1px solid ${alpha(PRIMARY, 0.35)}`,
                    color: PRIMARY,
                  }}
                >
                  {kindIcon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: '1.35rem', lineHeight: 1.2 }}>
                    {kind === 'file' ? fileManifest?.originalName || titlePlain || 'File' : titlePlain || 'Send'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', textTransform: 'capitalize' }}>{kind}</Typography>
                </Box>
              </Stack>

              {(kind === 'note' || kind === 'discussion') && (
                <Box
                  sx={{
                    '& p': { mb: 1.5, lineHeight: 1.65 },
                    '& pre': { bgcolor: alpha('#000', 0.35), p: 2, borderRadius: 2, overflow: 'auto' },
                    '& a': { color: PRIMARY },
                  }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                    {noteMarkdown}
                  </ReactMarkdown>
                  
                  {kind === 'discussion' && (
                    <Box sx={{ mt: 4, pt: 3, borderTop: RIM }}>
                      <Button
                        variant="contained"
                        component={Link}
                        href={`/note/shared/${noteId}${keyParam ? `/${keyParam}` : ''}`}
                        startIcon={<MessageSquare size={18} />}
                        fullWidth
                        sx={{ textTransform: 'none', fontWeight: 700, bgcolor: PRIMARY }}
                      >
                        Go to Thread
                      </Button>
                    </Box>
                  )}
                </Box>
              )}

              {kind === 'password' && passwordPayload && (
                <Stack spacing={2}>
                  {passwordPayload.username && (
                    <TextField
                      label="Username / URL"
                      value={passwordPayload.username}
                      fullWidth
                      InputProps={{ readOnly: true }}
                      sx={readOnlyFieldSx}
                    />
                  )}
                  <TextField
                    label="Password"
                    type={showPw ? 'text' : 'password'}
                    value={passwordPayload.password}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <IconButton onClick={() => setShowPw(!showPw)} edge="end" sx={{ color: 'rgba(255,255,255,0.55)' }}>
                          {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      ),
                    }}
                    sx={readOnlyFieldSx}
                  />
                  <Button variant="contained" onClick={() => copy('pw', passwordPayload.password)} sx={{ textTransform: 'none', fontWeight: 700, bgcolor: PRIMARY, color: '#ffffff', borderRadius: '12px', '&:hover': { bgcolor: '#5558E8' } }}>
                    {copiedField === 'pw' ? <Check size={18} style={{ marginRight: 8 }} /> : <Copy size={18} style={{ marginRight: 8 }} />}
                    Copy password
                  </Button>
                  {passwordPayload.totpSecret && (
                    <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#000000', border: '1px solid #34322F' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#9B9691', mb: 1, fontFamily: 'var(--font-satoshi)' }}>Authenticator</Typography>
                      <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, letterSpacing: '0.2em', color: '#ffffff' }}>{totpLive}</Typography>
                    </Paper>
                  )}
                </Stack>
              )}

              {kind === 'totp' && totpPayload && (
                <Stack spacing={2}>
                  {(totpPayload.issuer || totpPayload.account) && (
                    <Typography sx={{ color: 'rgba(255,255,255,0.65)' }}>
                      {[totpPayload.issuer, totpPayload.account].filter(Boolean).join(' · ')}
                    </Typography>
                  )}
                  <Paper sx={{ p: 3, borderRadius: '12px', bgcolor: '#000000', border: '1px solid #34322F', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#9B9691', mb: 1, fontFamily: 'var(--font-satoshi)' }}>Current code</Typography>
                    <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: 700, letterSpacing: '0.25em', color: '#ffffff' }}>{totpLive}</Typography>
                  </Paper>
                  <Button
                    variant="outlined"
                    onClick={() => copy('secret', totpPayload.secret)}
                    sx={{ 
                      textTransform: 'none', 
                      fontWeight: 700, 
                      borderColor: '#34322F', 
                      color: '#ffffff',
                      borderRadius: '12px',
                      fontFamily: 'var(--font-satoshi)',
                      '&:hover': { borderColor: '#4A4845', bgcolor: '#1C1A18' }
                    }}
                  >
                    {copiedField === 'secret' ? 'Copied secret' : 'Copy secret'}
                  </Button>
                </Stack>
              )}

              {kind === 'task' && taskPayload && (
                <Stack spacing={1.5}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{taskPayload.title}</Typography>
                  {taskPayload.detail && (
                    <Typography sx={{ color: 'rgba(255,255,255,0.65)', whiteSpace: 'pre-wrap' }}>{taskPayload.detail}</Typography>
                  )}
                  {taskPayload.dueAt && (
                    <Chip label={new Date(taskPayload.dueAt).toLocaleString()} sx={{ alignSelf: 'flex-start', bgcolor: alpha('#fff', 0.08) }} />
                  )}
                </Stack>
              )}

              {kind === 'file' && fileManifest && fileBlobUrl && (
                <Stack spacing={2}>
                  <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                    {fileManifest.size >= 1024 * 1024
                      ? `${(fileManifest.size / (1024 * 1024)).toFixed(2)} MB`
                      : `${(fileManifest.size / 1024).toFixed(1)} KB`}{' '}
                    · {fileMime || 'binary'}
                  </Typography>
                  <Button
                    variant="contained"
                    component="a"
                    href={fileBlobUrl}
                    download={fileManifest.originalName}
                    sx={{ textTransform: 'none', fontWeight: 700, bgcolor: PRIMARY }}
                  >
                    Download decrypted file
                  </Button>
                  {fileMime.startsWith('image/') && (
                    <Box
                      component="img"
                      src={fileBlobUrl}
                      alt={fileManifest.originalName}
                      sx={{ maxWidth: '100%', borderRadius: 2, border: RIM }}
                    />
                  )}
                  {fileMime === 'application/pdf' && (
                    <Box
                      component="iframe"
                      src={fileBlobUrl}
                      title={fileManifest.originalName}
                      sx={{ width: '100%', height: 480, border: 'none', borderRadius: '12px', bgcolor: '#000000' }}
                    />
                  )}
                  {textPreview !== null && (fileMime.startsWith('text/') || fileMime === 'application/json') && (
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        bgcolor: '#000000',
                        border: '1px solid #34322F',
                        maxHeight: 360,
                        overflow: 'auto',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.82rem',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {textPreview}
                    </Paper>
                  )}
                </Stack>
              )}
            </Stack>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
