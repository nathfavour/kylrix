'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth/AuthContext';

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
      // List of sub-apps that REQUIRE authentication
      const protectedApps = [
        '/note',
        '/vault',
        '/flow',
        '/connect',
        '/projects',
        '/accounts',
        '/settings',
        '/agents'
      ];

      // Exempt public sub-paths (e.g. shared notes, public APIs handled elsewhere)
      const isPublicPath = 
        pathname?.startsWith('/note/shared') || 
        pathname?.startsWith('/send') ||
        pathname === '/';

      const isProtected = protectedApps.some(app => pathname?.startsWith(app));

      if (isProtected && !isPublicPath) {
        console.log(`[Gatekeeper] Unauthenticated on ${pathname} -> Redirecting to /send`);
        router.replace('/send');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return <>{children}</>;
}
