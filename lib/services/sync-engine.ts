'use client';

import { isUnpersistedComposeDraft, listUnpersistedComposeDraftIds, markNotePersistedRemote, markComposePersisted } from '@/lib/notes/compose-draft-registry';
import { updateNote, createNote } from '@/lib/actions/client-ops';
import { getNote, getNotePublicState } from '@/lib/appwrite';
import { pickNoteAutosavePayload } from '@/lib/appwrite/note';
import { getLiveNoteForSync } from '@/lib/sync/pending-sync-bridge';
import type { Notes } from '@/types/appwrite';

// Global user activity tracking properties
let globalIntensity = 0;
let lastKeystrokeTime = 0;
let lastPullAt = 0;
let syncTimeout: NodeJS.Timeout | null = null;
let isSyncing = false;

// Dynamic listener registries
const activityListeners = new Set<(intensity: number) => void>();

/**
 * Global User Activity Intensity Tracker
 * Detects keyup/keydown events globally to compute real-time user intensity.
 */
if (typeof window !== 'undefined') {
  const handleUserActivity = (e: Event) => {
    const now = Date.now();
    
    // Keystroke frequency calculation
    if (e.type === 'keydown' || e.type === 'input') {
      const delta = now - lastKeystrokeTime;
      lastKeystrokeTime = now;

      if (delta < 250) {
        // High activity rate: rapid typing
        globalIntensity = Math.min(10, globalIntensity + 2);
      } else if (delta < 1000) {
        // Moderate typing
        globalIntensity = Math.min(10, globalIntensity + 0.5);
      } else {
        // Single strokes or reading transitions
        globalIntensity = Math.max(0.5, globalIntensity - 1);
      }
    } else {
      // General movement or scroll events - keep min active level
      globalIntensity = Math.max(0.2, globalIntensity - 0.2);
    }

    // Notify listeners
    activityListeners.forEach((l) => l(globalIntensity));

    // Intensity-aware Sync scheduler
    triggerAutonomicSyncScheduler();
  };

  window.addEventListener('keydown', handleUserActivity, { passive: true });
  window.addEventListener('input', handleUserActivity, { passive: true });
  window.addEventListener('scroll', handleUserActivity, { passive: true });
  window.addEventListener('click', handleUserActivity, { passive: true });
}

function triggerAutonomicSyncScheduler() {
  if (syncTimeout) clearTimeout(syncTimeout);
  if (isSyncing) return;

  // Compute wait duration dynamically based on activity intensity
  // Highly intense typing -> check draft buffer every 4 seconds
  // Mild/idle states -> check draft buffer every 12 seconds
  const waitDuration = globalIntensity >= 5 ? 4000 : 12000;

  syncTimeout = setTimeout(() => {
    void autonomicSyncEngine.runCycle();
  }, waitDuration);
}

/**
 * Autonomous Sync Engine
 * Scans offline state layers, filters out invalid drafts, and pushes them to Appwrite.
 */
export const autonomicSyncEngine = {
  /**
   * Subscribe to global activity intensity changes
   */
  subscribeToActivity(callback: (intensity: number) => void) {
    activityListeners.add(callback);
    return () => {
      activityListeners.delete(callback);
    };
  },

  /**
   * Grab current global activity intensity
   */
  getActivityIntensity() {
    return globalIntensity;
  },

  /** Schedule a push cycle soon (after local edits mark pending). */
  nudge() {
    triggerAutonomicSyncScheduler();
  },

  /** Last successful soft/hard pull timestamp (ms). */
  getLastPullAt() {
    return lastPullAt;
  },

  /** Call after a live-copy pull completes (success or soft fail with retained local). */
  markPullComplete(at = Date.now()) {
    lastPullAt = at;
  },

  /**
   * Scan pending live-copy notes and push to Appwrite.
   * Payload comes from live copy (preferred) or RxDB cache — never ships pending flags.
   */
  async runCycle() {
    if (isSyncing) return;
    isSyncing = true;

    try {
      const pendingIds = listUnpersistedComposeDraftIds();
      if (pendingIds.length === 0) return;

      console.log(`[SyncEngine] Spun up. Found ${pendingIds.length} pending live notes.`);

      const { getRxDB } = await import('@/lib/webrtc/RxDBManager');
      const db = await getRxDB().catch(() => null);

      for (const noteId of pendingIds) {
        if (!isUnpersistedComposeDraft(noteId)) continue;

        let payload: Notes | null = getLiveNoteForSync(noteId);

        if (!payload && db) {
          try {
            const doc = await db.cache.findOne(`note_${noteId}`).exec();
            payload = (doc?.data as Notes) || null;
          } catch {
            payload = null;
          }
        }

        if (!payload) {
          console.warn(`[SyncEngine] No live payload for pending id: ${noteId}`);
          continue;
        }

        // Remote payload: strip anything that is not a real note column.
        const dataPayload = {
          ...pickNoteAutosavePayload(payload),
          isPublic: getNotePublicState(payload),
          isGuest: !!payload.isGuest,
        };

        if (!String(dataPayload.content || '').trim() && !String(dataPayload.title || '').trim()) {
          console.warn(`[SyncEngine] Ignored empty pending note: ${noteId}`);
          continue;
        }

        try {
          let remoteNote: Notes | null = null;
          try {
            remoteNote = await getNote(noteId);
          } catch {
            remoteNote = null;
          }

          let syncedNote: Notes;
          if (remoteNote) {
            syncedNote = await updateNote(noteId, dataPayload);
          } else {
            syncedNote = await createNote({
              ...dataPayload,
              $id: noteId,
            });
          }

          markComposePersisted(noteId);
          markNotePersistedRemote(noteId);

          if (db) {
            await db.cache.upsert({
              id: `note_${noteId}`,
              data: syncedNote as any,
              timestamp: Date.now(),
            }).catch(() => {});
          }

          // If the user edited again while this flush ran, keep amber / pending.
          const liveAfter = getLiveNoteForSync(noteId);
          const flushedAt = String(payload.updatedAt || payload.$updatedAt || '');
          const liveAt = String(liveAfter?.updatedAt || liveAfter?.$updatedAt || '');
          const stillDirty =
            !!liveAfter &&
            flushedAt &&
            liveAt &&
            liveAt !== flushedAt;

          if (stillDirty) {
            const { markComposeDraft } = await import('@/lib/notes/compose-draft-registry');
            markComposeDraft(noteId);
            window.dispatchEvent(new CustomEvent('kylrix:sync-pending', {
              detail: { noteId },
            }));
            console.log(`[SyncEngine] Re-queued note after concurrent edit: ${noteId}`);
          } else {
            window.dispatchEvent(new CustomEvent('kylrix:sync-complete', {
              detail: { noteId, syncedNote },
            }));
          }
          console.log(`[SyncEngine] Successfully synced note: ${noteId}`);
        } catch (err) {
          console.error(`[SyncEngine] Sync failed for item ${noteId}:`, err);
        }
      }
    } catch (error) {
      console.error('[SyncEngine] Autonomic sync error:', error);
    } finally {
      isSyncing = false;
      triggerAutonomicSyncScheduler();
    }
  }
};
