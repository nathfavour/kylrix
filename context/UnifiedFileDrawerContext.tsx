'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface SyncedMediaFile {
  $id: string;
  name: string;
  bucketId: string;
  sizeOriginal: number;
  mimeType?: string;
  createdAt?: string;
  fileUrl?: string;
}

interface OpenFileDrawerOptions {
  onSelectFile: (file: SyncedMediaFile) => void;
  allowedBuckets?: string[];
  title?: string;
}

interface UnifiedFileDrawerContextType {
  isOpen: boolean;
  options: OpenFileDrawerOptions | null;
  openFileDrawer: (opts: OpenFileDrawerOptions) => void;
  closeFileDrawer: () => void;
}

const UnifiedFileDrawerContext = createContext<UnifiedFileDrawerContextType | undefined>(undefined);

export function UnifiedFileDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OpenFileDrawerOptions | null>(null);

  const openFileDrawer = useCallback((opts: OpenFileDrawerOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const closeFileDrawer = useCallback(() => {
    setIsOpen(false);
    setOptions(null);
  }, []);

  return (
    <UnifiedFileDrawerContext.Provider value={{ isOpen, options, openFileDrawer, closeFileDrawer }}>
      {children}
    </UnifiedFileDrawerContext.Provider>
  );
}

export function useUnifiedFileDrawer() {
  const ctx = useContext(UnifiedFileDrawerContext);
  if (!ctx) {
    throw new Error('useUnifiedFileDrawer must be used within a UnifiedFileDrawerProvider');
  }
  return ctx;
}
