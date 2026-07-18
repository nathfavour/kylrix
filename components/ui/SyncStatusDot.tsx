'use client';

import { isUnpersistedComposeDraft } from '@/lib/notes/compose-draft-registry';

/** Shared amber/green sync affordance for card + detail (live-copy pending flag only). */
export function SyncStatusDot({
  noteId,
  pending,
  epoch,
}: {
  noteId?: string | null;
  /** Prefer context `isPendingSync(id)` when available. */
  pending?: boolean;
  /** Subscribe to composeSyncEpoch so React re-evaluates. */
  epoch?: number;
}) {
  void epoch;
  const isPending =
    typeof pending === 'boolean'
      ? pending
      : Boolean(
          noteId &&
            (noteId.startsWith('live-') ||
              noteId.startsWith('ghost-') ||
              isUnpersistedComposeDraft(noteId)),
        );

  if (isPending) {
    return (
      <span
        className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]"
        title="Not saved yet"
      />
    );
  }

  return (
    <span
      className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
      title="Saved"
    />
  );
}
