import type { Notes } from '@/types/appwrite';

/** Client-side encrypted note guard (metadata + legacy column). */
export function isClientEncryptedNote(note: Notes | null | undefined): boolean {
  if (!note) return false;
  try {
    const meta = JSON.parse(note.metadata || '{}');
    return (
      meta.isEncrypted === true ||
      meta.isEncrypted === 'true' ||
      (note as { isEncrypted?: boolean }).isEncrypted === true
    );
  } catch {
    return (note as { isEncrypted?: boolean }).isEncrypted === true;
  }
}

/** Map pinned IDs to loaded note rows, preserving pin order. */
export function resolvePinnedNoteRows(pinnedIds: string[], notes: Notes[]): Notes[] {
  return pinnedIds
    .map((id) => notes.find((n) => n.$id === id))
    .filter((n): n is Notes => Boolean(n))
    .filter((n) => !isClientEncryptedNote(n));
}
