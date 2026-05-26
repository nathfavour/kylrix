---
name: system.chat-relay-relay
description: Deep dive into the server-side real-time chat sync and event propagation. Explains conversation member permission mappings, SHA-256 base64url reaction indexing, and batch deletion strategies.
---

# Why: Chat Event Propagation & Real-Time Sync

A chat system must propagate events in real time to all conversation participants while maintaining complete security isolation. A user must not be able to read or subscribe to messages in conversations they do not belong to.

We implement these strict communication gates in `lib/services/internal/chat.ts`.

## 1. Dynamic Conversation Member Permission Mapping

When a message is posted or a reaction is created, we must grant read permissions specifically to all current participants of the conversation. 

We resolve participants dynamically and build an explicit list of read permissions:

```typescript
export function buildMessagePermissions(senderId: string, recipientIds: string[]) {
  return [
    Permission.read(Role.user(senderId)),
    ...recipientIds.map((userId) => Permission.read(Role.user(userId)))
  ];
}
```

This maps directly to database level permissions, ensuring that only the sender and explicit recipients can read the message row.

## 2. Deterministic Hash-Based Reaction IDs

To prevent a user from reacting to the same message multiple times with the same emoji (which would bloat the database), we generate a deterministic **Reaction ID** by hashing the participant's user ID and message ID using a SHA-256 algorithm and slicing it to 32 characters:

```typescript
export function buildReactionDocumentId(userId: string, messageId: string) {
  return createHash('sha256')
    .update(`${userId}:${messageId}`)
    .digest('base64url')
    .slice(0, 32);
}
```

This provides two massive architectural benefits:
- **Idempotency**: A second reaction attempt will yield the exact same database ID, turning an insert command into a safe, non-duplicating update operation.
- **Speed**: It allows us to retrieve or check a reaction immediately without doing query filters, because we can compute the key in memory.

## 3. High-Throughput Batch Deletion

When a user deletes a conversation, we must prune all associated messages and reactions. Standard single row deletions would timeout on large histories. We solve this by deleting in concurrent batches of 10:

```typescript
async function deleteRowsInBatches(
  databases: any,
  databaseId: string,
  tableId: string,
  rowIds: string[],
) {
  const uniqueIds = Array.from(new Set(rowIds.filter(Boolean)));
  if (!uniqueIds.length) return 0;

  let deleted = 0;
  for (let i = 0; i < uniqueIds.length; i += 10) {
    const batch = uniqueIds.slice(i, i + 10).map((rowId) => databases.deleteRow(databaseId, tableId, rowId));
    await Promise.all(batch);
    deleted += batch.length;
  }
  return deleted;
}
```

This keeps memory consumption flat and respects Appwrite request-rate thresholds.
