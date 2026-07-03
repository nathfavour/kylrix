'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getNote, cachePublicNoteDecryptionKey } from '@/lib/appwrite';
import { deleteNote } from '@/lib/actions/client-ops';
import type { Notes } from '@/types/appwrite';
import { NoteDetailSidebar } from '@/components/ui/NoteDetailSidebar';
import { useToast } from '@/components/ui/Toast';
import CommentsSection from '@/app/(app)/app/(app)/notes/Comments';
import NoteReactions from '@/app/(app)/app/(app)/notes/NoteReactions';
import { useDataNexus } from '@/context/DataNexusContext';

export default function NoteEditorPageClient() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const decryptionKey = searchParams.get('key');

  const [rawNote, setRawNote] = useState<Notes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showSuccess, showError } = useToast();
  const { fetchOptimized, setCachedData, invalidate, getCachedData } = useDataNexus();

  const CACHE_KEY = useMemo(() => (id ? `note_${id}` : null), [id]);

  useEffect(() => {
    if (id && decryptionKey) {
      cachePublicNoteDecryptionKey(id as string, decryptionKey);
    }
  }, [id, decryptionKey]);

  const note = rawNote;

  useEffect(() => {
    let mounted = true;

    if (!id || !CACHE_KEY) {
      setIsLoading(false);
      return;
    }

    const cached = getCachedData<Notes>(CACHE_KEY);
    if (cached) {
      setRawNote(cached);
      setIsLoading(false);
    }

    void (async () => {
      if (!cached) setIsLoading(true);
      try {
        let fetched: Notes | null = null;
        try {
          fetched = await fetchOptimized(CACHE_KEY, () => getNote(id as string));
        } catch {
          const { getPublicNoteDataSecure } = await import('@/lib/actions/secure-ops');
          fetched = await getPublicNoteDataSecure(id as string);
        }
        if (mounted && fetched) {
          setRawNote(fetched);
        }
      } catch (error: unknown) {
        console.error('Failed to load note', error);
        if (mounted) setRawNote(null);
        showError('Failed to load note', 'Please try again later.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, CACHE_KEY, showError, fetchOptimized, getCachedData]);

  const handleUpdate = useCallback(
    (updated: Notes) => {
      setRawNote(updated);
      if (CACHE_KEY) setCachedData(CACHE_KEY, updated);
    },
    [CACHE_KEY, setCachedData],
  );

  const handleDelete = useCallback(
    async (noteId: string) => {
      try {
        await deleteNote(noteId);
        if (CACHE_KEY) invalidate(CACHE_KEY);
        showSuccess('Deleted', 'Note removed');
        router.push('/app');
      } catch (error: unknown) {
        console.error('Delete failed', error);
        showError('Delete failed', 'Could not delete the note.');
      }
    },
    [CACHE_KEY, invalidate, router, showSuccess, showError],
  );

  const handleBack = useCallback(() => {
    router.push('/app');
  }, [router]);

  if (isLoading) {
    return (
      <div className="bg-[#0A0908] text-white font-satoshi min-h-[calc(100dvh-72px)]">
        <div className="max-w-[920px] mx-auto w-full px-4 md:px-5 py-5">
          <div className="rounded-[24px] border border-white/5 bg-[#161412] px-5 py-6">
            <div className="h-5 w-40 bg-white/10 rounded mb-3 animate-pulse" />
            <div className="h-4 w-64 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-[50dvh] flex items-center justify-center bg-[#0A0908] text-[#9B9691] text-sm font-semibold">
        Note not found.
      </div>
    );
  }

  return (
    <div className="bg-[#0A0908] text-white font-satoshi min-h-[calc(100dvh-72px)]">
      <div className="max-w-[920px] mx-auto w-full">
        <NoteDetailSidebar
          note={note!}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onBack={handleBack}
          layout="page"
          showExpandButton={false}
          showHeaderDeleteButton
          isLoading={isLoading}
        />

        <div className="px-4 md:px-5 pb-10 flex flex-col gap-4 border-t border-white/5 mt-2">
          <section className="rounded-[24px] border border-white/5 bg-[#161412] p-4 md:p-5">
            <NoteReactions targetId={id as string} />
          </section>

          <section className="rounded-[24px] border border-white/5 bg-[#161412] p-4 md:p-5">
            <CommentsSection noteId={id as string} decryptionKey={decryptionKey || undefined} />
          </section>
        </div>
      </div>
    </div>
  );
}
