'use client';

import React, { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, Paper, Tooltip } from '@/lib/openbricks/primitives';
import {
  FileText as NotesIcon,
  Lock as VaultIcon,
  CheckSquare as FlowIcon,
  MessageCircle as ConnectIcon,
  FolderKanban as ProjectsIcon,
  Tag as TagsIcon,
} from 'lucide-react';

import { useUnifiedDrawer } from '@/context/UnifiedDrawerContext';
import { useAppChrome } from '@/components/providers/AppChromeProvider';
import { useDrawerState } from '@/components/ui/DrawerStateContext';
import { useCallLauncher } from '@/context/CallLauncherContext';
import { useOverlay } from '@/components/ui/OverlayContext';

type NavId = 'note' | 'flow' | 'vault' | 'connect' | 'projects' | 'tags';

const NAV_COLORS: Record<NavId, string> = {
  note: '#EC4899',
  flow: '#A855F7',
  vault: '#10B981',
  connect: '#F59E0B',
  projects: '#F59E0B',
  tags: '#6366F1',
};

const NOTE_DETAIL_EXCLUDED = 'shared|landing|admin|pitch|popout|notes|extensions';

export function UnifiedLeftSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeContent } = useUnifiedDrawer();
  const { mode } = useAppChrome();
  const { isDrawerOpen } = useDrawerState();
  const { isOpen: isCallLauncherOpen } = useCallLauncher();
  const { isOpen: isOverlayOpen } = useOverlay();

  const appContext = useMemo((): NavId | null => {
    if (pathname?.startsWith('/tags')) return 'tags';
    if (pathname?.startsWith('/projects')) return 'projects';
    if (pathname?.startsWith('/app')) return 'note';
    if (pathname?.startsWith('/vault')) return 'vault';
    if (pathname?.startsWith('/flow')) return 'flow';
    if (pathname?.startsWith('/connect')) return 'connect';
    return null;
  }, [pathname]);

  const getCurrentTab = (): NavId | null => {
    if (pathname?.startsWith('/tags')) return 'tags';
    if (pathname?.startsWith('/projects')) return 'projects';
    if (pathname?.startsWith('/app')) return 'note';
    if (pathname?.startsWith('/flow')) return 'flow';
    if (pathname?.startsWith('/vault')) return 'vault';
    if (pathname?.startsWith('/connect')) return 'connect';
    return null;
  };

  const handleNavChange = (navId: NavId) => {
    const routes: Record<NavId, string> = {
      note: '/app',
      flow: '/flow',
      vault: '/vault',
      connect: '/connect',
      projects: '/projects',
      tags: '/tags',
    };
    router.push(routes[navId] || '/app');
  };

  const isNoteFullPageDetail = Boolean(
    pathname?.match(new RegExp(`^/app/(?!${NOTE_DETAIL_EXCLUDED})[^/]+$`)),
  );
  const isConnectCallDetail = Boolean(pathname?.match(/^\/connect\/call\/[^/]+$/));
  const isConnectChatPage =
    pathname?.startsWith('/connect/chats') || pathname?.match(/^\/connect\/chat\/[^/]+$/);

  if (pathname?.startsWith('/accounts')) return null;

  if (
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

  const navItems: { id: NavId; label: string; icon: typeof NotesIcon }[] = [
    { id: 'note', label: 'Ideas', icon: NotesIcon },
    { id: 'flow', label: 'Flow', icon: FlowIcon },
    { id: 'vault', label: 'Vault', icon: VaultIcon },
    { id: 'connect', label: 'Connect', icon: ConnectIcon },
    { id: 'projects', label: 'Projects', icon: ProjectsIcon },
    { id: 'tags', label: 'Tags', icon: TagsIcon },
  ];

  return (
    <Box
      component="nav"
      className="kylrix-sidebar"
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
          py: 2.5,
          boxSizing: 'border-box',
        }}
      >
        <Stack spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = currentTab === item.id;
            const itemColor = NAV_COLORS[item.id];
            return (
              <Tooltip key={item.id} title={item.label} placement="right" arrow>
                <Box
                  onClick={() => handleNavChange(item.id)}
                  sx={{
                    position: 'relative',
                    width: 46,
                    height: 46,
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isSelected ? itemColor : 'rgba(255, 255, 255, 0.4)',
                    bgcolor: isSelected ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: isSelected ? `1px solid ${itemColor}33` : '1px solid transparent',
                    '&:hover': {
                      color: isSelected ? itemColor : '#fff',
                      bgcolor: 'rgba(255, 255, 255, 0.04)',
                      transform: 'translateY(-1px)',
                      ...(isSelected ? {} : { borderColor: 'rgba(255,255,255,0.08)' }),
                    },
                    '&:active': {
                      transform: 'translateY(0px)',
                    },
                  }}
                >
                  {isSelected && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: -16,
                        width: 4,
                        height: 22,
                        borderRadius: '0 4px 4px 0',
                        bgcolor: itemColor,
                        boxShadow: `0 0 12px ${itemColor}`,
                      }}
                    />
                  )}

                  <Icon
                    size={20}
                    strokeWidth={1.5}
                    style={{
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      ...(isSelected && {
                        transform: 'scale(1.1)',
                        filter: `drop-shadow(0 0 6px ${itemColor}60)`,
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
