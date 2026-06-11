'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  Gift, 
  Globe, 
  Tag, 
  ChevronLeft, 
  Check, 
  ArrowRight,
  Sparkles,
  Ticket
} from 'lucide-react';
import { useAuth } from '@/context/auth/AuthContext';
import { account, AppwriteService } from '@/lib/appwrite';
import toast from 'react-hot-toast';

export default function BillingPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Plan states
  const [isPro, setIsPro] = useState(false);
  const [currentTier, setCurrentTier] = useState('FREE');
  const [loadingPlan, setLoadingPlan] = useState(true);

  // Region states
  const [region, setRegion] = useState('US');
  const [savingRegion, setSavingRegion] = useState(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Gift states
  const [giftUsername, setGiftUsername] = useState('');
  const [giftMonths, setGiftMonths] = useState('1');
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftError, setGiftError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Set initial region from user preferences
      if (user.prefs?.region) {
        setRegion(user.prefs.region);
      }
      
      // Load current subscription plan status
      loadSubscriptionStatus();
    }
  }, [user]);

  const loadSubscriptionStatus = async () => {
    if (!user?.$id) return;
    try {
      setLoadingPlan(true);
      const status = await AppwriteService.getGlobalProfileStatus(user.$id);
      if (status?.profile) {
        const tier = status.profile.tier || 'FREE';
        setCurrentTier(tier);
        setIsPro(tier === 'PRO' || tier === 'LIFETIME' || tier === 'ORG');
      }
    } catch (err) {
      console.warn('Failed to load subscription plan status:', err);
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleSaveRegion = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setRegion(selected);
    if (!user) return;
    setSavingRegion(true);
    try {
      const currentPrefs = user.prefs || {};
      await account.updatePrefs({ ...currentPrefs, region: selected });
      toast.success(`Billing region updated to ${selected}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update billing region');
    } finally {
      setSavingRegion(false);
    }
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim();
    if (!code) {
      toast.error('Please enter a coupon code.');
      return;
    }
    router.push(`/accounts/coupon/${encodeURIComponent(code)}`);
  };

  const handleGiftCheckout = useCallback(async () => {
    const recipientQuery = giftUsername.trim();
    if (!recipientQuery) {
      setGiftError('Enter a recipient username.');
      return;
    }

    setGiftLoading(true);
    setGiftError(null);

    try {
      const matches = await AppwriteService.searchGlobalProfiles(recipientQuery, 1);
      const recipient = (matches[0] as any) || null;

      let recipientUserId = recipient?.userId || null;
      let recipientLabel = recipient?.displayName || recipient?.username || null;

      if (!recipientUserId) {
        const directLookup = await AppwriteService.getGlobalProfileStatus(recipientQuery);
        recipientUserId = directLookup?.profile?.userId || null;
        recipientLabel = directLookup?.profile?.displayName || directLookup?.profile?.username || recipientLabel;
      }

      if (!recipientUserId) {
        throw new Error('No matching account found for that username or user ID.');
      }

      const normalizedMonths = Math.max(1, Number.parseInt(giftMonths || '1', 10) || 1);
      const checkoutUrl = new URL('/accounts/subscription/pro/checkout', window.location.origin);
      checkoutUrl.searchParams.set('planId', normalizedMonths >= 12 ? 'PRO_YEAR' : 'PRO_MONTH');
      checkoutUrl.searchParams.set('months', String(normalizedMonths));
      checkoutUrl.searchParams.set('giftRecipientId', recipientUserId);
      checkoutUrl.searchParams.set('giftRecipientName', recipientLabel || recipientUserId);

      router.push(checkoutUrl.toString());
    } catch (error: unknown) {
      setGiftError((error as Error)?.message || 'Failed to start gift checkout.');
    } finally {
      setGiftLoading(false);
    }
  }, [giftMonths, giftUsername, router]);

  return (
    <div className="min-h-screen bg-[#0A0908] text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/accounts/settings/profile')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold bg-transparent border-none cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>Back to Settings</span>
          </button>
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-black font-clash tracking-tight text-white">
            Billing & Subscriptions
          </h1>
          <p className="text-white/40 text-sm mt-2 font-medium">
            Manage your local regional settings, active coupons, subscription details, and gift options.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left / Main Section (Plan, Region, Coupons) */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Plan Info Card */}
            <div className="bg-[#161412] border border-white/5 rounded-[32px] p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/8 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1]">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Ecosystem Tier</h3>
                    <p className="text-xs text-white/40 font-bold">Your active privileges status</p>
                  </div>
                </div>
                {isPro && (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#6366F1] bg-[#6366F1]/10 px-3 py-1.5 rounded-full">
                    <Sparkles size={10} />
                    PRO ACCOUNT
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-white/40 font-black tracking-widest uppercase block mb-1">
                    Active Plan
                  </span>
                  <span className="text-2xl font-black text-white">
                    {loadingPlan ? 'Resolving...' : `${currentTier} PLAN`}
                  </span>
                </div>

                {!isPro && !loadingPlan && (
                  <button
                    onClick={() => router.push('/pricing')}
                    className="px-6 py-3 rounded-xl bg-[#6366F1] hover:bg-[#5254E8] text-white font-black text-xs transition-all flex items-center gap-2 border-none cursor-pointer"
                  >
                    <span>Upgrade to Pro</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Region Card */}
            <div className="bg-[#161412] border border-white/5 rounded-[32px] p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/8 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]">
                  <Globe size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Billing Region</h3>
                  <p className="text-xs text-white/40 font-bold">Configure your country settings for checkout routing</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-white/40 uppercase tracking-wider block">Country / Territory</label>
                <div className="relative">
                  <select
                    value={region}
                    onChange={handleSaveRegion}
                    disabled={savingRegion}
                    className="w-full bg-white/4 border border-white/8 focus:border-[#6366F1] rounded-xl px-4 py-3.5 text-sm font-semibold text-white focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="AU">Australia</option>
                    <option value="SG">Singapore</option>
                    <option value="CH">Switzerland</option>
                    <option value="NL">Netherlands</option>
                    <option value="ZA">South Africa</option>
                    <option value="NG">Nigeria</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-white/30">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Coupons */}
            <div className="bg-[#161412] border border-white/5 rounded-[32px] p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/8 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                  <Ticket size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Ecosystem Coupons</h3>
                  <p className="text-xs text-white/40 font-bold">Apply active promotional code tags to unlock tiers</p>
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Coupon code (e.g. ALPHA_USER)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase().trim())}
                  className="flex-1 bg-white/4 border border-white/8 focus:border-[#6366F1] rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Apply Code
                </button>
              </div>
            </div>

          </div>

          {/* Right Section (Gift Pro) */}
          <div className="space-y-8">
            <div className="bg-[#161412] border border-white/5 rounded-[32px] p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/8 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1]">
                  <Gift size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Gift Pro Tier</h3>
                  <p className="text-xs text-white/40 font-bold">Send a subscription gift to another node</p>
                </div>
              </div>

              <p className="text-xs text-[#9B9691] leading-relaxed font-satoshi">
                Recipient account will automatically claim the active Pro subscription period on their next logon sequence.
              </p>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 uppercase">Recipient Username</label>
                  <input
                    type="text"
                    placeholder="Username or Handle"
                    value={giftUsername}
                    onChange={(e) => setGiftUsername(e.target.value)}
                    className="w-full bg-white/4 border border-white/8 focus:border-[#6366F1] rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 uppercase">Subscription Period (Months)</label>
                  <input
                    type="number"
                    placeholder="Months"
                    min={1}
                    value={giftMonths}
                    onChange={(e) => setGiftMonths(e.target.value)}
                    className="w-full bg-white/4 border border-white/8 focus:border-[#6366F1] rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none"
                  />
                </div>

                {giftError && (
                  <p className="text-xs text-red-500 font-bold font-mono">{giftError}</p>
                )}

                <button
                  type="button"
                  onClick={() => void handleGiftCheckout()}
                  disabled={giftLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#6366F1] hover:bg-[#5254E8] text-white text-xs font-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 border-none cursor-pointer"
                >
                  {giftLoading ? 'Preparing Checkout...' : 'Gift Pro Subscription'}
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
