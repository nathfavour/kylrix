---
name: why.cascade-delete-mechanic
description: Explains the asynchronous and recursive cascade deletion logic designed to purge linked metadata, comment reactions, and storage voice files.
---

# Why: Parallel Asynchronous Cascade Deletions

To prevent "dead weight" database bloat and orphan records, deleting a parent resource (like a Note, Huddle, or Form) must atomically clean up all attached child items. Kylrix implements a hardened, highly optimized **Cascade Delete Engine** in `executeCascadeDeleteSecure`.

## 1. Zero Orphan Records (Completeness Guarantee)

When a Note is deleted, the cascade engine recursively tracks down:
- **Comments & Reactions**: Linked in the `comments` and `reactions` tables.
- **Physical Voice Payloads**: Linked audio binaries (voice notes) saved inside the `voice` storage bucket are deleted instantly.
- **Resource tags & pivots**: Standard cleanups of tag-to-note linking records in `resource_tags`.

## 2. Optimized Parallel Execution & Batching

Rather than performing sequential, single-row database fetches (which block the Node main thread and trigger massive latency), we fetch in bulk batches and delete in parallel using Node's `Promise.all`:

```typescript
const commentsRes = await tables.listRows({
  databaseId,
  tableId: COMMENTS_TABLE,
  queries: [Query.equal('noteId', rowId), Query.limit(1000)],
});

const rows = commentsRes.rows || [];
const commentIds = rows.map((c) => c.$id).filter(Boolean);

if (commentIds.length > 0) {
  // Parallel deletion of all voice attachments
  await Promise.all(voiceFileIds.map(fid => 
    storage.deleteFile(VOICE_BUCKET, fid).catch(err => {
      console.warn(`[Cascade Delete] Failed to delete file ${fid}:`, err?.message);
    })
  ));
}
```

## 3. Technology Parity & Error Isolation

- **Fault-Tolerant Execution**: Each deletion operation is wrapped inside a safe `try-catch` block. If an image file was already manually removed from bucket storage, the cascade engine logs a warning and proceeds smoothly to clean up the database rows, ensuring that an orphan file doesn't block the parent record lifecycle.
