import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * KYLRIX APPLICATION LAYER PROTECTION
 * 
 * Defends against:
 * 1. Rapid reload storms (accidental double-clicks, broken code causing infinite reloads)
 * 2. Redirect loops (poorly-written auth guards bouncing between pages endlessly)
 * 3. API burst floods (client bugs firing the same request in a tight loop)
 * 
 * Uses a lightweight cookie-based counter that requires zero database reads.
 */

const RELOAD_COOKIE = 'k_rld';
const REDIRECT_DEPTH_PARAM = '_rd';

// Thresholds
const MAX_RAPID_RELOADS = 30;         // Max page loads within the window
const RELOAD_WINDOW_MS = 5_000;       // 5-second sliding window
const MAX_REDIRECT_DEPTH = 5;         // Max chained redirects before circuit-breaker fires

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Skip static assets, API routes, and Next.js internals entirely — zero overhead
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // static files like .css, .js, .png
  ) {
    return NextResponse.next();
  }

  // ─── REDIRECT LOOP DEFENSE ────────────────────────────────────────────
}

export const config = {
  matcher: [
    // Match all routes except static files and API
    '/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
