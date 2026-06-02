"use client";

import { useEffect } from 'react';
import { Box, Container, Stack, Typography, Button, CircularProgress } from '@/lib/mui-tailwind/material';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAppwriteVault } from '@/context/appwrite-context';

const PasswordGenerator = dynamic(() => import('@/components/ui/PasswordGenerator'), { ssr: false });

export default function LandingPage() {
  const { user, isAuthReady, isAuthenticated, openIDMWindow, isAuthenticating } = useAppwriteVault();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthReady) return;
    if (isAuthenticated && user) {
      router.replace('/vault/dashboard');
    }
  }, [isAuthReady, isAuthenticated, user, router]);

  if (!isAuthReady || (isAuthenticated && user)) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 88px)', bgcolor: '#0A0908' }}>
        <CircularProgress sx={{ color: '#10B981' }} />
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 88px)',
      color: 'white',
      bgcolor: '#0A0908',
    }}>
      <Box component="main" sx={{ flex: 1, py: { xs: 4, md: 8 } }}>
        <Container maxWidth="md">
          <Stack spacing={6}>
            <Box sx={{ textAlign: 'center', px: { xs: 1, sm: 0 } }}>
              <Typography component="span" variant="h3" sx={{
                display: 'block',
                fontWeight: 900,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' },
                color: '#10B981',
                lineHeight: 1.2,
              }}>
                Generate Secure Passwords
              </Typography>
              <Typography component="span" variant="body1" sx={{
                display: 'block',
                color: 'rgba(255, 255, 255, 0.6)',
                maxWidth: '500px',
                mx: 'auto',
                lineHeight: 1.6,
                fontSize: '1.05rem',
              }}>
                Create powerful, random passwords instantly. No sign-up required. Keep them safe with your vault when you&apos;re ready.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: '100%', maxWidth: '500px' }}>
                <PasswordGenerator />
              </Box>
            </Box>

            <Box sx={{
              textAlign: 'center',
              pt: 4,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              mt: 2,
            }}>
              <Stack spacing={3} alignItems="center">
                <Typography component="span" variant="body2" sx={{
                  display: 'block',
                  color: 'rgba(255, 255, 255, 0.5)',
                  mb: 2,
                  fontWeight: 500,
                  lineHeight: 1.45,
                }}>
                  Ready to securely manage all your passwords?
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  disabled={isAuthenticating}
                  onClick={() => {
                    try {
                      openIDMWindow();
                    } catch (err: unknown) {
                      alert(err instanceof Error ? err.message : 'Failed to open authentication');
                    }
                  }}
                  sx={{
                    bgcolor: '#10B981',
                    color: '#000',
                    px: 5,
                    py: 1.75,
                    borderRadius: '16px',
                    fontWeight: 900,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.25)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: '#0d9b70',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 35px rgba(16, 185, 129, 0.35)',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  {isAuthenticating ? <CircularProgress size={20} color="inherit" /> : 'Sign In to Vault'}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Box component="footer" sx={{
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        py: 6,
        textAlign: 'center',
        bgcolor: '#0A0908',
      }}>
        <Typography component="span" variant="caption" sx={{
          display: 'block',
          color: 'rgba(255, 255, 255, 0.2)',
          fontWeight: 700,
          letterSpacing: '0.1em',
          lineHeight: 1.35,
        }}>
          © 2026 KYLRIX VAULT. ZERO-KNOWLEDGE PASSWORD MANAGEMENT.
        </Typography>
      </Box>
    </Box>
  );
}
