'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSource } from '@/lib/source-context';
import { useAuth } from '@/context/auth/AuthContext';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSource } = useSource();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (authLoading) return;

    const source = searchParams.get('source');
    if (source) {
      setSource(source);
    }

    if (isAuthenticated) {
      if (source) {
        const url = new URL(source.startsWith('http') ? source : `https://${source}`);
        url.searchParams.set('auth', 'success');
        router.replace(url.toString());
      } else {
        router.replace('/settings');
      }
    } else {
      const loginUrl = source ? `/accounts/login?source=${encodeURIComponent(source)}` : '/accounts/login';
      router.replace(loginUrl);
    }

    if (isMounted) {
      setIsChecking(false);
    }

    return () => {
      isMounted = false;
    };
  }, [authLoading, isAuthenticated, router, searchParams, setSource]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]" />
        <p className="text-white font-semibold font-satoshi text-sm">Verifying session...</p>
      </div>
    );
  }

  const source = searchParams.get('source');
  const redirectUrl = source ? (source.startsWith('http') ? source : `https://${source}`) : null;
  const isPopup = typeof window !== 'undefined' && !!window.opener;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-[520px] text-center p-8 sm:p-12 rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
        <h1 className="text-2xl sm:text-3xl font-black font-clash text-white mb-3 tracking-tight">
          Authentication finished
        </h1>
        <p className="text-sm text-[#9B9691] mb-8 font-satoshi leading-relaxed">
          You can close this window or tab now and return to the application.
        </p>
        
        <div className="flex flex-col gap-3 mb-8">
          {redirectUrl && (
            <button
              type="button"
              onClick={() => router.push(redirectUrl)}
              className="w-full h-14 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-extrabold text-sm transition-all cursor-pointer shadow-lg shadow-[#6366F1]/20 flex items-center justify-center"
            >
              Continue to Application
            </button>
          )}

          <button
            type="button"
            onClick={() => router.push('/settings')}
            className="w-full h-14 rounded-xl bg-[#1C1A18] hover:bg-[#242220] border border-[#34322F] text-white font-extrabold text-sm transition-all cursor-pointer flex items-center justify-center"
          >
            View Settings
          </button>

          {isPopup && (
            <button
              type="button"
              onClick={() => window.close()}
              className="w-full h-14 rounded-xl border border-white/10 hover:border-white hover:bg-white/5 text-white font-extrabold text-sm transition-all cursor-pointer flex items-center justify-center"
            >
              Close Window
            </button>
          )}
        </div>

        <p className="text-xs text-[#9B9691]/50 font-satoshi leading-normal">
          If things still look stale, refresh the application window you came from as a last resort.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
