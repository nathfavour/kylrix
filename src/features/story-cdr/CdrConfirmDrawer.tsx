'use client';

import React, { useState } from 'react';
import { Shield, X } from 'lucide-react';
import { account, invalidateCurrentUserCache } from '@/lib/appwrite';
import { toast } from 'react-hot-toast';

interface CdrConfirmDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CdrConfirmDrawer({ open, onClose, onSuccess }: CdrConfirmDrawerProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const currentPrefs = await account.getPrefs();
      await account.updatePrefs({ ...currentPrefs, cdr_enabled: true });
      invalidateCurrentUserCache();
      toast.success('Confidential Data Rails activated successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('[Story-CDR] Activation failed:', err);
      toast.error(err.message || 'Failed to activate Confidential Data Rails');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1500] flex items-end md:items-stretch md:justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer Content Container */}
      <div 
        className="relative w-full md:max-w-[480px] bg-black border-t md:border-t-0 md:border-l border-[#1f1f1f] rounded-t-[32px] md:rounded-t-none p-6 md:p-8 text-white z-10 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] flex flex-col justify-between max-h-[90vh] md:max-h-screen overflow-y-auto transition-transform duration-300"
      >
        <div className="flex-1">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#6366F1]/10 text-[#6366F1]">
                <Shield size={24} />
              </div>
              <h3 className="text-lg font-black font-mono leading-tight">
                Story CDR Beta
              </h3>
            </div>
            <button 
              onClick={onClose} 
              className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="mb-8">
            <h4 className="text-white font-black text-xl mb-3 font-mono tracking-tight leading-snug">
              Activate Sovereign On-Chain Data Rails?
            </h4>
            <p className="text-white/60 text-sm leading-relaxed font-sans">
              This routes your sensitive data credentials and TOTP seeds through hardware-isolated TEE enclaves on the Story Aeneid Testnet. Access permissions are regulated strictly via decentralized smart contracts tied to your internal EVM wallet identity.
            </p>
          </div>

          {/* Additional info badge */}
          <div className="p-5 bg-[#161412] border border-[#1f1f1f] rounded-2xl mb-8">
            <span className="text-[10px] text-white/40 font-black uppercase tracking-wider block mb-1.5 font-mono">
              Aeneid Testnet Deployment
            </span>
            <p className="text-white/80 text-xs leading-normal">
              Vault operations will intercept standard flows and securely upload data rails using threshold cryptography and the pre-deployed OwnerWriteCondition.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-3 mt-auto flex-shrink-0">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-[#6366F1] hover:bg-[#5458E8] text-white font-black text-sm flex items-center justify-center gap-2 font-mono transition duration-200 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed select-none"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4.5 w-4.5 border-t-2 border-b-2 border-current" />
            )}
            <span>{loading ? 'Activating...' : 'Activate Data Rails'}</span>
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 font-extrabold text-sm font-mono transition duration-200 disabled:opacity-50 select-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
