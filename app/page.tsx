'use client';

import React, { useMemo, useState } from 'react';
import {
  alpha,
  Box,
  Button,
  ButtonBase,
  Container,
  Divider,
  Fab,
  Grid,
  IconButton,
  Paper,
  Popover,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ArrowRight,
  LayoutGrid,
  Lock,
  Shield,
  Terminal,
  X,
  Zap,
} from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import NextLink from 'next/link';

import Navbar from '@/components/Navbar';
import Logo, { KylrixApp } from '@/components/Logo';
import { ECOSYSTEM_APPS, getEcosystemUrl } from '@/lib/ecosystem';

const appOrder = ['note', 'flow', 'vault', 'connect'] as const;

const heroMetrics = [
  { value: '01', label: 'shared session' },
  { value: '04', label: 'native apps' },
  { value: '24/7', label: 'sync-first shell' },
];

const designPrinciples = [
  {
    icon: Shield,
    title: 'Point, don\'t duplicate',
    copy: 'Each surface points back to the real table instead of cloning state into a second model.',
  },
  {
    icon: Zap,
    title: 'Pulse before notice',
    copy: 'Live interactions stay transient; only durable changes become notification pointers.',
  },
  {
    icon: Lock,
    title: 'Universal session',
    copy: 'One authenticated Appwrite session flows through Accounts, Vault, Flow, Connect, and Note.',
  },
];

function openApp(subdomain: string) {
  window.location.assign(getEcosystemUrl(subdomain));
}

function AppSwitcherFab() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const theme = useTheme();
  const open = Boolean(anchorEl);

  const items = useMemo(
    () =>
      appOrder
        .map((id) => ECOSYSTEM_APPS.find((app) => app.id === id))
        .filter((app): app is (typeof ECOSYSTEM_APPS)[number] => Boolean(app)),
    [],
  );

  return (
    <>
      <Fab
        color="primary"
        aria-label="Open ecosystem switcher"
        onClick={(event) => setAnchorEl(open ? null : event.currentTarget)}
        sx={{
          position: 'fixed',
          right: { xs: 16, md: 28 },
          bottom: { xs: 16, md: 28 },
          zIndex: theme.zIndex.appBar + 5,
          bgcolor: '#161514',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 18px 40px rgba(0, 0, 0, 0.55)',
          '&:hover': {
            bgcolor: '#1F1D1B',
          },
          '&.Mui-focusVisible': {
            boxShadow: `0 0 0 1px ${alpha('#6366F1', 0.55)}, 0 0 0 6px ${alpha('#6366F1', 0.18)}`,
          },
        }}
      >
        <LayoutGrid size={22} />
      </Fab>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 2,
            width: 320,
            overflow: 'hidden',
            borderRadius: 4,
            bgcolor: 'var(--surface)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundImage: 'none',
            boxShadow: '0 32px 70px rgba(0, 0, 0, 0.72)',
          },
        }}
        transitionDuration={reduceMotion ? 0 : 180}
      >
        <Box sx={{ p: 2.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.45)' }}>
                Ecosystem
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 0.5, fontWeight: 800, color: '#fff' }}>
                Jump between apps
              </Typography>
            </Box>
            <IconButton
              onClick={() => setAnchorEl(null)}
              aria-label="Close ecosystem switcher"
              size="small"
              sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              <X size={18} />
            </IconButton>
          </Stack>

          <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

          <Stack spacing={1}>
            {items.map((app) => (
              <ButtonBase
                key={app.id}
                onClick={() => {
                  setAnchorEl(null);
                  openApp(app.subdomain);
                }}
                sx={{
                  width: '100%',
                  textAlign: 'left',
                  borderRadius: 3,
                  transition: reduceMotion ? 'none' : 'transform 150ms ease-out, background-color 150ms ease-out',
                  '&:hover': {
                    transform: reduceMotion ? 'none' : 'translateY(-1px)',
                    bgcolor: 'rgba(255, 255, 255, 0.04)',
                  },
                  '&.Mui-focusVisible': {
                    boxShadow: `0 0 0 1px ${alpha('#6366F1', 0.5)}, 0 0 0 6px ${alpha('#6366F1', 0.16)}`,
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <Logo app={app.id as KylrixApp} size={34} variant="icon" />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#fff' }}>
                      {app.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.45)' }}>
                      {app.description}
                    </Typography>
                  </Box>
                </Stack>
              </ButtonBase>
            ))}
          </Stack>
        </Box>
      </Popover>
    </>
  );
}

function AppCard({ app }: { app: (typeof ECOSYSTEM_APPS)[number] }) {
  const reduceMotion = useReducedMotion();

  return (
    <ButtonBase
      onClick={() => openApp(app.subdomain)}
      sx={{
        width: '100%',
        height: '100%',
        textAlign: 'left',
        borderRadius: 5,
        display: 'block',
        transition: reduceMotion ? 'none' : 'transform 150ms ease-out',
        '&:hover .card-shell': {
          transform: reduceMotion ? 'none' : 'translateY(-4px)',
        },
        '&.Mui-focusVisible .card-shell': {
          boxShadow: `0 0 0 1px ${alpha(app.color, 0.55)}, 0 0 0 6px ${alpha(app.color, 0.16)}`,
        },
      }}
    >
      <Paper
        className="card-shell"
        sx={{
          height: '100%',
          p: 3,
          bgcolor: 'var(--surface)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 5,
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.42)',
          transition: reduceMotion ? 'none' : 'transform 150ms ease-out, box-shadow 150ms ease-out',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at top left, ${alpha(app.color, 0.16)}, transparent 45%)`,
            pointerEvents: 'none',
          },
        }}
      >
        <Stack spacing={3} sx={{ position: 'relative' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Logo app={app.id as KylrixApp} size={44} variant="icon" />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: alpha(app.color, 0.9),
              }}
            >
              {app.label}
            </Typography>
          </Stack>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 1 }}>
              {app.label}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.8 }}>
              {app.description}{' '}
              {app.id === 'note' && 'Private notes, linked context, and clean retrieval without public leakage.'}
              {app.id === 'flow' && 'Tasks, calendars, and workflow state that resolve the current user first.'}
              {app.id === 'vault' && 'Zero-knowledge storage for credentials, TOTP, and recovery-critical secrets.'}
              {app.id === 'connect' && 'Messages and calls that stay live through the shared session graph.'}
            </Typography>
          </Box>

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: alpha(app.color, 0.95),
              }}
            >
              Open surface
            </Typography>
            <ArrowRight size={16} color={app.color} />
          </Stack>
        </Stack>
      </Paper>
    </ButtonBase>
  );
}

export default function LandingPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const reduceMotion = useReducedMotion();

  const apps = useMemo(() => ECOSYSTEM_APPS.filter((app) => app.type === 'app'), []);

  const handleGetStarted = () => {
    const accountsUrl = getEcosystemUrl('accounts');
    const sourceUrl = window.location.origin;
    const targetUrl = `${accountsUrl}/login?source=${encodeURIComponent(sourceUrl)}`;

    if (isMobile) {
      window.location.assign(targetUrl);
      return;
    }

    const width = 560;
    const height = 760;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      targetUrl,
      'KylrixAccounts',
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`,
    );
  };

  return (
    <Box component="main" sx={{ pt: { xs: 10, md: 12 }, pb: { xs: 10, md: 14 } }}>
      <Navbar />

      <Container maxWidth="xl" sx={{ position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            inset: { xs: '-8rem -2rem auto -2rem', md: '-12rem -6rem auto -6rem' },
            height: { xs: 440, md: 560 },
            pointerEvents: 'none',
            background: `
              radial-gradient(circle at 18% 18%, ${alpha('#6366F1', 0.18)} 0, transparent 28%),
              radial-gradient(circle at 82% 12%, ${alpha('#F59E0B', 0.1)} 0, transparent 26%),
              radial-gradient(circle at 50% 60%, ${alpha('#EC4899', 0.08)} 0, transparent 34%)
            `,
            opacity: 0.9,
          }}
        />

        <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center" sx={{ position: 'relative', py: { xs: 4, md: 8 } }}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Stack spacing={4} sx={{ maxWidth: 820 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.5,
                  width: 'fit-content',
                  px: 1.75,
                  py: 1,
                  borderRadius: 999,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Logo app="root" size={24} variant="icon" />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.72)',
                  }}
                >
                  Reactive graph / premium shell
                </Typography>
              </Box>

              <Box>
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: '3rem', sm: '4.2rem', lg: '5.8rem' },
                    lineHeight: 0.94,
                    letterSpacing: '-0.06em',
                    fontWeight: 900,
                    color: '#fff',
                    textWrap: 'balance',
                  }}
                >
                  One login.
                  <Box component="span" sx={{ display: 'block', color: '#6366F1' }}>
                    Four surfaces.
                  </Box>
                  One system.
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    mt: 3,
                    maxWidth: 760,
                    color: 'rgba(255, 255, 255, 0.68)',
                    lineHeight: 1.8,
                    fontWeight: 400,
                  }}
                >
                  Kylrix binds Accounts, Note, Flow, Vault, and Connect into one premium session layer so the
                  product feels like a single instrument instead of five disconnected apps.
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  size="large"
                  variant="contained"
                  onClick={handleGetStarted}
                  sx={{
                    px: 4,
                    py: 1.6,
                    borderRadius: 999,
                    fontWeight: 800,
                    bgcolor: '#6366F1',
                    color: '#fff',
                    boxShadow: `0 18px 40px ${alpha('#6366F1', 0.24)}`,
                    '&:hover': { bgcolor: '#5254E8' },
                  }}
                >
                  Get started
                </Button>

                <Button
                  size="large"
                  variant="outlined"
                  component={NextLink}
                  href="/docs"
                  sx={{
                    px: 4,
                    py: 1.6,
                    borderRadius: 999,
                    fontWeight: 800,
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.28)',
                      bgcolor: 'rgba(255, 255, 255, 0.04)',
                    },
                  }}
                >
                  Read the docs
                </Button>
              </Stack>

              <Grid container spacing={2}>
                {heroMetrics.map((metric) => (
                  <Grid size={{ xs: 12, sm: 4 }} key={metric.label}>
                    <Paper
                      sx={{
                        p: 2.25,
                        borderRadius: 4,
                        bgcolor: 'var(--surface)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          fontFamily: 'var(--font-mono)',
                          fontVariantNumeric: 'tabular-nums',
                          fontWeight: 700,
                          color: '#fff',
                          lineHeight: 1,
                        }}
                      >
                        {metric.value}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                        {metric.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 6,
                bgcolor: 'var(--surface)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(135deg, ${alpha('#6366F1', 0.08)}, transparent 42%)`,
                  pointerEvents: 'none',
                }}
              />

              <Stack spacing={3} sx={{ position: 'relative' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                  <Logo app="root" size={58} />
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255, 255, 255, 0.45)', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 800 }}>
                      System shell
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                      Premium, quiet, connected
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
                    <Terminal size={18} color="#6366F1" />
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 800 }}>
                      Kylrix session
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#fff',
                      fontFamily: 'var(--font-mono)',
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1.9,
                    }}
                  >
                    <Box component="span" sx={{ color: '#6366F1' }}>$</Box> auth.resolve --shared-session
                    <br />
                    <Box component="span" sx={{ opacity: 0.55 }}>&gt; accounts online</Box>
                    <br />
                    <Box component="span" sx={{ opacity: 0.55 }}>&gt; note, flow, vault, connect ready</Box>
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {apps.map((app) => (
                    <Grid size={{ xs: 6 }} key={app.id}>
                      <Box
                        sx={{
                          p: 1.75,
                          borderRadius: 4,
                          bgcolor: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                        }}
                      >
                        <Logo app={app.id as KylrixApp} size={28} variant="icon" />
                        <Box>
                          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 800 }}>
                            {app.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha(app.color, 0.9) }}>
                            {app.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Container maxWidth="xl" sx={{ mt: { xs: 6, md: 10 } }}>
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              color: '#6366F1',
              fontWeight: 900,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Flagship apps
          </Typography>
          <Typography variant="h2" sx={{ color: '#fff', fontWeight: 900, letterSpacing: '-0.04em' }}>
            Real marks. Real surfaces.
          </Typography>
        </Stack>

        <Grid container spacing={2.5}>
          {apps.map((app) => (
            <Grid key={app.id} size={{ xs: 12, sm: 6, xl: 3 }}>
              <AppCard app={app} />
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container maxWidth="xl" sx={{ mt: { xs: 8, md: 12 } }}>
        <Grid container spacing={2.5}>
          {designPrinciples.map((item) => (
            <Grid key={item.title} size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 5,
                  bgcolor: 'var(--surface)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <Stack spacing={2.25}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: alpha('#6366F1', 0.12),
                      color: '#6366F1',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <item.icon size={22} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, mb: 1 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.62)', lineHeight: 1.8 }}>
                      {item.copy}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container maxWidth="xl" sx={{ mt: { xs: 8, md: 12 } }}>
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 6,
            bgcolor: 'var(--surface)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h3" sx={{ color: '#fff', fontWeight: 900, letterSpacing: '-0.04em', mb: 1 }}>
                Premium enough to lead with, quiet enough to live in.
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.62)', lineHeight: 1.8, maxWidth: 760 }}>
                Kylrix is built to look like a serious system: crisp typography, true app marks, a black canvas,
                and one shell that routes you to the right product without modal noise.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleGetStarted}
                  sx={{
                    borderRadius: 999,
                    bgcolor: '#6366F1',
                    color: '#fff',
                    fontWeight: 800,
                    '&:hover': { bgcolor: '#5254E8' },
                  }}
                >
                  Open Accounts
                </Button>
                <Button
                  variant="outlined"
                  component={NextLink}
                  href="/pricing"
                  sx={{
                    borderRadius: 999,
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontWeight: 800,
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.28)',
                      bgcolor: 'rgba(255, 255, 255, 0.04)',
                    },
                  }}
                >
                  View pricing
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      <Container maxWidth="xl" sx={{ mt: { xs: 8, md: 12 } }}>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 3 }} />
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          sx={{ pb: { xs: 8, md: 10 } }}
        >
          <Box>
            <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255, 255, 255, 0.42)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800 }}>
              Kylrix.space
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.62)', mt: 1, maxWidth: 680 }}>
              One system, one session, one premium surface for the entire ecosystem.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button component={NextLink} href="/docs" variant="text" sx={{ color: '#fff', fontWeight: 800 }}>
              Docs
            </Button>
            <Button component={NextLink} href="/downloads" variant="text" sx={{ color: '#fff', fontWeight: 800 }}>
              Downloads
            </Button>
          </Stack>
        </Stack>
      </Container>

      <AppSwitcherFab />
    </Box>
  );
}
