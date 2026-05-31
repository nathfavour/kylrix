'use client';

import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, Stack, alpha, Switch, FormControlLabel, useTheme, useMediaQuery } from '@mui/material';
import { X } from 'lucide-react';
import Drawer from '@mui/material/Drawer';
import { useDrawerState } from '@/components/ui/DrawerStateContext';
import toast from 'react-hot-toast';

import { GoogleAuthAdapter } from '@/lib/integrations/google/auth';

export function GoogleIntegrationDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { setIsDrawerOpen } = useDrawerState();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [googleSyncKeep, setGoogleSyncKeep] = useState(true);
  const [googleSyncCalendar, setGoogleSyncCalendar] = useState(true);
  const [googleSyncDrive, setGoogleSyncDrive] = useState(false);
  const [googleSyncTasks, setGoogleSyncTasks] = useState(true);

  React.useEffect(() => {
    setIsDrawerOpen(isOpen);
    
    if (isOpen) {
      // Check if already connected on open
      const currentUser = GoogleAuthAdapter.getCurrentUser();
      if (currentUser) {
        setGoogleConnected(true);
        setGoogleUser(currentUser);
      }
    }
  }, [isOpen, setIsDrawerOpen]);

  const handleToggleConnection = async () => {
    if (googleConnected) {
      await GoogleAuthAdapter.logout();
      setGoogleConnected(false);
      setGoogleUser(null);
      toast.success('Google Suite disconnected.');
    } else {
      setIsAuthenticating(true);
      try {
        const result = await GoogleAuthAdapter.signIn();
        if (result?.user) {
          setGoogleConnected(true);
          setGoogleUser(result.user);
          toast.success('Google Suite integrated successfully!');
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to connect Google account.');
      } finally {
        setIsAuthenticating(false);
      }
    }
  };

  return (
    <Drawer 
        anchor={isDesktop ? 'right' : 'bottom'} 
        open={isOpen} 
        onClose={onClose} 
        PaperProps={{ 
            sx: {
                bgcolor: '#161412', // Deep Ash
                backgroundImage: 'none',
                color: '#fff',
                ...(isDesktop ? {
                    height: '100%',
                    maxWidth: 480,
                    width: '100%',
                    borderLeft: '1px solid #1C1A18',
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                } : {
                    borderTopLeftRadius: '28px',
                    borderTopRightRadius: '28px',
                    borderTop: '1px solid #1C1A18', // Rim/Border Ash
                    maxWidth: 720,
                    width: '100%',
                    mx: 'auto',
                })
            } 
        }} 
        ModalProps={{ keepMounted: false, disableScrollLock: false }}
    >
      <Box sx={{ p: 3, pb: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#fff', fontFamily: 'var(--font-clash)', letterSpacing: '-0.02em' }}>
              Google Suite Integration
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', mt: 0.5 }}>
              Connect your Google workspace to sync Keep, Drive, Tasks, and Calendars.
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)' }}><X size={20} /></IconButton>
        </Box>

        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
             <Button 
                variant={googleConnected ? 'outlined' : 'contained'}
                onClick={handleToggleConnection}
                disabled={isAuthenticating}
                sx={{ 
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 800,
                    width: '100%',
                    py: 1.5,
                    ...(googleConnected 
                        ? { borderColor: '#34322F', color: '#fff', '&:hover': { borderColor: '#4A4845', bgcolor: 'rgba(255,255,255,0.02)' } }
                        : { bgcolor: '#6366F1', '&:hover': { bgcolor: '#5458E8' } })
                }}
            >
                {isAuthenticating ? 'Connecting...' : (googleConnected ? "Disconnect Account" : "Connect Google Account")}
            </Button>
          </Box>

          {googleConnected && (
            <Stack spacing={1}>
                <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#0A0908', border: '1px solid #1C1A18' }}>
                    <FormControlLabel
                        control={<Switch checked={googleSyncKeep} onChange={(e) => setGoogleSyncKeep(e.target.checked)} color="primary" />}
                        label={
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: 'white' }}>Google Keep Sync</Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Two-way sync with Kylrix Notes.</Typography>
                            </Box>
                        }
                        sx={{ m: 0, width: '100%', justifyContent: 'space-between', flexDirection: 'row-reverse' }}
                    />
                </Box>
                <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#0A0908', border: '1px solid #1C1A18' }}>
                    <FormControlLabel
                        control={<Switch checked={googleSyncCalendar} onChange={(e) => setGoogleSyncCalendar(e.target.checked)} color="primary" />}
                        label={
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: 'white' }}>Google Calendar Connections</Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Sync tasks and project events.</Typography>
                            </Box>
                        }
                        sx={{ m: 0, width: '100%', justifyContent: 'space-between', flexDirection: 'row-reverse' }}
                    />
                </Box>
                <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#0A0908', border: '1px solid #1C1A18' }}>
                    <FormControlLabel
                        control={<Switch checked={googleSyncTasks} onChange={(e) => setGoogleSyncTasks(e.target.checked)} color="primary" />}
                        label={
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: 'white' }}>Google Tasks Sync</Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Mirror Kylrix Flow items to Google Tasks.</Typography>
                            </Box>
                        }
                        sx={{ m: 0, width: '100%', justifyContent: 'space-between', flexDirection: 'row-reverse' }}
                    />
                </Box>
                <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#0A0908', border: '1px solid #1C1A18' }}>
                    <FormControlLabel
                        control={<Switch checked={googleSyncDrive} onChange={(e) => setGoogleSyncDrive(e.target.checked)} color="primary" />}
                        label={
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: 'white' }}>Google Drive Picker</Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Attach files directly from Drive.</Typography>
                            </Box>
                        }
                        sx={{ m: 0, width: '100%', justifyContent: 'space-between', flexDirection: 'row-reverse' }}
                    />
                </Box>
            </Stack>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
