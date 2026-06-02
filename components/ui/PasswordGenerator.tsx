"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Slider,
  IconButton,
  Stack,
  Switch,
  FormControlLabel,
  Paper,
  List,
  ListItem,
  Tooltip,
} from '@/lib/mui-tailwind/material';
import {
  ContentCopy as ContentCopyIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
} from '@/lib/mui-tailwind/icons';
import { generateRandomPassword } from '@/utils/password';
import toast from 'react-hot-toast';

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState(() => generateRandomPassword(16));
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<{ value: string; ts: number }[]>([]);

  useEffect(() => {
    setPassword(generateRandomPassword(length));
  }, [length]);

  const handleGenerate = () => {
    const newPassword = generateRandomPassword(length);
    setPassword(newPassword);
    setCopied(false);
    setHistory((prev) => {
      const next = [{ value: newPassword, ts: Date.now() }, ...prev];
      return next.slice(0, 20);
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
    toast.success('Copied to clipboard', {
      style: {
        background: '#161412',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        color: 'white',
      },
    });
  };

  const handleLengthChange = (_: unknown, val: number | number[]) => {
    setLength(val as number);
  };

  return (
    <Paper sx={{
      p: 2.5,
      width: '100%',
      maxWidth: 420,
      bgcolor: '#161412',
      border: '1px solid #34322F',
      borderRadius: '28px',
      backgroundImage: 'none',
      boxShadow: 'none',
    }}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
          <Typography
            component="span"
            sx={{
              fontWeight: 900,
              fontFamily: 'var(--font-clash)',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              fontSize: '0.85rem',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: 1.25,
            }}
          >
            Password Generator
          </Typography>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showHistory}
                onChange={(e) => setShowHistory(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#10B981' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#10B981' },
                }}
              />
            }
            label={
              <Typography component="span" sx={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.05em', fontSize: '0.7rem', lineHeight: 1.2 }}>
                HISTORY
              </Typography>
            }
            labelPlacement="start"
          />
        </Box>

        {/* Password display — topbar quick-actions row pattern (px 2.25 / py 1.5) */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2.25,
            py: 1.75,
            borderRadius: '20px',
            bgcolor: '#1C1A18',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            minHeight: 56,
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.35, pr: 0.5 }}>
            <Typography
              component="span"
              sx={{
                fontFamily: 'var(--font-mono)',
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                fontWeight: 600,
                color: '#10B981',
                lineHeight: 1.35,
                wordBreak: 'break-all',
                display: 'block',
              }}
            >
              {password}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
            <Tooltip title="Copy">
              <IconButton onClick={handleCopy} size="small" sx={{ color: copied ? '#10B981' : 'rgba(255, 255, 255, 0.35)' }}>
                <ContentCopyIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Regenerate">
              <IconButton onClick={handleGenerate} size="small" sx={{ color: 'rgba(255, 255, 255, 0.35)' }}>
                <RefreshIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, px: 0.5 }}>
            <Typography component="span" sx={{ fontWeight: 800, color: 'rgba(255, 255, 255, 0.3)', letterSpacing: '0.1em', fontSize: '0.7rem', lineHeight: 1.25 }}>
              LENGTH
            </Typography>
            <Typography component="span" sx={{ fontWeight: 900, color: '#10B981', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.25 }}>
              {length} CHR
            </Typography>
          </Box>
          <Slider
            value={length}
            min={8}
            max={64}
            onChange={handleLengthChange}
            sx={{
              color: '#10B981',
              height: 6,
              px: 0.5,
              '& .MuiSlider-thumb': {
                width: 20,
                height: 20,
                bgcolor: '#10B981',
                border: '4px solid #161412',
                '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 0 8px rgba(16, 185, 129, 0.16)' },
              },
              '& .MuiSlider-track': { border: 'none' },
              '& .MuiSlider-rail': { opacity: 0.1, bgcolor: 'white' },
            }}
          />
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={handleGenerate}
          sx={{
            bgcolor: '#10B981',
            color: '#000',
            fontWeight: 900,
            borderRadius: '18px',
            py: 1.75,
            fontFamily: 'var(--font-clash)',
            fontSize: '0.9rem',
            letterSpacing: '0.02em',
            lineHeight: 1.25,
            '&:hover': { bgcolor: '#059669' },
            transition: 'background-color 0.2s ease',
          }}
        >
          Generate Password
        </Button>

        {showHistory && (
          <Box sx={{ pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5, px: 0.5 }}>
              <HistoryIcon sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.4)' }} />
              <Typography component="span" sx={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.7rem', lineHeight: 1.25 }}>
                RECENT PASSWORDS
              </Typography>
            </Stack>
            {history.length === 0 ? (
              <Typography component="span" sx={{ display: 'block', color: 'rgba(255, 255, 255, 0.3)', fontStyle: 'italic', fontSize: '0.8rem', lineHeight: 1.45, px: 0.5 }}>
                No history yet.
              </Typography>
            ) : (
              <List sx={{ p: 0, maxHeight: 160, overflowY: 'auto' }}>
                {history.map((item, i) => (
                  <ListItem
                    key={i}
                    sx={{
                      px: 2.25,
                      py: 1.5,
                      borderRadius: '14px',
                      mb: 0.75,
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.35 }}>
                      <Typography
                        component="span"
                        sx={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.85rem',
                          lineHeight: 1.35,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block',
                        }}
                      >
                        {item.value}
                      </Typography>
                      <Typography component="span" sx={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.65rem', lineHeight: 1.3 }}>
                        {new Date(item.ts).toLocaleTimeString()}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(item.value);
                        toast.success('Copied from history');
                      }}
                      sx={{ color: 'rgba(255, 255, 255, 0.3)', flexShrink: 0 }}
                    >
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
