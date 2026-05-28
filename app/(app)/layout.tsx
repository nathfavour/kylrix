'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth/AuthContext';

import { EcosystemProviders } from './EcosystemProviders';

/**
 * KYLRIX ECOSYSTEM GATEKEEPER
 * 
 * Centralized redirection for unauthenticated users hitting protected routes.
 * This replaces aggressive edge middleware with a clean React-level flow
 * using our established useAuth hook.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Zero-Idle Mandate: Redirect unauthenticated users to /send
    if (!isLoading && !isAuthenticated) {
      const path = pathname || '';

      // 1. PUBLIC WHITELIST (Routes that NEVER redirect)
      // These are shared resources or public landers
      const isPublic = 
        path === '/' ||
        path.startsWith('/send') ||
        path.startsWith('/note/shared') ||
        path.startsWith('/i/') ||
        path.startsWith('/u/') ||
        path.startsWith('/p/') ||
        path.startsWith('/call/') ||
        path.startsWith('/connect/call/') ||
        path.startsWith('/flow/forms/') ||
        path.startsWith('/flow/events/');

      if (isPublic) return;

      // 2. PROTECTED DASHBOARDS (Routes that REQUIRE authentication)
      const protectedDashboardPrefixes = [
        '/note',
        '/vault',
        '/flow',
        '/connect',
        '/projects',
        '/accounts',
        '/settings',
        '/agents'
      ];

      const isDashboard = protectedDashboardPrefixes.some(prefix => path.startsWith(prefix));

      if (isDashboard) {
        console.log(`[Gatekeeper] Unauthenticated access to dashboard ${path} -> Redirecting to /send`);
        router.replace('/send');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return <EcosystemProviders>{children}</EcosystemProviders>;
}
