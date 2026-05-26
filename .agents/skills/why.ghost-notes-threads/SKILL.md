---
name: why.ghost-notes-threads
description: Guidelines and lifecycle rules for using Ghost Notes as a high-efficiency comment and chat thread channel across Kylrix resources (calls, tasks, tags, projects, events, forms) without database bloat.
---

# Why: Ghost Notes Threading & Discussion Mutation

Building separate custom databases for comments, chat channels, forum threads, and task discussions creates massive schema duplication and code bloat. 

We solve this elegantly by mutating standard Notes into **Ghost Notes** (implemented in `lib/actions/secure-ops.ts` and `lib/services/drafts.ts`).

---

## 1. Notes as a Highly Flexible Object

Because the standard Note model is incredibly flexible and supports rich metadata, comments, and reactions (including comment-to-comment nesting and comment emoji reactions), it is the ideal canvas for any ecosystem discussion. For example, password sharing in `/send` is packaged as a note.

---

## 2. What Makes a Note "Ghost"? (The Missing `userId`)

Standard user notes always contain a `userId` column matching their owner, making them visible in the user's primary note explorer. A **Ghost Note** is defined by **the absence of a `userId` but the presence of a `creatorId`**:

```typescript
// Example: Creating a Ghost Note to power a discussion thread
const ghostNotePayload = {
  title: 'Discussion Thread',
  content: 'User message here...',
  userId: null,        // ABSENT: Standard filtering hides this note from explorers
  creatorId: actor.$id, // PRESENT: Tracks the author of the comment
  isThread: true,      // Tells the engine to treat this note as a persistent thread
  isChat: false,
  metadata: JSON.stringify({
    resourceType: 'productivity.task',
    resourceId: taskId,
  })
};
```

This simple, clever pattern keeps the user's primary note explorer perfectly clean: **standard note queries automatically filter out ghost notes because they filter for `userId == activeUser`**.

---

## 3. Protecting Threads from the 7-Day Purge

Because anonymous guests and users can write ghost notes across events, we expect database bloat. We run a background cleanup task that purges baseline ghost notes every 7 days.

However, to protect important chat channels and discussion threads, we use the `isThread` and `isChat` flags as permanent preservation gates:

```typescript
// Cron pruning loop in background execution
export async function pruneExpiredGhostNotes() {
  const adminTables = createSystemTablesDB();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  // Prune only baseline ghost notes. Skip chats and persistent discussion threads.
  const expired = await adminTables.listRows(NOTE_DB, NOTES_TABLE, [
    Query.isNull('userId'),
    Query.lessThan('createdAt', sevenDaysAgo),
    Query.equal('isThread', false),
    Query.equal('isChat', false),
    Query.limit(100)
  ]);
  
  for (const row of expired.rows) {
    await adminTables.deleteRow(NOTE_DB, NOTES_TABLE, row.$id);
  }
}
```

This keeps the system clean and performant while keeping conversations intact.
