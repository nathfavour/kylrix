---
name: why.join-request-gating
description: Deep dive into the Group Join Request system in Kylrix. Explains the composite-key SHA-256 ID derivation, invite link expiration verification, and admin-only notification routing.
---

# Why: Join Request Gating & Safe Invite Cycles

In public or private collaborative groups, managing membership requests securely is critical. We must prevent duplicate requests that spam group admins, handle link expirations gracefully, and ensure that only authorized group managers can view or approve join requests.

We implement these strict membership gates in `lib/services/internal/joinRequests.ts`.

## 1. Deterministic Composite Hash IDs

To prevent a user from submitting multiple parallel join requests for the same group (which would pollute the database), we generate a deterministic, unique **Join Request ID** using SHA-256 over a composite string format:

```typescript
function hashJoinRequestId(resourceType: string, resourceId: string, requesterId: string) {
  return createHash('sha256')
    .update(`${resourceType}:${resourceId}:${requesterId}`)
    .digest('base64url')
    .slice(0, 32);
}
```

This guarantees that a single user can have exactly **one** active join request per group, making the registration idempotent and safe.

## 2. Dynamic Invite Link Expiration Checks

Invite links must support temporal expirations (e.g., expiring after 24 hours). The gating service validates both the token payload and the expiration timestamps before permitting a user to join:

```typescript
function getConversationInviteEnabled(conversation: any) {
  const inviteToken = normalizeText(conversation?.inviteLink);
  if (!inviteToken) return false;
  
  const expiryRaw = conversation?.inviteLinkExpiry;
  if (expiryRaw) {
    const expiry = new Date(expiryRaw).getTime();
    if (Number.isFinite(expiry) && expiry < Date.now()) {
      return false; // Link expired
    }
  }

  const conversationId = conversation?.$id || conversation?.id;
  return inviteToken === conversationId; // Valid token matches ID
}
```

## 3. Targeted Manager Permissions

Join requests contain private member information (such as the requester's username and display name). We isolate this data from the rest of the database by restricting read permissions purely to the requester and conversation admins/managers:

```typescript
function getManagers(conversation: any) {
  return uniqueIds([conversation?.creatorId, ...(Array.isArray(conversation?.admins) ? conversation.admins : [])]);
}

function buildRequestPermissions(requesterId: string, managers: string[]) {
  return [
    Permission.read(Role.user(requesterId)),
    ...managers.map((managerId) => Permission.read(Role.user(managerId)))
  ];
}
```

This ensures zero-trust visibility: regular users cannot list or hijack pending join requests.
