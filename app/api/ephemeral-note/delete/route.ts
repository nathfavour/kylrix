import { NextRequest, NextResponse } from 'next/server';
import { createSystemClient } from '@/lib/appwrite-admin';
import { APPWRITE_CONFIG } from '@/lib/appwrite/config';
import { verifyCreatorDeletionProof } from '@/lib/ephemeral/ephemeral-proof';
import { executeCascadeDeleteSecure } from '@/lib/actions/cascade-delete';

/**
 * Burns an ephemeral ghost / Send row (+ Send file blob) using a per-note deletion secret
 * (SHA-256 stored in metadata). Document rows are created read-only for Role.any().
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const noteId = String(body?.noteId || '').trim();
    const deletionSecret = String(body?.deletionSecret || '').trim();
    if (!noteId || !deletionSecret) {
      return NextResponse.json({ error: 'noteId and deletionSecret are required' }, { status: 400 });
    }

    const { databases, storage } = createSystemClient();
    const dbId = APPWRITE_CONFIG.DATABASES.NOTE;
    const tableId = APPWRITE_CONFIG.TABLES.NOTE.NOTES;

    const doc = await databases.getDocument(dbId, tableId, noteId).catch(() => null);
    if (!doc) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    let meta: Record<string, unknown> = {};
    try {
      meta = JSON.parse(String((doc as { metadata?: string }).metadata || '{}'));
    } catch {
      meta = {};
    }

    if (!meta.isGhost) {
      return NextResponse.json({ error: 'Not an ephemeral note' }, { status: 400 });
    }

    const expectedHash = String(meta.creatorDeletionProofHash || '').trim();
    if (!expectedHash) {
      return NextResponse.json({ error: 'This note cannot be burned remotely (created before burn keys existed)' }, { status: 400 });
    }

    if (!verifyCreatorDeletionProof(meta, deletionSecret)) {
      return NextResponse.json({ error: 'Invalid deletion proof' }, { status: 403 });
    }

    // Recursive cleanup for storage files, comments, reactions, etc.
    await executeCascadeDeleteSecure(dbId, tableId, noteId);

    await databases.deleteDocument(dbId, tableId, noteId);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('[ephemeral-note/delete]', e);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
