'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { 
  SubscriptionTier, 
  PaymentMethod, 
  RegionConfig, 
  PPP_CONFIG, 
  calculateSubscriptionPrice 
} from '@/lib/subscription/ppp';

interface SubscriptionState {
  currentTier: SubscriptionTier;
  detectedRegion: RegionConfig;
  paymentMethod: PaymentMethod;
  isLoading: boolean;
  prices: Record<SubscriptionTier, number>;
  
  // Actions
  setPaymentMethod: (method: PaymentMethod) => void;
  setRegion: (countryCode: string) => void;
  refreshPrices: () => void;
}

const SubscriptionContext = createContext<SubscriptionState | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('PRO'); // Default to PRO/Starter
  const [regionCode, setRegionCode] = useState<string>('DEFAULT');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CRYPTO');
  const [isLoading, setIsLoading] = useState(true);

  // Derived region from the config
  const detectedRegion = useMemo(() => 
    PPP_CONFIG[regionCode] || PPP_CONFIG.DEFAULT, 
  [regionCode]);

  // Derived prices for all three tiers based on state
  const prices = useMemo(() => ({
    PRO: calculateSubscriptionPrice('PRO', regionCode, paymentMethod),
    ULTRA: calculateSubscriptionPrice('ULTRA', regionCode, paymentMethod),
    ENTERPRISE: calculateSubscriptionPrice('ENTERPRISE', regionCode, paymentMethod),
  }), [regionCode, paymentMethod]);

  // Initial detection or preference loading
  useEffect(() => {
    // In a real implementation, this would fetch the user's IP/profile and their active tier from Appwrite
    const initSubscription = async () => {
      try {
        // Mock IP-based detection or Appwrite Session prefs
        // setRegionCode('NG'); // example
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize subscription context', error);
        setIsLoading(false);
      }
    };
    initSubscription();
  }, []);

  const value: SubscriptionState = {
    currentTier,
    detectedRegion,
    paymentMethod,
    isLoading,
    prices,
    setPaymentMethod,
    setRegion: setRegionCode,
    refreshPrices: () => {}, // Handled by useMemo dependencies
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
