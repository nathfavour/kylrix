---
name: why.node-key-diffing
description: Deep dive into the cryptographic identity authentication and delta-sync engines. Explains Ed25519 SubtleCrypto node handshakes and deterministic row hashing with SHA-256 to sync peer databases securely.
---

# Why: Cryptographic Node Identity & Deterministic Diff Sync

In a decentralized peer-to-peer (P2P) mesh network, every self-hosted server instance (a **Node**) acts as a sovereign entity. These nodes need to authenticate each other and reconcile database rows securely without transmitting massive datasets or exposing private configuration details.

We achieve this through the services in `lib/core/federation/node-key.ts` and `lib/core/federation/diff-engine.ts`.

## 1. Ed25519 Sovereign Node Identity

To achieve zero-trust security between federated instances, every node generates its own **Ed25519 signature keypair** on startup or setup. We use the standard Web Crypto API (`globalThis.crypto.subtle`) for cross-runtime compatibility:

```typescript
static async generateNodeKeypair(): Promise<NodeKeypair> {
  return await globalThis.crypto.subtle.generateKey(
    { name: 'Ed25519' },
    true,
    ['sign', 'verify']
  );
}
```

When a Node connects to another Node, it signs an challenge payload with its private key. The remote node verifies this signature using the node's registered public key. This prevents spoofing attacks on node handshakes.

## 2. Deterministic Row Hashing

Reconciling changes across nodes requires comparing data states. Instead of sending full rows of data, we calculate a deterministic SHA-256 hash of each Row's keys and values.

To ensure consistency, we sort keys alphabetically and exclude metadata columns that are vendor-specific (like database/collection/permission fields):

```typescript
static calculateRowHash(row: SyncRow): string {
  const cleanRow: Record<string, any> = {};
  const excludedKeys = new Set([
    '$databaseId',
    '$tableId',
    '$permissions',
    '$collectionId',
    '$rowId',
  ]);

  Object.keys(row)
    .sort() // Deterministic order
    .forEach((key) => {
      if (!excludedKeys.has(key)) {
        cleanRow[key] = row[key];
      }
    });

  return createHash('sha256')
    .update(JSON.stringify(cleanRow))
    .digest('hex');
}
```

## 3. Dynamic Conflict and Outdated Diff Engine

When comparing two lists of rows, `TableDiffEngine.diffTables` maps IDs and categorizes them into five sync states:
- **`missingLocally`**: Rows present remotely but missing here.
- **`missingRemotely`**: Rows present here but missing remotely.
- **`outdatedLocally`**: Rows with a newer remote `$updatedAt` timestamp.
- **`outdatedRemotely`**: Rows with a newer local `$updatedAt` timestamp.
- **`conflicts`**: Rows with matching updated timestamps but differing SHA-256 content hashes.

This deterministic delta-sync engine scales efficiently and handles state resolution reliably.
