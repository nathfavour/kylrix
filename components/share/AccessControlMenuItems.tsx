'use client';

import React from 'react';
import { Share2, ShieldAlert } from 'lucide-react';
import { useUnifiedDrawer } from '@/context/UnifiedDrawerContext';
import { PublicResourceType } from '@/lib/share/resource-types';

interface AccessControlMenuItemsProps {
  resourceType: PublicResourceType;
  resourceId: string;
  isPublic: boolean;
  isGuest: boolean;
  resourceTitle?: string;
  projectId?: string;
  onUpdate?: () => void;
}

export function useAccessControlMenuItems({
  resourceType,
  resourceId,
  isPublic,
  isGuest,
  resourceTitle,
  projectId,
  onUpdate
}: AccessControlMenuItemsProps) {
  const { open: openUnified } = useUnifiedDrawer();

  const isActive = isPublic || isGuest;

  return [
    {
      label: isActive ? 'Stop Sharing' : 'Share',
      icon: isActive ? <ShieldAlert size={16} className="text-red-500" /> : <Share2 size={16} />,
      onClick: () => {
        openUnified('access-control', {
          resourceType,
          resourceId,
          isPublic,
          isGuest,
          resourceTitle: resourceTitle || 'Item',
          projectId,
          onUpdate
        });
      }
    }
  ];
}
