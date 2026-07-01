'use client';

import React, { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, Paper, Tooltip } from '@/lib/openbricks/primitives';
import {
  FileText as NotesIcon,
  Lock as VaultIcon,
  CheckSquare as FlowIcon,
  MessageCircle as ConnectIcon,
} from 'lucide-react';

import { useUnifiedDrawer } from '@/context/UnifiedDrawerContext';
import { useAppChrome } from '@/components/providers/AppChromeProvider';
import { useDrawerState } from '@/components/ui/DrawerStateContext';
import { useCallLauncher } from '@/context/CallLauncherContext';
import { useOverlay } from '@/components/ui/OverlayContext';

export function UnifiedLeftSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeContent } = useUnifiedDrawer();
  const { mode } = useAppChrome();
  const { isDrawerOpen } = useDrawerState();
  const { isOpen: isCallLauncherOpen } = useCallLauncher();
  const { isOpen: isOverlayOpen } = useOverlay();

  // Determine which app we're in
  const appContext = useMemo(() => {
    if (pathname?.startsWith('/app')) return 'note';
    if (pathname?.startsWith('/vault')) return 'vault';
    if (pathname?.startsWith('/flow')) return 'flow';
    if (pathname?.startsWith('/connect')) return 'connect';
    if (pathname?.startsWith('/projects')) return 'note';
    return null;
  }, [pathname]);

  // Get app-specific color for selected state
  const appColor = useMemo(() => {
    switch (appContext) {
      case 'vault':
        return '#10B981'; // Emerald
      case 'flow':
        return '#A855F7'; // Amethyst
      case 'connect':
        return '#F59E0B'; // Amber
      case 'note':
      default:
        return '#EC4899'; // Pink
    }
  }, [appContext]);

  // Get current tab based on pathname
  const getCurrentTab = () => {
    if (pathname?.startsWith('/app') || pathname?.startsWith('/projects')) return 'note';
    if (pathname?.startsWith('/flow')) return 'flow';
    if (pathname?.startsWith('/vault')) return 'vault';
    if (pathname?.startsWith('/connect')) return 'connect';
    return null;
  };

  const handleNavChange = (newValue: string) => {
    const routes: Record<string, string> = {
      note: '/app',
      flow: '/flow',
      vault: '/vault',
      connect: '/connect',
    };
    router.push(routes[newValue] || '/app');
  };

  const isNoteFullPageDetail = Boolean(pathname?.match(/^\/app\/notes\/[^/]+$/));
  const isConnectCallDetail = Boolean(pathname?.match(/^\/connect\/call\/[^/]+$/));
  const isConnectChatPage = pathname?.startsWith('/connect/chats') || pathname?.match(/^\/connect\/chat\/[^/]+$/);
  const isProjectsPage = pathname?.startsWith('/projects');

  // Accounts: never use left sidebar
  if (pathname?.startsWith('/accounts')) return null;

  // Hide left sidebar on settings page, when overlays/drawers/compact shells are active
  if (
    isProjectsPage ||
    isConnectChatPage ||
    pathname?.includes('/settings') ||
    activeContent !== 'navbar' ||
    mode === 'compact' ||
    isDrawerOpen ||
    isNoteFullPageDetail ||
    isConnectCallDetail ||
    isCallLauncherOpen || 
    isOverlayOpen ||
    !appContext
  ) return null;

  const currentTab = getCurrentTab();

  const navItems = [
    { id: 'note', label: 'Notes & Projects', icon: NotesIcon },
    { id: 'flow', label: 'Flow Goals', icon: FlowIcon },
    { id: 'vault', label: 'Vault Crypt', icon: VaultIcon },
    { id: 'connect', label: 'Connect Hub', icon: ConnectIcon },
  ];

  return (
    <Box
      component="nav"
      sx={{
        position: 'fixed',
        left: 0,
        top: '88px',
        bottom: 0,
        width: 80,
        zIndex: 1100,
        display: { xs: 'none', md: 'block' },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          width: '100%',
          bgcolor: '#161412',
          backgroundImage: 'none',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 3,
          boxSizing: 'border-box',
        }}
      >
        <Stack spacing={3.5} sx={{ width: '100%', alignItems: 'center' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = currentTab === item.id;
            return (
              <Tooltip key={item.id} title={item.label} placement="right" arrow>
                <Box
                  onClick={() => handleNavChange(item.id)}
                  sx={{
                    position: 'relative',
                    width: 48,
                    height: 48,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isSelected ? appColor : 'rgba(255, 255, 255, 0.4)',
                    bgcolor: isSelected ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: isSelected ? `1px solid ${appColor}33` : '1px solid transparent',
                    '&:hover': {
                      color: isSelected ? appColor : '#fff',
                      bgcolor: 'rgba(255, 255, 255, 0.04)',
                      transform: 'translateY(-1px)',
                      ...(isSelected ? {} : { borderColor: 'rgba(255,255,255,0.08)' }),
                    },
                    '&:active': {
                      transform: 'translateY(0px)',
                    },
                  }}
                >
                  {/* Glowing vertical indicator edge */}
                  {isSelected && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: -16,
                        width: 4,
                        height: 24,
                        borderRadius: '0 4px 4px 0',
                        bgcolor: appColor,
                        boxShadow: `0 0 12px ${appColor}`,
                      }}
                    />
                  )}

                  <Icon
                    size={22}
                    strokeWidth={1.5}
                    style={{
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      ...(isSelected && {
                        transform: 'scale(1.1)',
                        filter: `drop-shadow(0 0 6px ${appColor}60)`,
                      }),
                    }}
                  />
                </Box>
              </Tooltip>
            );
          })}
        </Stack>
      </Paper>
    </Box>
  );
}

// Inline Stack Component to avoid separate imports if not present
function Stack({ children, spacing, sx }: { children: React.ReactNode; spacing: number; sx?: any }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: `${spacing * 8}px`,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
