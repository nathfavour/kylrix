'use client';

import React from 'react';
import { 
  Link, 
  ShieldX, 
  ShieldCheck, 
  Lock,
  Globe,
  Users,
  Settings2,
  Check
} from 'lucide-react';
import { toggleResourcePublicGuest } from '@/lib/actions/client-ops';
import { buildPublicResourceUrl } from '@/lib/share/public-url';
import { PublicResourceType } from '@/lib/share/resource-types';
import { useToast } from '@/hooks/useToast';
import { useUnifiedDrawer } from '@/context/UnifiedDrawerContext';

interface AccessControlMenuItemsProps {
  resourceType: PublicResourceType;
  resourceId: string;
  isPublic: boolean;
  isGuest: boolean;
  resourceTitle?: string;
  projectId?: string;
  onUpdate?: () => void;
}

/**
 * Ruthless Sharing: Context menu items for public resources and collaborators.
 */
export function useAccessControlMenuItems({
  resourceType,
  resourceId,
  isPublic,
  isGuest,
  resourceTitle,
  projectId,
  onUpdate
}: AccessControlMenuItemsProps) {
  const { showSuccess, showError } = useToast();
  const { open: openUnified } = useUnifiedDrawer();

  const handleCopyLink = async () => {
    try {
      const publicUrl = buildPublicResourceUrl(resourceType, resourceId, { projectId });
      await navigator.clipboard.writeText(publicUrl);
      showSuccess('Link copied', 'Anyone with the link can view');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Try again in a moment.';
      showError('Could not copy link', message);
    }
  };

  const handleToggleGuest = async (enable: boolean) => {
    try {
      const res = await toggleResourcePublicGuest({
        resourceType,
        resourceId,
        mode: enable ? 'guest_on' : 'guest_off',
        projectId
      });
      if (res.success) {
        showSuccess(
          enable ? 'Guest access enabled' : 'Guest access disabled',
          enable ? 'Anyone with the link can view' : 'Only authenticated users can view'
        );
        if (onUpdate) onUpdate();
      }
    } catch (err: any) {
      showError('Failed to update access', err.message);
    }
  };

  const handleTogglePublic = async (enable: boolean) => {
    try {
      const res = await toggleResourcePublicGuest({
        resourceType,
        resourceId,
        mode: enable ? 'publish' : 'make_private',
        projectId
      });
      if (res.success) {
        showSuccess(
          enable ? 'Public access enabled' : 'Public access disabled',
          enable ? 'Anyone with the link can view' : 'All public links are now invalidated'
        );
        if (onUpdate) onUpdate();
      }
    } catch (err: any) {
      showError('Failed to update access', err.message);
    }
  };

  const isActive = isPublic || isGuest;

  return [
    {
      label: 'Access Control',
      icon: <Settings2 size={16} />,
      submenu: [
        ...(isActive ? [
          {
            label: 'Copy public link',
            icon: <Link size={16} />,
            onClick: handleCopyLink
          }
        ] : []),
        {
          label: 'Public access',
          icon: isPublic ? <Check size={16} className="text-[#10B981]" /> : <Globe size={16} />,
          onClick: () => handleTogglePublic(!isPublic)
        },
        {
          label: 'Guest access',
          icon: isGuest ? <Check size={16} className="text-[#10B981]" /> : <ShieldCheck size={16} />,
          onClick: () => handleToggleGuest(!isGuest)
        }
      ]
    }
  ];
}
