'use client';

import React from 'react';
import { Wallet, Zap, X } from 'lucide-react';
import Logo from './Logo';

interface PaymentMethodDrawerProps {
  onClose: () => void;
  months: number;
  totalPrice: number;
  onPaymentMethodSelect: (method: 'kylrix' | 'external') => void;
}

const PaymentMethodDrawer: React.FC<PaymentMethodDrawerProps> = ({
  onClose,
  months,
  totalPrice,
  onPaymentMethodSelect,
}) => {
  const planDuration = months === 1 ? '1 Month' : `${months} Months`;

  return (
    <>
      {/* Backdrop with Blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ease-in-out cursor-default"
        onClick={onClose}
      />
      
      {/* Slide-up Container */}
      <div className="fixed bottom-0 left-0 right-0 max-h-[85vh] md:max-h-[70vh] bg-gradient-to-b from-[#1F1D1B] to-[#161412] border-t border-white/8 rounded-t-[28px] z-[100] text-white p-6 md:p-8 flex flex-col gap-6 animate-slide-up overflow-y-auto">
        <div className="w-10 h-1 bg-white/12 rounded-[2px] mx-auto mb-2 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-white text-lg font-black tracking-tight leading-tight">
              Payment Method
            </h3>
            <p className="text-white/40 text-[11px] font-bold mt-1 uppercase tracking-wider font-mono">
              {planDuration} Pro • ${totalPrice.toFixed(2)}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white bg-white/2 hover:bg-white/5 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4">
          {/* Kylrix Wallet */}
          <button
            onClick={() => {
              onPaymentMethodSelect('kylrix');
              onClose();
            }}
            className="w-full p-5 rounded-[20px] border-2 border-[#6366F1]/30 hover:border-[#6366F1] bg-[#6366F1]/6 hover:bg-[#6366F1]/12 text-left flex items-center gap-4 transition-all duration-300 group"
          >
            {/* Logo with wallet icon */}
            <div className="relative w-11 h-11 flex-shrink-0">
              <Logo size={44} variant="icon" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-[#6366F1] flex items-center justify-center border-2 border-black shadow-[0_2px_8px_rgba(99,102,241,0.3)]">
                <Wallet size={12} className="text-white" />
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <span className="block text-white font-black text-sm md:text-base leading-snug">
                Kylrix Wallet
              </span>
              <span className="block text-white/40 text-[11px] font-bold mt-0.5">
                Ecosystem wallet
              </span>
            </div>

            {/* Arrow */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#6366F1] flex-shrink-0 transition-transform group-hover:translate-x-1"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          {/* External Wallet */}
          <button
            onClick={() => {
              onPaymentMethodSelect('external');
              onClose();
            }}
            className="w-full p-5 rounded-[20px] border border-white/12 hover:border-white/25 bg-white/2 hover:bg-white/5 text-left flex items-center gap-4 transition-all duration-300 group"
          >
            {/* Icon */}
            <div className="w-11 h-11 rounded-[14px] bg-white/8 flex items-center justify-center flex-shrink-0">
              <Zap size={20} className="text-white/40" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <span className="block text-white font-black text-sm md:text-base leading-snug">
                External Wallet
              </span>
              <span className="block text-white/30 text-[11px] font-bold mt-0.5">
                MetaMask, Trust Wallet, etc.
              </span>
            </div>

            {/* Arrow */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/30 flex-shrink-0 transition-transform group-hover:translate-x-1"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/8 text-center">
          <span className="text-[10px] text-white/30 font-black uppercase tracking-wider block">
            🔒 Your payment is encrypted and secure
          </span>
        </div>
      </div>
    </>
  );
};

export default PaymentMethodDrawer;
