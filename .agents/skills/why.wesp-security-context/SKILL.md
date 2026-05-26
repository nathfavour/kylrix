---
name: why.wesp-security-context
description: Deep dive into the Web Ecosystem Security Protocol (WESP) in Kylrix. Explains tab-specific RAM-only secrets, system-wide lock broadcasts, and key isolation to block XSS and memory-injection attacks.
---

# Why: WESP (Web Ecosystem Security Protocol) Context & Tab Secrets

Client-side cryptographic applications are extremely vulnerable to Cross-Site Scripting (XSS). If a malicious script runs, it can access browser storage (like `localStorage` or `sessionStorage`) and steal Master Keys. The **Kylrix Ecosystem Security Protocol (WESP)** in `lib/ecosystem/security.ts` blocks this vector.

## 1. RAM-Only Tab Session Secrets

To prevent high-severity credential scraping from cookies or browser persistence, WESP stores cryptographic keys **only in the active Javascript execution thread's memory (RAM)**. 
We also generate a unique, cryptographically random **tabSessionSecret** that lives purely in-memory:

```typescript
private tabSessionSecret: Uint8Array | null = null;

private getOrCreateSessionSecret(): Uint8Array {
  if (typeof window === 'undefined') return new Uint8Array(32);
  if (!this.tabSessionSecret) {
    this.tabSessionSecret = crypto.getRandomValues(new Uint8Array(32));
  }
  return this.tabSessionSecret;
}
```

Since this secret is never saved to the disk or session storage, any other tab, browser process, or external execution context cannot read or reconstruct the derived Master Keys.

## 2. Dynamic Mesh Broadcasts and Lock Sync

When a security event occurs (e.g., user hits a global "Lock" button), all open tabs and active ecosystem nodes must lock instantly to protect data. We use a P2P browser mesh (`MeshProtocol`) to broadcast and receive lock commands.

```typescript
private listenForMeshDirectives() {
  if (typeof window === 'undefined') return;
  MeshProtocol.subscribe((msg) => {
    if (msg.type === 'COMMAND' && msg.payload.action === 'LOCK_SYSTEM') {
      this.lock();
    }
  });
}
```

## 3. Strict Encryption/Decryption Lifecycles

Decrypted values are kept in memory using a strict caching policy. When `lock()` is triggered, all keys, cached plaintexts, and active cryptographic configurations are overwritten with zeroes or purged entirely to free up RAM memory and defend against memory-dumper exploits:

```typescript
lock() {
  this.masterKey = null;
  this.identityKeyPair = null;
  this.conversationKeys.clear();
  this.decryptionCache.clear();
  this.isUnlocked = false;
  this.tabSessionSecret = null;
  this.emitStatusChange();
}
```
