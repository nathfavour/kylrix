---
name: why.privileged-permissions
description: Deep dive into the user visibility levels and Row-Level Security (RLS) system in Kylrix. Explains the permissions mapping matrix, and server-side privileged permission bypass.
---

# Why: Privileged Permissions & Row-Level Security (RLS)

In a secure sharing ecosystem, resource access must be enforced securely at both the database level (Row-Level Security) and inside server actions to prevent unauthorized read or write access (Broken Object Level Authorization / IDOR).

We structure these rules cleanly using the permission matrices in `lib/permissions.ts` and `lib/services/internal/permissions.ts`.

## 1. Declarative Client-Safe Permission Mappings

To prevent UI components from having to construct complex permission strings manually, we define a standard helper that translates human-friendly visibility states (like `public`, `private`, `unlisted`) to database permission formats:

```typescript
export const permissions = {
  publicRead: (userId: string) => [
    Permission.read(Role.any()),
    Permission.read(Role.user(userId))
  ],
  privateOnly: (userId: string) => [
    Permission.read(Role.user(userId))
  ],
  unlistedRead: (userId: string) => [
    Permission.read(Role.any()),
    Permission.read(Role.user(userId))
  ],
};
```

These mapped lists are passed directly into Table updates to keep access rules aligned across resources:

```typescript
export const eventPermissions = {
  setVisibility: async (eventId: string, visibility: EventVisibility, userId: string): Promise<void> => {
    await tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLES.EVENTS,
      rowId: eventId,
      data: { visibility },
      permissions: permissions.forVisibility(visibility, userId),
    });
  },
};
```

## 2. Server-Side Privileged Permissions Engine

When modifying resource permissions for other collaborators (e.g., granting read-write privileges, revoking access, rotating cryptographic epochs), client-level permissions are not enough. We route these requests through an administrative execution context (`lib/services/internal/permissions.ts`):

```typescript
export async function applyPermissionMutation(actorId: string, body: any) {
  const action = getAction(body);
  const { databases, storage } = createSystemClient();
  const targetUserIds = normalizeTargetUserIds(body?.targetUserIds || body?.recipientUserIds || body?.targetUserId);
  const keyMappings = getResourceKeyMappings(body);

  if (action === 'grant' && keyMappings.length > 0) {
    await upsertLockboxRows(databases, actorId, keyMappings);
  }
  // Apply direct row/attachment mutations securely via Admin client
}
```

The system ensures that even when the database layer executes with elevated server credentials (`createSystemClient`), the **Actor ID** is passed into all internal permission update helpers. This guarantees that only valid resource owners or authorized collaborators can trigger changes.
