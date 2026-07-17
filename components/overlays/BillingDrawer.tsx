'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Drawer } from '@/components/ui/Drawer';
import { 
  CreditCard, 
  Gift, 
  Globe, 
  Tag, 
  Check, 
  ArrowRight,
  Sparkles,
  Ticket,
  Clock,
  Printer,
  Search,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/auth/AuthContext';
import { AppwriteService } from '@/lib/appwrite';
import { account } from '@/lib/appwrite/client';
import { getMyCouponsAction } from '@/app/(app)/(auth)/accounts/actions/coupons';
import { listBillingTransactionsAction } from '@/app/(app)/(auth)/accounts/actions/billing';
import toast from 'react-hot-toast';

interface BillingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BillingDrawer({ isOpen, onClose }: BillingDrawerProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // Plan states
  const [isPro, setIsPro] = useState(false);
  const [currentTier, setCurrentTier] = useState('FREE');
  const [loadingPlan, setLoadingPlan] = useState(true);

  // Global settings
  const region = 'DEFAULT';

  // Coupon states
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);

  // Gift states
  const [giftUsername, setGiftUsername] = useState('');
  const [giftMonths, setGiftMonths] = useState('1');
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftError, setGiftError] = useState<string | null>(null);

  // Transaction History States
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadSubscriptionStatus = useCallback(async () => {
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
  }, [user?.$id]);

  const loadCoupons = useCallback(async () => {
    if (!user?.$id) return;
    try {
      setLoadingCoupons(true);
      const jwtRes = await account.createJWT().then(res => res.jwt).catch(() => undefined);
      const list = await getMyCouponsAction(jwtRes);
      setCoupons(list || []);
    } catch (err) {
      console.warn('Failed to load coupons:', err);
    } finally {
      setLoadingCoupons(false);
    }
  }, [user?.$id]);

  const loadTransactions = useCallback(async () => {
    if (!user?.$id) return;
    try {
      setLoadingTransactions(true);
      const jwtRes = await account.createJWT().then(res => res.jwt).catch(() => undefined);
      const res = await listBillingTransactionsAction(jwtRes);
      if (res.success && res.transactions) {
        setTransactions(res.transactions);
      }
    } catch (err) {
      console.warn('Failed to load transactions:', err);
    } finally {
      setLoadingTransactions(false);
    }
  }, [user?.$id]);

  useEffect(() => {
    if (user && isOpen) {
      loadSubscriptionStatus();
      loadCoupons();
      loadTransactions();
    }
  }, [user, isOpen, loadSubscriptionStatus, loadCoupons, loadTransactions]);

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
      const checkoutUrl = new URL(`${window.location.origin}/accounts/subscription/pro/checkout`);
      checkoutUrl.searchParams.set('giftRecipientId', recipientUserId);
      checkoutUrl.searchParams.set('giftRecipientName', recipientLabel || recipientUserId);
      checkoutUrl.searchParams.set('months', String(normalizedMonths));
      
      router.push(checkoutUrl.toString());
    } catch (error) {
      setGiftError((error as Error)?.message || 'Failed to start gift checkout.');
    } finally {
      setGiftLoading(false);
    }
  }, [giftMonths, giftUsername, router]);

  const printStatement = () => {
    const w = window.open();
    if (!w) return;
    const currentDate = new Date().toLocaleDateString();

    const filtered = transactions.filter(tx => 
      tx.status === 'completed' &&
      (tx.planName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       tx.$id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const detailsHtml = filtered.map(tx => `
      <tr>
        <td>${new Date(tx.createdAt).toLocaleDateString()}</td>
        <td>${tx.$id}</td>
        <td>PRO Tier - ${tx.monthsBought} months ${tx.isGift ? '(Gift to another node)' : ''}</td>
        <td style="text-align: right;">$${(tx.amountPaid / 100).toFixed(2)}</td>
      </tr>
    `).join('');

    const totalCents = filtered.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);
    const totalUsd = (totalCents / 100).toFixed(2);

    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cumulative Subscription Statement - Kylrix</title>
        <style>
          body { font-family: monospace; color: #000; padding: 40px; max-width: 800px; margin: auto; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
          .brand { font-size: 20px; font-weight: 900; letter-spacing: 2px; }
          .title { font-size: 16px; font-weight: bold; text-transform: uppercase; }
          .section { margin-bottom: 20px; }
          .tx-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .tx-table th { padding: 10px 8px; border-bottom: 2px solid #000; text-align: left; font-weight: bold; }
          .tx-table td { padding: 10px 8px; border-bottom: 1px dashed #ccc; }
          .total-box { border-top: 2px solid #000; padding-top: 15px; margin-top: 20px; display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; }
          .footer { text-align: center; font-size: 10px; color: #666; margin-top: 60px; border-top: 1px solid #eee; padding-top: 20px; }
          .btn-print { margin-bottom: 20px; background: #000; color: #fff; border: none; padding: 8px 16px; font-family: monospace; cursor: pointer; }
          @media print {
            .btn-print { display: none; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <button class="btn-print" onclick="window.print()">Print / Save PDF</button>
        <div class="header">
          <div>
            <div class="brand">KYLRIX</div>
            <div style="font-size: 11px; color: #555;">Sovereign Infrastructure</div>
          </div>
          <div style="text-align: right;">
            <div class="title">CUMULATIVE SUBSCRIPTION STATEMENT</div>
            <div style="font-size: 11px;">As of: ${currentDate}</div>
          </div>
        </div>

        <div class="section">
          <strong>Customer Details:</strong><br />
          User ID: ${user?.$id || 'N/A'}<br />
          Email: ${user?.email || 'N/A'}
        </div>

        <table class="tx-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Transaction ID</th>
              <th>Description / Plan</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${detailsHtml || '<tr><td colspan="4" style="text-align: center; color: #888;">No completed subscription transactions found.</td></tr>'}
          </tbody>
        </table>

        <div class="total-box">
          <span>LIFETIME VALUE CUMULATIVE TOTAL</span>
          <span>$${totalUsd}</span>
        </div>

        <div class="footer">
          Kylrix open-source workspace suite. Provided strictly as is. No dedicated support. Thank you for your self-sovereign contribution.
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 300);
          }
        </script>
      </body>
      </html>
    `);
    w.document.close();
  };

  const filteredTx = transactions.filter(tx => 
    tx.$id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tx.planName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <h3 className="text-xl font-black font-clash text-white mb-6">Billing & Subscriptions</h3>
      <div className="flex flex-col gap-6 text-white font-satoshi max-h-[80vh] overflow-y-auto pr-2">
        
        {/* Plan Info Card */}
        <div className="bg-[#161412] border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard size={18} className="text-[#6366F1]" />
              <div>
                <h4 className="font-extrabold text-sm text-white">Ecosystem Tier</h4>
                <p className="text-[10px] text-white/40">Your active privileges status</p>
              </div>
            </div>
            {isPro && (
              <span className="text-[9px] font-black uppercase tracking-wider text-[#6366F1] bg-[#6366F1]/10 px-2 py-1 rounded-full flex items-center gap-1">
                <Sparkles size={10} />
                PRO
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-[9px] text-white/40 font-black tracking-widest uppercase block">Active Plan</span>
              <span className="text-xl font-black text-white">
                {loadingPlan ? 'Resolving...' : `${currentTier} PLAN`}
              </span>
            </div>
            {!isPro && !loadingPlan && (
              <button
                onClick={() => {
                  onClose();
                  router.push('/pricing');
                }}
                className="px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#5254E8] text-white font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Upgrade</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Territory Group */}
        <div className="bg-[#161412] border border-white/5 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Globe size={18} className="text-[#F59E0B]" />
            <div>
              <h4 className="font-extrabold text-sm text-white">Territory Settings</h4>
              <p className="text-[10px] text-white/40">Standard global rate applies</p>
            </div>
          </div>
          <div className="bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-xs font-semibold text-white/90">
            Universal Global ($)
          </div>
        </div>

        {/* Coupons section */}
        <div className="bg-[#161412] border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Tag size={18} className="text-[#10B981]" />
            <div>
              <h4 className="font-extrabold text-sm text-white">Your Coupons</h4>
              <p className="text-[10px] text-white/40">Claimed coupons and promotional codes</p>
            </div>
          </div>
          
          {loadingCoupons ? (
            <div className="animate-pulse h-8 bg-white/5 rounded-xl" />
          ) : coupons.length === 0 ? (
            <p className="text-xs text-white/40 font-medium">No coupons active on this account.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {(() => {
                const parseMeta = (val: any) => {
                  try { return JSON.parse(val || '{}'); } catch { return {}; }
                };
                return coupons.map((coupon, idx) => {
                  const meta = parseMeta(coupon.metadata);
                  const title = meta.coupon?.title || coupon.title || coupon.$id;
                  const discountPercent = coupon.discountPercent ?? coupon.discountPercentage ?? 0;
                  const months = meta.months || 1;
                  return (
                    <div key={idx} className="flex justify-between items-center bg-white/2 border border-white/5 p-3.5 rounded-xl">
                      <div>
                        <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">{title}</span>
                        <span className="block text-[9px] text-[#A855F7] font-extrabold mt-0.5 uppercase tracking-wider font-mono">
                          {discountPercent}% Off • {months} Month(s)
                        </span>
                        {coupon.$createdAt && (
                          <span className="block text-[8px] text-white/30 font-medium mt-0.5">
                            Issued: {new Date(coupon.$createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-extrabold uppercase px-2 py-0.5 rounded border border-emerald-500/20 self-start">
                        {String(coupon.status || 'Active')}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* Gift Pro Tier */}
        <div className="bg-[#161412] border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Gift size={18} className="text-[#EC4899]" />
            <div>
              <h4 className="font-extrabold text-sm text-white">Gift Pro Subscription</h4>
              <p className="text-[10px] text-white/40">Send Pro access to another teammate</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-white/40 font-black uppercase tracking-wider block mb-1">Recipient Username or ID</label>
              <input
                type="text"
                placeholder="e.g. janesmith"
                value={giftUsername}
                onChange={e => setGiftUsername(e.target.value)}
                className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#6366F1]"
              />
            </div>
            
            <div>
              <label className="text-[10px] text-white/40 font-black uppercase tracking-wider block mb-1">Gift Duration (Months)</label>
              <select
                value={giftMonths}
                onChange={e => setGiftMonths(e.target.value)}
                className="w-full bg-[#1C1A18] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#6366F1]"
              >
                <option value="1">1 Month - $10.00</option>
                <option value="3">3 Months - $30.00</option>
                <option value="6">6 Months - $60.00</option>
                <option value="12">12 Months (Yearly Saver) - $96.00</option>
              </select>
            </div>

            {giftError && (
              <p className="text-xs text-red-500 font-bold font-mono">{giftError}</p>
            )}

            <button
              onClick={handleGiftCheckout}
              disabled={giftLoading}
              className="w-full py-3 rounded-xl bg-[#6366F1] hover:bg-[#5254E8] text-white font-extrabold text-xs transition-all disabled:opacity-40"
            >
              {giftLoading ? 'Preparing Checkout...' : 'Gift Pro Subscription'}
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-[#161412] border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-[#3B82F6]" />
              <div>
                <h4 className="font-extrabold text-sm text-white">Statements & Invoices</h4>
                <p className="text-[10px] text-white/40">Review transaction logs</p>
              </div>
            </div>
            {transactions.length > 0 && (
              <button
                onClick={printStatement}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                title="Print Cumulative Statement"
              >
                <Printer size={14} />
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search statements..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/3 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#6366F1]"
            />
          </div>

          {loadingTransactions ? (
            <div className="animate-pulse h-12 bg-white/5 rounded-xl" />
          ) : filteredTx.length === 0 ? (
            <p className="text-xs text-white/40 font-medium">No transactions found.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
              {filteredTx.map((tx, idx) => {
                const parseMeta = (val: any) => {
                  try { return JSON.parse(val || '{}'); } catch { return {}; }
                };
                const meta = parseMeta(tx.metadata);
                const displayMonths = tx.months || tx.monthsBought || meta.months || 1;
                const displayAmount = tx.amountUsd || (tx.amountPaid ? `$${(tx.amountPaid / 100).toFixed(2)}` : '$0.00');
                const displayDate = tx.createdAt || tx.$createdAt ? new Date(tx.createdAt || tx.$createdAt).toLocaleDateString() : 'N/A';
                return (
                  <div key={idx} className="flex justify-between items-center bg-white/2 border border-white/5 p-3 rounded-xl text-xs">
                    <div>
                      <span className="font-extrabold text-white uppercase">{String(tx.plan || 'PRO').replace('_', ' ')} - {displayMonths} Mo</span>
                      <span className="block text-[9px] text-white/40 mt-0.5">
                        {displayDate} • {String(tx.status || 'completed')}
                      </span>
                    </div>
                    <span className="font-black text-white font-mono">
                      {displayAmount}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </Drawer>
  );
}
