'use client';

import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, Stack } from '@/lib/openbricks/primitives';
import { X, Globe, ShieldCheck, Ban } from 'lucide-react';
import { Drawer } from '@/lib/openbricks/primitives';
import { useDrawerState } from '@/components/ui/DrawerStateContext';
import { toggleResourcePublicGuest } from '@/lib/actions/client-ops';
import { useToast } from '@/hooks/useToast';

const DRAWER_SX = {
  borderTopLeftRadius: '24px',
  borderTopRightRadius: '24px',
  bgcolor: '#161412',
  borderTop: '1px solid #34322F',
  maxWidth: 720,
  width: '100%',
  mx: 'auto'
};

interface AccessControlDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: any;
  resourceId: string;
  isPublic: boolean;
  isGuest: boolean;
  resourceTitle: string;
  projectId?: string;
  onUpdate?: () => void;
}

export function AccessControlDrawer({
  isOpen,
  onClose,
  resourceType,
  resourceId,
  isPublic: initialIsPublic,
  isGuest: initialIsGuest,
  resourceTitle,
  projectId,
  onUpdate
}: AccessControlDrawerProps) {
  const { setIsDrawerOpen } = useDrawerState();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const [localIsPublic, setLocalIsPublic] = useState(initialIsPublic);
  const [localIsGuest, setLocalIsGuest] = useState(initialIsGuest);

  React.useEffect(() => {
    setIsDrawerOpen(isOpen);
    return () => setIsDrawerOpen(false);
  }, [isOpen, setIsDrawerOpen]);

  React.useEffect(() => {
    setLocalIsPublic(initialIsPublic);
    setLocalIsGuest(initialIsGuest);
  }, [initialIsPublic, initialIsGuest]);

  const handleTogglePublic = async (enable: boolean) => {
    setLoading(true);
    try {
      const res = await toggleResourcePublicGuest({
        resourceType,
        resourceId,
        mode: enable ? 'publish' : 'make_private',
        projectId
      });
      if (res.success) {
        showSuccess(enable ? 'Public access enabled' : 'Public access disabled');
        setLocalIsPublic(enable);
        if (!enable) {
          setLocalIsGuest(false);
        }
        onUpdate?.();
      }
    } catch (err: any) {
      showError('Failed to update public access: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGuest = async (enable: boolean) => {
    if (!localIsPublic && enable) return;
    setLoading(true);
    try {
      const res = await toggleResourcePublicGuest({
        resourceType,
        resourceId,
        mode: enable ? 'guest_on' : 'guest_off',
        projectId
      });
      if (res.success) {
        showSuccess(enable ? 'Guest access enabled' : 'Guest access disabled');
        setLocalIsGuest(enable);
        onUpdate?.();
      }
    } catch (err: any) {
      showError('Failed to update guest access: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStopSharingGuests = async () => {
    await handleToggleGuest(false);
  };

  const handleStopSharingEntirely = async () => {
    await handleTogglePublic(false);
  };

  const isActive = localIsPublic || localIsGuest;

  return (
    <Drawer 
      anchor="bottom" 
      open={isOpen} 
      onClose={onClose} 
      PaperProps={{ sx: DRAWER_SX }} 
      ModalProps={{ keepMounted: false, disableScrollLock: false, disablePortal: true }}
    >
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff', fontFamily: 'var(--font-clash)' }}>
            {isActive ? 'Stop Sharing' : 'Share'} - {resourceTitle}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: '#9B9691' }}><X size={20} /></IconButton>
        </Box>

        <Typography sx={{ color: '#9B9691', fontSize: '0.85rem', mb: 4 }}>
          Manage guest and public access for this {resourceType}.
        </Typography>

        <Stack spacing={3} sx={{ mb: 4 }}>
          {/* Public Access Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bg: '#1C1A18', borderRadius: '16px', border: '1px solid #34322F' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Globe size={20} className={localIsPublic ? 'text-[#10B981]' : 'text-[#9B9691]'} />
              <Box>
                <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>Public Access</Typography>
                <Typography sx={{ color: '#9B9691', fontSize: '0.75rem' }}>Anyone with the link can view this.</Typography>
              </Box>
            </Box>
            <Button
              onClick={() => handleTogglePublic(!localIsPublic)}
              disabled={loading}
              sx={{
                bgcolor: localIsPublic ? '#10B981' : '#34322F',
                color: '#fff',
                fontWeight: 'bold',
                px: 3,
                py: 1,
                borderRadius: '12px',
                '&:hover': { bgcolor: localIsPublic ? '#0D9488' : '#45423E' }
              }}
            >
              {localIsPublic ? 'Enabled' : 'Enable'}
            </Button>
          </Box>

          {/* Guest Access Toggle */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 2, 
            bg: '#1C1A18', 
            borderRadius: '16px', 
            border: '1px solid #34322F',
            opacity: localIsPublic ? 1 : 0.5
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ShieldCheck size={20} className={localIsGuest && localIsPublic ? 'text-[#10B981]' : 'text-[#9B9691]'} />
              <Box>
                <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>Guest Access</Typography>
                <Typography sx={{ color: '#9B9691', fontSize: '0.75rem' }}>Allow guests to collaborate or comment.</Typography>
              </Box>
            </Box>
            <Button
              onClick={() => handleToggleGuest(!localIsGuest)}
              disabled={loading || !localIsPublic}
              sx={{
                bgcolor: localIsGuest && localIsPublic ? '#10B981' : '#34322F',
                color: '#fff',
                fontWeight: 'bold',
                px: 3,
                py: 1,
                borderRadius: '12px',
                '&:hover': { bgcolor: localIsGuest && localIsPublic ? '#0D9488' : '#45423E' }
              }}
            >
              {localIsGuest && localIsPublic ? 'Enabled' : 'Enable'}
            </Button>
          </Box>
        </Stack>

        {isActive && (
          <Stack spacing={2}>
            {localIsGuest && (
              <Button
                fullWidth
                onClick={handleStopSharingGuests}
                disabled={loading}
                startIcon={<Ban size={16} />}
                sx={{
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  color: '#EF4444',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontWeight: 'bold',
                  py: 1.5,
                  borderRadius: '14px',
                  '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
                }}
              >
                Stop sharing to guests
              </Button>
            )}
            <Button
              fullWidth
              onClick={handleStopSharingEntirely}
              disabled={loading}
              startIcon={<X size={16} />}
              sx={{
                bgcolor: '#EF4444',
                color: '#000',
                fontWeight: 'bold',
                py: 1.5,
                borderRadius: '14px',
                '&:hover': { bgcolor: '#DC2626' }
              }}
            >
              Stop sharing entirely
            </Button>
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
