'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { Check, Copy, Link as LinkIcon, Search } from 'lucide-react';
import { AppwriteService } from '@/lib/appwrite';

interface ReferralStatus {
  success?: boolean;
  hasReferral?: boolean;
  referralLink?: string | null;
  referrer?: {
    userId: string;
    username: string;
    displayName?: string;
    avatar?: string | null;
  } | null;
  referralEvent?: any;
  error?: string;
}

interface ReferralProfile {
  $id: string;
  userId?: string;
  username: string;
  displayName?: string;
  avatar?: string | null;
}

export default function ReferralManager() {
  const [status, setStatus] = useState<ReferralStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ReferralProfile[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const hasReferral = Boolean(status?.hasReferral);
  const referralLink = status?.referralLink || null;

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AppwriteService.getReferralStatus();
      setStatus(data);
    } catch (err) {
      console.error('Failed to load referral status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    let mounted = true;

    const t = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        const docs = await AppwriteService.searchGlobalProfiles(query.trim(), 8);
        if (!mounted) return;
        setResults(docs as any as ReferralProfile[]);
      } catch (err) {
        console.error('Failed to search profiles:', err);
      }
    }, 250);

    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [query]);

  const copyReferralLink = useCallback(async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setMessage('Referral link copied.');
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, [referralLink]);

  const applyReferral = useCallback(async (profile: ReferralProfile) => {
    if (hasReferral || submitting) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await AppwriteService.applyReferral(profile.username, profile.userId || profile.$id);
      if (res?.success) {
        setStatus(prev => ({
          ...(prev || {}),
          hasReferral: true,
          referralEvent: res.referralEvent || prev?.referralEvent,
          referrer: res.referrer || prev?.referrer,
          referralLink: res.referralLink || prev?.referralLink,
        }));
        setMessage(`Referral linked to @${profile.username}.`);
        setQuery('');
        setResults([]);
      } else {
        setMessage(res?.error || 'Could not apply referral.');
      }
    } catch (err: any) {
      setMessage(err?.message || 'Could not apply referral.');
    } finally {
      setSubmitting(false);
    }
  }, [hasReferral, submitting]);

  const referrerLabel = useMemo(() => {
    if (!status?.referrer) return 'No referral linked yet.';
    return `Referred by @${status.referrer.username}`;
  }, [status?.referrer]);

  return (
    <div className="bg-[#161514] border border-white/5 rounded-[32px] p-6 md:p-10 space-y-6">
      <div>
        <h3 className="font-clash font-black text-xl text-white tracking-tight leading-tight">
          Referral & Rewards
        </h3>
        <p className="text-sm text-[#9B9691] mt-1.5 font-semibold font-satoshi leading-relaxed">
          Your referral link is tied to your username and the record is kept in the account events table.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]" />
        </div>
      ) : (
        <div className="space-y-6">
          {message && (
            <div className="bg-[#6366F1]/10 border border-[#6366F1]/20 text-white rounded-xl p-4 text-sm font-semibold font-satoshi">
              {message}
            </div>
          )}

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-2">
            <span className="text-[10px] text-[#9B9691] font-bold font-mono uppercase tracking-wider block">
              Your Referral Link
            </span>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <LinkIcon className="w-4 h-4 text-[#6366F1] flex-shrink-0" />
                <span className="font-mono text-sm text-white/80 break-all select-all">
                  {referralLink || 'Set up your profile username to generate a link.'}
                </span>
              </div>
              <button
                type="button"
                onClick={copyReferralLink}
                disabled={!referralLink}
                className="flex items-center gap-2 py-2 px-4 rounded-xl border border-white/10 text-white font-bold text-xs hover:border-[#6366F1] hover:bg-[#6366F1]/5 transition-all cursor-pointer flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-1">
            <span className="text-[10px] text-[#9B9691] font-bold font-mono uppercase tracking-wider block">
              Referral Status
            </span>
            <span className="text-lg text-white font-extrabold tracking-tight">
              {referrerLabel}
            </span>
          </div>

          <div className="h-px bg-white/5 w-full" />

          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-[#9B9691] font-bold font-mono uppercase tracking-wider block mb-2">
                Manually Add Referrer
              </span>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-white/40" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type username"
                  disabled={hasReferral}
                  className="w-full bg-[#0A0908] pl-11 pr-4 py-3 rounded-xl border border-white/10 text-white text-sm font-semibold focus:outline-none focus:border-[#6366F1] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {results.length > 0 && !hasReferral && (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {results.map((profile) => (
                  <div
                    key={profile.$id}
                    onClick={() => applyReferral(profile)}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#6366F1]/30 hover:bg-[#6366F1]/5 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#6366F1] text-black font-black flex items-center justify-center text-sm flex-shrink-0">
                        {(profile.displayName || profile.username || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-sm font-extrabold text-white truncate">
                          {profile.displayName || profile.username}
                        </span>
                        <span className="block text-xs text-[#9B9691] font-medium font-mono truncate">
                          @{profile.username}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        applyReferral(profile);
                      }}
                      disabled={submitting}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#6366F1] hover:bg-[#5458E8] text-black font-black text-xs rounded-lg transition-all cursor-pointer flex-shrink-0 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Select</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {hasReferral && (
              <p className="text-xs text-[#9B9691]/70 leading-relaxed font-satoshi">
                Referral is already locked in. You can still copy your link, but the referrer cannot be changed.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
