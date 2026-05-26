---
name: security.secure-ops-rls-bypass
description: Explains the hybrid Row-Level Security (RLS) system in secure-ops, detailing how user-scoped fetches fallback to dynamic admin verification gates.
---

# Why: Secure-Ops Hybrid RLS & Admin Bypass

To protect user privacy while supporting complex collaboration matrices (like note sharing and group huddles), Kylrix combines native Row-Level Security (RLS) with server-side administrative verification.

## 1. Native User-Scoped RLS (First Gate)

By default, all queries execute using a **user-scoped client** derived from cookies or direct JWT tokens. This guarantees that standard database requests mathematically conform to the user's explicit ACLs:

```typescript
// User-scoped client bounds
const { client } = await createServerClient(jwt);
const tables = new TablesDB(client);
const res = await tables.getRow({ databaseId, tableId, rowId });
```

## 2. Server-Scoped Administrative Fallback (Second Gate)

If a user-scoped fetch fails (e.g. because a newly added collaborator's Appwrite permissions haven't fully synchronized on-disk), the system attempts a dynamic **Admin RLS Bypass**:
- **System Table Access**: Uses the system client (`createSystemTablesDB()`) to load the target row bypass-style.
- **Manual Permission Auditing**: The server surgically checks the row's owner, dynamic collaborator lists, or peer-table memberships (e.g. `conversationMembers`, `Collaborators` table).
- **Parity Assertion**: The row is only returned to the caller if their active `actorId` is verified as authorized.

```typescript
if (isNote) {
  const collaborators = adminRes.collaborators || [];
  if (adminRes.userId === actor.$id || collaborators.includes(actor.$id)) {
    isAuthorized = true;
  } else {
    const collabRows = await adminTables.listRows({
      databaseId: FLOW_DB,
      tableId: 'Collaborators',
      queries: [Query.equal('resourceId', rowId), Query.equal('userId', actor.$id)]
    });
    if (collabRows.total > 0) isAuthorized = true;
  }
}
```

This hybrid model avoids performance lag and session-cookie forwarding bugs while guaranteeing absolute security.
