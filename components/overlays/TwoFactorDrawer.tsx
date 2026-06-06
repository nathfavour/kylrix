'use client';

import { useCallback, useEffect, useState } from 'react';
import { AuthenticationFactor, AuthenticatorType } from 'appwrite';
import { account, avatars } from '@/lib/appwrite';
import { ecosystemSecurity } from '@/lib/ecosystem/security';
import toast from 'react-hot-toast';
import { X as CloseIcon, Copy as ContentCopyIcon } from 'lucide-react';

type LoginMethod = 'email-otp' | 'oauth2' | 'password' | 'unknown';

type Props = {
  open: boolean;
  onClose: () => void;
  userId: string;
  emailVerified?: boolean;
  loginMethod: LoginMethod;
  onEnabled?: () => void;
  mode?: 'setup' | 'reminder';
};

type Step = 'summary' | 'email-init' | 'email-verify' | 'totp' | 'done';

const RECOVERY_COPY_HINT = 'Save these recovery codes in a secure place. They are shown once.';

export function TwoFactorDrawer({
  open,
  onClose,
  userId,
  emailVerified = true,
  loginMethod,
  onEnabled,
  mode = 'setup',
}: Props) {
  const [loading, setLoading] = useState(false);
  const [vaultUnlocked, setVaultUnlocked] = useState(ecosystemSecurity.status.isUnlocked);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [step, setStep] = useState<Step>('summary');
  const [emailChallengeId, setEmailChallengeId] = useState<string | null>(null);
  const [emailOtp, setEmailOtp] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [totpUri, setTotpUri] = useState('');
  const [totpQr, setTotpQr] = useState('');
  const [totpOtp, setTotpOtp] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canUseEmailFactor = loginMethod !== 'email-otp' && emailVerified;
  const isTwoFactorOn = emailEnabled && totpEnabled;

  const refreshFactors = useCallback(async () => {
    try {
      const factors = await account.listMfaFactors();
      setEmailEnabled(Boolean((factors as any)?.email));
      setTotpEnabled(Boolean((factors as any)?.totp));
      return factors as any;
    } catch (_err) {
      setEmailEnabled(false);
      setTotpEnabled(false);
      return null;
    }
  }, []);

  const persistRecoveryCodes = useCallback(async (codes: string[]) => {
    if (!codes.length) return;
    await ecosystemSecurity.saveRecoveryIdentity(userId, codes, {
      source: 'appwrite-mfa',
      primaryFactor: 'totp',
      loginMethod,
    });
  }, [loginMethod, userId]);

  const copyToClipboard = async (value: string, message: string) => {
    await navigator.clipboard.writeText(value);
    toast.success(message);
  };

  const stampMfaPrefs = useCallback(async () => {
    const currentPrefs = await account.getPrefs().catch(() => ({}));
    const now = new Date().toISOString();
    await account.updatePrefs({
      ...currentPrefs,
      mfaEnabledAt: now,
      mfaLastVerifiedAt: now,
      mfaPrimaryFactor: 'totp',
      mfaFactors: {
        email: true,
        totp: true,
      },
    });
  }, []);

  const finalizeTwoFactor = useCallback(async () => {
    await account.updateMFA({ mfa: true });
    await stampMfaPrefs();

    let recovery: string[] = [];
    try {
      const response = await account.createMfaRecoveryCodes();
      recovery = response.recoveryCodes || [];
    } catch (_err) {
      // Recovery codes are best-effort.
    }

    setRecoveryCodes(recovery);
    if (recovery.length > 0) {
      await persistRecoveryCodes(recovery);
      toast.success(RECOVERY_COPY_HINT);
    }

    setStep('done');
    onEnabled?.();
    await refreshFactors();
  }, [onEnabled, persistRecoveryCodes, refreshFactors, stampMfaPrefs]);

  const sendEmailCode = useCallback(async () => {
    if (!canUseEmailFactor) {
      throw new Error('Email verification is not available for this login method.');
    }

    setLoading(true);
    setError(null);
    try {
      if (!vaultUnlocked) {
        throw new Error('Unlock the vault before enabling 2FA so recovery codes can be saved.');
      }
      const response = await account.createMfaChallenge({
        factor: 'email' as AuthenticationFactor,
      });
      setEmailChallengeId((response as any).$id);
      setEmailOtp('');
      setStep('email-verify');
    } catch (_err) {
      const err = _err as any;
      setError(err?.message || 'Failed to send the email code.');
    } finally {
      setLoading(false);
    }
  }, [canUseEmailFactor, vaultUnlocked]);

  const verifyEmailChallenge = async () => {
    if (!emailChallengeId) {
      setError('Start the email challenge first.');
      return;
    }

    if (emailOtp.trim().length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (!vaultUnlocked) {
        throw new Error('Unlock the vault before continuing to TOTP setup.');
      }
      await account.updateMfaChallenge({
        challengeId: emailChallengeId,
        otp: emailOtp.trim(),
      });
      await refreshFactors();
      await startTotpSetup();
    } catch (_err) {
      const err = _err as any;
      setError(err?.message || 'Email verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const startTotpSetup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!vaultUnlocked) {
        throw new Error('Unlock the vault before setting up TOTP.');
      }
      if (!emailEnabled && !canUseEmailFactor) {
        throw new Error('Email factor must be available before TOTP can be enabled.');
      }
      if (totpEnabled) {
        await finalizeTwoFactor();
        return;
      }
      const { secret, uri } = await account.createMfaAuthenticator({ type: AuthenticatorType.Totp });
      setTotpSecret(secret);
      setTotpUri(uri);
      try {
        const qr = await avatars.getQR({ text: uri, size: 320, margin: 0, download: false });
        setTotpQr(qr.toString());
      } catch {
        setTotpQr('');
      }
      setTotpOtp('');
      setStep('totp');
    } catch (_err) {
      const err = _err as any;
      setError(err?.message || 'Failed to create TOTP setup.');
    } finally {
      setLoading(false);
    }
  }, [canUseEmailFactor, emailEnabled, finalizeTwoFactor, totpEnabled, vaultUnlocked]);

  const verifyTotpSetup = async () => {
    if (totpOtp.trim().length !== 6) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (!vaultUnlocked) {
        throw new Error('Unlock the vault before saving recovery codes.');
      }
      await account.updateMfaAuthenticator({
        type: AuthenticatorType.Totp,
        otp: totpOtp.trim(),
      });
      await finalizeTwoFactor();
    } catch (_err) {
      const err = _err as any;
      setError(err?.message || 'TOTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    setLoading(true);
    setError(null);
    try {
      if (totpEnabled) {
        await (account as any).deleteMfaAuthenticator({ type: 'totp' });
      }
      if (emailEnabled) {
        await (account as any).deleteMfaAuthenticator({ type: 'email' });
      }
      await account.updateMFA({ mfa: false });
      const currentPrefs = await account.getPrefs().catch(() => ({}));
      await account.updatePrefs({
        ...currentPrefs,
        mfaEnabledAt: null,
        mfaLastVerifiedAt: null,
        mfaPrimaryFactor: null,
        mfaFactors: {
          email: false,
          totp: false,
        },
      });
      setRecoveryCodes([]);
      setStep('summary');
      await refreshFactors();
      toast.success('2FA turned off.');
    } catch (_err) {
      const err = _err as any;
      setError(err?.message || 'Unable to disable 2FA.');
    } finally {
      setLoading(false);
    }
  };

  const startTwoFactorSetup = async () => {
    setError(null);
    setEmailChallengeId(null);
    setEmailOtp('');
    setTotpSecret('');
    setTotpUri('');
    setTotpQr('');
    setTotpOtp('');
    setRecoveryCodes([]);
    setStep('email-init');
  };

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    setStep('summary');
    setEmailChallengeId(null);
    setEmailOtp('');
    setTotpSecret('');
    setTotpUri('');
    setTotpQr('');
    setTotpOtp('');
    setRecoveryCodes([]);
    setError(null);
    setVaultUnlocked(ecosystemSecurity.status.isUnlocked);

    (async () => {
      const fresh = await refreshFactors();
      if (!mounted) return;

      if (fresh?.email && fresh?.totp) {
        setStep('done');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open, refreshFactors]);

  useEffect(() => {
    if (!open) return;
    const interval = window.setInterval(() => {
      setVaultUnlocked(ecosystemSecurity.status.isUnlocked);
    }, 500);
    return () => window.clearInterval(interval);
  }, [open]);

  if (!open) return null;

  const primaryActionLabel = isTwoFactorOn ? 'Turn off 2FA' : 'Enable 2FA';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[1399] bg-black/60 backdrop-blur-sm transition-all duration-300 animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div 
        className="fixed z-[1400] bg-[#0A0A0A]/98 backdrop-blur-[28px] border-white/5 shadow-2xl transition-all duration-300 flex flex-col overflow-y-auto right-0 top-0 bottom-0 w-full sm:w-[420px] border-l animate-slideInRight"
      >
        <div className="w-full px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-white font-clash font-black text-xl tracking-tight leading-tight">
                {mode === 'reminder' ? 'Set up 2FA' : '2FA'}
              </h3>
              <p className="text-xs text-white/50 font-semibold font-satoshi mt-1">
                Email first, then TOTP.
              </p>
            </div>
            <button 
              type="button" 
              onClick={onClose} 
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/5 hover:border-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="h-px bg-white/10 w-full mb-6" />

          {step === 'summary' && (
            <div className="space-y-6 animate-fadeIn">
              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold font-satoshi">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={isTwoFactorOn ? disableTwoFactor : startTwoFactorSetup}
                disabled={loading || (!isTwoFactorOn && !canUseEmailFactor)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#6366F1] hover:bg-[#5254E8] text-black font-black text-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />}
                <span>{primaryActionLabel}</span>
              </button>
            </div>
          )}

          {step === 'email-init' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-[24px] bg-[#161514] border border-white/5 space-y-4">
                <span className="block text-white font-extrabold text-base">
                  1. Send email code
                </span>
                <p className="text-sm text-white/60 leading-relaxed font-satoshi">
                  We need to send a verification code to your email before TOTP can be set up.
                </p>
                <button
                  type="button"
                  onClick={sendEmailCode}
                  disabled={loading || !canUseEmailFactor}
                  className="px-5 py-3 rounded-xl bg-[#6366F1] hover:bg-[#5254E8] text-black font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current" />}
                  <span>Send email code</span>
                </button>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold font-satoshi">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 'email-verify' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-[24px] bg-[#161514] border border-white/5 space-y-4">
                <span className="block text-white font-extrabold text-base">
                  1. Verify email
                </span>
                <p className="text-sm text-white/60 leading-relaxed font-satoshi">
                  Confirm the code sent to your email, then we’ll move straight to TOTP setup.
                </p>
                <input
                  type="text"
                  value={emailOtp}
                  onChange={(event) => setEmailOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  className="w-full bg-[#0A0908] px-4 py-3 rounded-xl border border-white/10 text-white text-sm font-semibold focus:outline-none focus:border-[#6366F1] mt-2"
                />
                <button
                  type="button"
                  onClick={verifyEmailChallenge}
                  disabled={loading || emailOtp.trim().length !== 6 || !vaultUnlocked}
                  className="w-full px-5 py-3 rounded-xl bg-[#6366F1] hover:bg-[#5254E8] text-black font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current" />}
                  <span>Verify email and continue</span>
                </button>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold font-satoshi">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 'totp' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-[24px] bg-[#161514] border border-white/5 space-y-4">
                <span className="block text-white font-extrabold text-base">
                  2. Set up TOTP
                </span>
                <p className="text-sm text-white/60 leading-relaxed font-satoshi">
                  Add this account to your authenticator app, then enter the 6-digit code to finish.
                </p>
                {totpQr && (
                  <div className="flex justify-center items-center py-2 bg-white/[0.02] rounded-2xl">
                    <img src={totpQr} alt="TOTP QR code" className="w-48 h-48 rounded-xl bg-white p-2" />
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 bg-[#0A0908] p-4 rounded-xl border border-white/5">
                  <span className="font-mono text-xs text-white/80 break-all select-all flex-1 min-w-0">
                    {totpUri || totpSecret}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(totpUri || totpSecret, 'Copied setup secret.')}
                    className="p-2 bg-white/[0.04] border border-white/5 rounded-lg text-white/70 hover:text-white transition-all cursor-pointer flex-shrink-0"
                  >
                    <ContentCopyIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-[24px] bg-[#161514] border border-white/5 space-y-4">
                <span className="block text-white font-extrabold text-base">
                  3. Verify TOTP
                </span>
                <input
                  type="text"
                  value={totpOtp}
                  onChange={(event) => setTotpOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  className="w-full bg-[#0A0908] px-4 py-3 rounded-xl border border-white/10 text-white text-sm font-semibold focus:outline-none focus:border-[#6366F1]"
                />
                <button
                  type="button"
                  onClick={verifyTotpSetup}
                  disabled={loading || totpOtp.trim().length !== 6 || !vaultUnlocked}
                  className="w-full px-5 py-3 rounded-xl bg-[#6366F1] hover:bg-[#5254E8] text-black font-black text-xs transition-all cursor-pointer flex-shrink-0 disabled:opacity-50"
                >
                  {loading && <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current" />}
                  <span>Verify and enable 2FA</span>
                </button>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold font-satoshi">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 'done' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-[24px] bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                <span className="block text-white font-extrabold text-base">
                  2FA is active
                </span>
                <p className="text-sm text-emerald-400/80 font-satoshi font-semibold">
                  Email and TOTP are both enabled.
                </p>
              </div>

              {recoveryCodes.length > 0 && (
                <div className="p-6 rounded-[24px] bg-[#161514] border border-white/5 space-y-4">
                  <span className="block text-white font-extrabold text-base">
                    Recovery codes
                  </span>
                  <p className="text-xs text-white/50 leading-relaxed font-satoshi">
                    {RECOVERY_COPY_HINT}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recoveryCodes.map((code) => (
                      <div key={code} className="p-3 rounded-xl bg-[#0A0908] border border-white/5 font-mono text-center text-white text-xs select-all">
                        {code}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(recoveryCodes.join('\n'), 'Recovery codes copied.')}
                    className="w-full py-2.5 px-4 rounded-xl border border-white/10 text-white font-extrabold text-xs hover:border-[#6366F1] hover:bg-[#6366F1]/5 transition-all cursor-pointer"
                  >
                    Copy recovery codes
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3.5 rounded-xl bg-[#6366F1] hover:bg-[#5254E8] text-black font-black text-sm transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
