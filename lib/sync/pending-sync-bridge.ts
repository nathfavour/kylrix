/**
 * Client-only pending-sync bridge.
 * Never serialized to Appwrite — sync engine reads live payloads via getter.
 */

import type { Notes } from '@/types/appwrite';

type LiveNoteGetter = (noteId: string) => Notes | null | undefined;

let liveNoteGetter: LiveNoteGetter | null = null;

const pendingListeners = new Set<() => void>();

export function registerLiveNoteGetter(getter: LiveNoteGetter | null): void {
  liveNoteGetter = getter;
}

export function getLiveNoteForSync(noteId: string): Notes | null {
  const id = String(noteId || '').trim();
  if (!id || !liveNoteGetter) return null;
  return liveNoteGetter(id) || null;
}

export function notifyPendingSyncListeners(): void {
  pendingListeners.forEach((l) => l());
}

export function subscribePendingSync(listener: () => void): () => void {
  pendingListeners.add(listener);
  return () => {
    pendingListeners.delete(listener);
  };
}
