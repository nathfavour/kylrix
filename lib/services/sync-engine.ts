'use client';

/**
 * Autonomic sync engine — source of truth for note amber/green.
 * Pending queue is client-only in RxDB cache (never Appwrite columns / payloads).
 */

import { markNotePersistedRemote, markComposePersisted, markComposeDraft } from '@/lib/notes/compose-draft-registry';
import { updateNote, createNote } from '@/lib/actions/client-ops';
import { getNote, getNotePublicState } from '@/lib/appwrite';
import { pickNoteAutosavePayload } from '@/lib/appwrite/note';
import { getLiveNoteForSync } from '@/lib/sync/pending-sync-bridge';
import type { Notes } from '@/types/appwrite';

const PENDING_QUEUE_KEY = 'kylrix:sync:pending-queue';

/** noteId → live revision string we still owe upstream */
const pendingById = new Map<string, string>();
const statusListeners = new Set<() => void>();

let globalIntensity = 0;
let lastKeystrokeTime = 0;
let lastPullAt = 0;
let syncTimeout: NodeJS.Timeout | null = null;
let isSyncing = false;
let persistWriteChain: Promise<void> = Promise.resolve();

const activityListeners = new Set<(intensity: number) => void>();

function notifyStatusListeners() {
  statusListeners.forEach((l) => l());
}

function queueSnapshot(): Record<string, string> {
  const obj: Record<string, string> = {};
  pendingById.forEach((rev, id) => {
    obj[id] = rev;
  });
  return obj;
}

/** One-shot bridge: older builds used sessionStorage. */
function absorbSessionStorageQueue() {
  if (typeof window === 'undefined') return;
  try {
    const raw = sessionStorage.getItem(PENDING_QUEUE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      for (const [id, rev] of Object.entries(parsed)) {
        if (id && rev) pendingById.set(id, String(rev));
      }
    }
    sessionStorage.removeItem(PENDING_QUEUE_KEY);
  } catch {
    // ignore
  }
}

/** Persist pending queue in RxDB cache (IndexedDB) — survives browser close / offline. */
function writePersistedQueue() {
  if (typeof window === 'undefined') return;
  persistWriteChain = persistWriteChain.then(async () => {
    const snapshot = queueSnapshot();
    try {
      const { getRxDB } = await import('@/lib/webrtc/RxDBManager');
      const db = await getRxDB();
      await db.cache.upsert({
        id: PENDING_QUEUE_KEY,
        data: snapshot,
        timestamp: Date.now(),
      });
    } catch {
      // ignore storage failures — in-memory map still drives the UI
    }
  });
}

async function hydratePendingQueue() {
  if (typeof window === 'undefined') return;
  absorbSessionStorageQueue();
  persistWriteChain = persistWriteChain.then(async () => {
    try {
      const { getRxDB } = await import('@/lib/webrtc/RxDBManager');
      const db = await getRxDB();
      const doc = await db.cache.findOne(PENDING_QUEUE_KEY).exec();
      const stored = (doc?.data && typeof doc.data === 'object' ? doc.data : {}) as Record<
        string,
        string
      >;
      for (const [id, rev] of Object.entries(stored)) {
        if (id && rev) pendingById.set(id, String(rev));
      }
      await db.cache.upsert({
        id: PENDING_QUEUE_KEY,
        data: queueSnapshot(),
        timestamp: Date.now(),
      });
    } catch {
      // RxDB unavailable — memory (+ absorbed session) still works this session
    }
    notifyStatusListeners();
  });
  await persistWriteChain;
}

if (typeof window !== 'undefined') {
  absorbSessionStorageQueue();
  void hydratePendingQueue();

  const handleUserActivity = (e: Event) => {
    const now = Date.now();
    if (e.type === 'keydown' || e.type === 'input') {
      const delta = now - lastKeystrokeTime;
      lastKeystrokeTime = now;
      if (delta < 250) globalIntensity = Math.min(10, globalIntensity + 2);
      else if (delta < 1000) globalIntensity = Math.min(10, globalIntensity + 0.5);
      else globalIntensity = Math.max(0.5, globalIntensity - 1);
    } else {
      globalIntensity = Math.max(0.2, globalIntensity - 0.2);
    }
    activityListeners.forEach((l) => l(globalIntensity));
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
  const waitDuration = globalIntensity >= 5 ? 4000 : 12000;
  syncTimeout = setTimeout(() => {
    void autonomicSyncEngine.runCycle();
  }, waitDuration);
}

function revisionOf(note: Notes | null | undefined): string {
  if (!note) return '';
  return String(note.updatedAt || note.$updatedAt || '').trim();
}

export const autonomicSyncEngine = {
  subscribeToActivity(callback: (intensity: number) => void) {
    activityListeners.add(callback);
    return () => {
      activityListeners.delete(callback);
    };
  },

  getActivityIntensity() {
    return globalIntensity;
  },

  nudge() {
    triggerAutonomicSyncScheduler();
  },

  getLastPullAt() {
    return lastPullAt;
  },

  markPullComplete(at = Date.now()) {
    lastPullAt = at;
  },

  /** Subscribe to pending-queue changes (amber/green). */
  subscribe(listener: () => void) {
    statusListeners.add(listener);
    return () => {
      statusListeners.delete(listener);
    };
  },

  /**
   * Enqueue a live revision for push. Client-only — never an Appwrite field.
   * Also mirrors compose-draft membership for create-lifecycle helpers.
   */
  markPending(noteId: string, revision?: string | null) {
    const id = String(noteId || '').trim();
    if (!id) return;
    const rev = String(revision || Date.now()).trim() || String(Date.now());
    pendingById.set(id, rev);
    markComposeDraft(id);
    writePersistedQueue();
    notifyStatusListeners();
    triggerAutonomicSyncScheduler();
  },

  /** True while engine still owes upstream a flush for this id. */
  isPending(noteId?: string | null) {
    const id = String(noteId || '').trim();
    if (!id) return false;
    if (id.startsWith('live-') || id.startsWith('ghost-')) return true;
    return pendingById.has(id);
  },

  listPendingIds(): string[] {
    return Array.from(pendingById.keys());
  },

  /** Confirmed remote accept for this id (optionally this revision). */
  ack(noteId: string, flushedRevision?: string | null) {
    const id = String(noteId || '').trim();
    if (!id) return;
    const queued = pendingById.get(id);
    const flushed = String(flushedRevision || '').trim();
    if (flushed && queued && queued !== flushed) {
      // Newer local revision arrived while flush ran — stay amber.
      notifyStatusListeners();
      return;
    }
    pendingById.delete(id);
    markComposePersisted(id);
    markNotePersistedRemote(id);
    writePersistedQueue();
    notifyStatusListeners();
  },

  /**
   * Push pending live-copy notes to Appwrite.
   * Payload = pickNoteAutosavePayload only (no pending flags).
   */
  async runCycle() {
    if (isSyncing) return;
    isSyncing = true;

    try {
      const pendingIds = Array.from(pendingById.keys());
      if (pendingIds.length === 0) return;

      console.log(`[SyncEngine] Spun up. Found ${pendingIds.length} pending live notes.`);

      const { getRxDB } = await import('@/lib/webrtc/RxDBManager');
      const db = await getRxDB().catch(() => null);

      for (const noteId of pendingIds) {
        if (!pendingById.has(noteId)) continue;
        const queuedRevision = pendingById.get(noteId) || '';

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

        const dataPayload = {
          ...pickNoteAutosavePayload(payload),
          isPublic: getNotePublicState(payload),
          isGuest: !!payload.isGuest,
        };

        if (!String(dataPayload.content || '').trim() && !String(dataPayload.title || '').trim()) {
          console.warn(`[SyncEngine] Ignored empty pending note: ${noteId}`);
          continue;
        }

        const flushRevision = revisionOf(payload) || queuedRevision;

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

          if (db) {
            await db.cache.upsert({
              id: `note_${noteId}`,
              data: syncedNote as any,
              timestamp: Date.now(),
            }).catch(() => {});
          }

          const liveAfter = getLiveNoteForSync(noteId);
          const liveRev = revisionOf(liveAfter);
          if (liveRev && flushRevision && liveRev !== flushRevision) {
            pendingById.set(noteId, liveRev);
            markComposeDraft(noteId);
            writePersistedQueue();
            notifyStatusListeners();
            console.log(`[SyncEngine] Re-queued note after concurrent edit: ${noteId}`);
            window.dispatchEvent(
              new CustomEvent('kylrix:sync-pending', { detail: { noteId } }),
            );
          } else {
            autonomicSyncEngine.ack(noteId, flushRevision);
            window.dispatchEvent(
              new CustomEvent('kylrix:sync-complete', {
                detail: { noteId, syncedNote, revision: flushRevision },
              }),
            );
          }
          console.log(`[SyncEngine] Successfully synced note: ${noteId}`);
        } catch (err) {
          console.error(`[SyncEngine] Sync failed for item ${noteId}:`, err);
          // Stay pending — amber remains trustworthy.
          notifyStatusListeners();
        }
      }
    } catch (error) {
      console.error('[SyncEngine] Autonomic sync error:', error);
    } finally {
      isSyncing = false;
      triggerAutonomicSyncScheduler();
    }
  },
};
