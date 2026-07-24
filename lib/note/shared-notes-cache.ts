import type { Notes } from '@/types/appwrite';
import { getNotePublicState } from '@/lib/appwrite/note';

export type SharedNoteRow = Notes & {
  sharedPermission?: string;
  sharedAt?: string;
  sharedBy?: { name: string; email: string } | null;
};

export interface SharedNotesPartition {
  privateNotes: SharedNoteRow[];
  sharedPublicNotes: SharedNoteRow[];
}

/** In-memory session cache — survives client navigations within the same tab. */
let sessionSharedRows: SharedNoteRow[] | null = null;

export function getSessionSharedNotes(): SharedNoteRow[] | null {
  if (sessionSharedRows) return sessionSharedRows;
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('kylrix_session_shared_notes');
    if (raw) {
      sessionSharedRows = JSON.parse(raw);
      return sessionSharedRows;
    }
  } catch {}
  return null;
}

export function setSessionSharedNotes(rows: SharedNoteRow[]): void {
  sessionSharedRows = rows;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('kylrix_session_shared_notes', JSON.stringify(rows));
    } catch {}
  }
}

export function partitionSharedNotes(rows: SharedNoteRow[]): SharedNotesPartition {
  const privateNotes = rows.filter((n) => !getNotePublicState(n));
  const sharedPublicNotes = rows.filter((n) => getNotePublicState(n));
  return { privateNotes, sharedPublicNotes };
}

export function sharedNotesCacheKey(userId: string): string {
  return `shared_notes_${userId}`;
}

export function myPublicNotesCacheKey(userId: string): string {
  return `my_public_notes_${userId}`;
}

export function mergeNotesById<T extends Notes>(...lists: T[][]): T[] {
  const byId = new Map<string, T>();
  for (const list of lists) {
    for (const note of list) {
      if (note?.$id) byId.set(note.$id, note);
    }
  }
  return Array.from(byId.values());
}
