---
name: why.universal-identity-hook
description: Deep dive into the global Connect Directory profile and identity sync system. Explains sync event routing, caching layers, and cross-application identity lookup.
---

# Why: Universal Identity Hook & Connect Directory Sync

In a federated node architecture, users need to be discoverable and share resource mappings across multiple distinct network components or self-hosted instances. We achieve this through the **Universal Identity Hook** implemented in `lib/ecosystem/identity.ts`.

## 1. The Core Architectural Goal

When a user registers or logs in, we must ensure their local credentials/profile are securely mirrored to the global **Connect Directory** (`CONNECT_DATABASE_ID`). This global record acts as the primary naming service (DNS for profiles) supporting email, username, and public key discoveries.

## 2. Dynamic Event Routing & Sync

To bypass direct cross-database sync bottlenecks and handle multiple nodes, we post identity events to an `accounts` service micro-endpoint `/api/account-events`.

```typescript
const syncProfileEvent = async (payload: {
    type: 'username_change' | 'profile_sync';
    userId: string;
    newUsername?: string | null;
    profilePatch?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}) => {
    const res = await fetch(`${getEcosystemUrl('accounts')}/api/account-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return await res.json().catch(() => ({}));
};
```

## 3. High-Performance Layered Caching

Since database mutations are relatively slow and costly, the hook employs a dual-layered local client cache:
- **`sessionStorage` Boundary (`kylrix_session_identity_ok`)**: Active tab gate. Ensures we only attempt verification once per active browser session life.
- **`localStorage` Boundary (`kylrix_identity_synced_v2`)**: Time-based gate set to 24 hours. Prevents chatty, repetitive queries on every page load or route transition.

```typescript
// Layered Caching
if (!force && sessionStorage.getItem(SESSION_SYNC_KEY)) return;
const lastSync = localStorage.getItem(PROFILE_SYNC_KEY);
if (!force && lastSync && (Date.now() - parseInt(lastSync)) < 24 * 60 * 60 * 1000) {
    sessionStorage.setItem(SESSION_SYNC_KEY, '1');
    return;
}
```

## 4. Normalization and Sanitization

To guarantee stable usernames that are URL-safe and friendly, usernames undergo strict sanitization:
- Forced to lowercase.
- Truncated at 50 characters.
- Purged of non-alphanumeric characters, except underscores.

```typescript
let username = user.username || prefs?.username || user.name || user.email?.split('@')[0];
username = String(username).toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_]/g, '').slice(0, 50);
if (!username) username = `user_${user.$id.slice(0, 8)}`;
```
