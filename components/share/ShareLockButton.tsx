'use client';

import React, { useState } from 'react';
import { Lock, Link, Loader2 } from 'lucide-react';
import { toggleResourcePublicGuest } from '@/lib/actions/client-ops';
import { PublicResourceType } from '@/lib/share/resource-types';
import { useToast } from '@/hooks/useToast';
import { Tooltip, IconButton } from '@/lib/mui-tailwind/material';

interface ShareLockButtonProps {
  resourceType: PublicResourceType;
  resourceId: string;
  isPublic: boolean;
  isGuest: boolean;
  accentColor?: string;
  projectId?: string;
  onPublished?: () => void;
  canPublish?: boolean;
  blockReason?: string;
}

/**
 * Ruthless Sharing: One-tap publish button.
 * Transforms from Lock (private) to Link (public).
 */
export function ShareLockButton({
  resourceType,
  resourceId,
  isPublic,
  isGuest,
  accentColor = '#6366F1',
  projectId,
  onPublished,
  canPublish = true,
  blockReason
}: ShareLockButtonProps) {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    
    // 1. Check blockages (e.g. TOTP or encrypted notes)
    if (!canPublish && !isPublic) {
      showError('Cannot share', blockReason || 'This resource cannot be shared publicly.');
      return;
    }

    // 2. If already public, just re-copy link (no accidental unpublish)
    if (isPublic || isGuest) {
      setLoading(true);
      try {
        const res = await toggleResourcePublicGuest({
          resourceType,
          resourceId,
          mode: 'copy_only',
          projectId
        });
        if (res.publicUrl) {
          await navigator.clipboard.writeText(res.publicUrl);
          showSuccess('Link copied', 'Anyone with the link can view');
        }
      } catch (err: any) {
        showError('Failed to copy link', err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 3. Publish to web
    setLoading(true);
    try {
      const res = await toggleResourcePublicGuest({
        resourceType,
        resourceId,
        mode: 'publish',
        projectId
      });
      if (res.success && res.publicUrl) {
        await navigator.clipboard.writeText(res.publicUrl);
        showSuccess('Published & Link copied', 'Anyone with the link can view');
        if (onPublished) onPublished();
      }
    } catch (err: any) {
      showError('Failed to publish', err.message);
    } finally {
      setLoading(false);
    }
  };

  const isActive = isPublic || isGuest;

  return (
    <Tooltip 
      title={!canPublish && !isActive ? blockReason || 'Cannot share' : isActive ? 'Copy public link' : 'Publish to web'}
      placement="top"
    >
      <IconButton
        onClick={handleToggle}
        disabled={loading}
        sx={{
          width: 32,
          height: 32,
          color: isActive ? accentColor : 'rgba(255, 255, 255, 0.15)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            color: isActive ? accentColor : 'white',
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            transform: 'scale(1.1)',
          },
          '&.Mui-disabled': {
             color: 'rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isActive ? (
          <Link size={14} />
        ) : (
          <Lock size={14} />
        )}
      </IconButton>
    </Tooltip>
  );
}
