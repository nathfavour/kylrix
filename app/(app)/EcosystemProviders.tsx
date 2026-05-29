'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { AppwriteProvider } from '@/app/(app)/vault/appwrite-provider';
import { DocsProvider } from '@/context/DocsContext';
import { SubscriptionProvider } from '@/context/subscription/SubscriptionContext';
import { NotesProvider } from '@/context/NotesContext';
import { TaskProvider } from '@/context/TaskContext';
import { BackgroundTaskProvider } from '@/context/BackgroundTaskContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { SourceProvider } from '@/lib/source-context';
import { LocalContextProvider } from '@/lib/context-engine';
import { PotatoProvider } from '@/components/providers/PotatoProvider';
import { ProfileProvider } from '@/components/providers/ProfileProvider';
import { SidebarProvider } from '@/components/ui/SidebarContext';
import { DynamicSidebarProvider } from '@/components/ui/DynamicSidebar';
import { DrawerStateProvider } from '@/components/ui/DrawerStateContext';
import { SudoProvider } from '@/context/SudoContext';
import { UnifiedDrawerProvider } from '@/context/UnifiedDrawerContext';
import { NoteDrawerProvider } from '@/context/NoteDrawerContext';
import { ProUpgradeProvider } from '@/context/ProUpgradeContext';
import { AgenticDrawerProvider } from '@/context/AgenticDrawerContext';
import { AIProvider } from '@/context/AIContext';
import { OverlayProvider } from '@/components/ui/OverlayContext';
import { ContextMenuProvider } from '@/components/ui/ContextMenuContext';
import { GlobalContextMenu } from '@/components/ui/GlobalContextMenu';
import { AppChromeProvider } from '@/components/providers/AppChromeProvider';
import { ChatNotificationProvider } from '@/components/providers/ChatNotificationProvider';
import { CallLauncherProvider } from '@/context/CallLauncherContext';
import { WalletOverlayProvider } from '@/context/WalletOverlayContext';
import { TokenOpsProvider } from '@/context/TokenOpsContext';
import GlobalShortcuts from '@/components/GlobalShortcuts';

const PresenceProvider = dynamic(() => import('@/components/providers/PresenceProvider').then(m => m.PresenceProvider), { ssr: false });

function ContextMenuWrapper({ children }: { children: ReactNode }) {
  return (
    <ContextMenuProvider>
      <GlobalContextMenu />
      {children}
    </ContextMenuProvider>
  );
}

function PresenceWrapper({ children }: { children: ReactNode }) {
  return (
    <PresenceProvider>
      <GlobalShortcuts />
      {children}
    </PresenceProvider>
  );
}

interface ComposeProvidersProps {
  providers: Array<React.ComponentType<{ children: ReactNode }>>;
  children: ReactNode;
}

function ComposeProviders({ providers, children }: ComposeProvidersProps) {
  return (
    <>
      {providers.reduceRight((acc, Provider) => {
        return <Provider>{acc}</Provider>;
      }, children)}
    </>
  );
}

/**
 * EcosystemProviders wraps only the protected (app) routes.
 * It contains heavy contexts (Calls, Chat, Tasks, DataNexus) that are NOT needed on public landing/send pages.
 */
const ecosystemProvidersList: Array<React.ComponentType<{ children: ReactNode }>> = [
  AppwriteProvider,
  DocsProvider,
  NotesProvider,
  ProfileProvider,
  BackgroundTaskProvider,
  NotificationProvider,
  SourceProvider,
  NoteDrawerProvider,
  ProUpgradeProvider,
  AgenticDrawerProvider,
  AIProvider,
  ContextMenuWrapper,
  PotatoProvider,
  ChatNotificationProvider,
  PresenceWrapper,
];

export function EcosystemProviders({ children }: { children: ReactNode }) {
  return (
    <ComposeProviders providers={ecosystemProvidersList}>
      {children}
    </ComposeProviders>
  );
}
