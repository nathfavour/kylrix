# Kylrix Security Vulnerabilities & Loophole Resolution Log 🛡️

This log tracks potential security vulnerabilities, race conditions, sync edge cases, and cryptographic loopholes across Kylrix features, alongside resolved fixes and active guardrails.

---

## 🔑 1. Volatile Cryptography & MasterPass Subsystem

### A. MEK Leakage to Volatile Memory/Disk
*   **Vulnerability Vector**: If the Master Encryption Key (MEK) or raw password material leaks to persistent storage (`localStorage`, `sessionStorage`, cookies) or gets printed in console logs, the zero-knowledge security boundary is broken.
*   **Loophole Mitigation**:
    *   Volatile RAM storage only: Keep key contexts strictly in memory or preserved via `public/sw.js` (Service Worker Volatile Context) messages during refresh.
    *   No persistent cookies or logs for MEK or KEK.
    *   Strict console filtering: Prohibit serialization of CryptoKey instances or raw base64 arrays in application error boundaries.

### B. MasterPass ↔ Account Password Out-of-Sync Race
*   **Vulnerability Vector**: If a user changes their MasterPass, the local database must change its key, but the Appwrite Auth account password must also update. If one succeeds and the other fails due to a network disconnect, the user is locked out.
*   **Loophole Mitigation**:
    *   Atomic execution: Sync password updates through server action `syncMasterpassToAccountPasswordAction` first. Verify auth success *before* updating local database credentials.
    *   Local rollback: If remote sync fails, reject key rotations on local databases.

---

## 🔐 2. WebAuthn Passkeys & Session Spoofing

### A. RpID Validation Domain Bypasses
*   **Vulnerability Vector**: Authenticator assertions containing domain parameters could be spoofed if the server doesn't strictly check the relying party ID (`rpId`) and origin matching `https://www.kylrix.space`.
*   **Loophole Mitigation**:
    *   Secure endpoints: `app/api/auth/passkey/route.ts` strictly verifies signatures against domain configuration.
    *   Domain bifurcation: Localhost RP requests are separated dynamically from production domain requests (`resolvePasskeyRpId`) to prevent dev keys from authenticating production accounts.

### B. Replay Attacks on Challenge Tokens
*   **Vulnerability Vector**: Challenge tokens could be replayed if not uniquely tied to single-use credentials or if they lack temporal gates.
*   **Loophole Mitigation**:
    *   Timing-safe validation: Challanges are sealed with HMAC signatures containing 5-minute TTL constraints.
    *   One-time use validation: Appwrite function registries trace signature nonces to block challenge token reuse.

---

## 💰 3. Wallet Drawer & Token Micropayment Races

### A. Double-Spending on Token Transfers
*   **Vulnerability Vector**: Concurrent transfer calls executed rapidly could cause double-spending if balances are decremented after transaction entries are added.
*   **Loophole Mitigation**:
    *   Append-only ledger: All balance evaluations recalculate cumulative transactions from the ledger database rather than reading a static cached balance row.
    *   Idempotency key enforcement: Every ledger entry requires an idempotency key derived from `transaction_hash(sender, recipient, amount, nonce)`.

### B. Simulate-to-Claim Conversion Race
*   **Vulnerability Vector**: When unauthenticated users transition from simulated "ghost" environments to official accounts, concurrent claiming requests could trigger duplicate asset creation.
*   **Loophole Mitigation**:
    *   Single-transaction lock: `GhostNoteClaimer` gates claims using a unique claim session token. If the claim succeeds once, ghost files are completely wiped from the local IndexedDB/localStorage substrate before next loop evaluation.

---

## 🔄 4. Data Nexus & RxDB CRDT Replication Loops

### A. Offline Sync Write Races
*   **Vulnerability Vector**: When a user transitions back online, simultaneous sync pushes can overwrite newer changes made remotely, or create duplicate entries.
*   **Loophole Mitigation**:
    *   CRDT Delta Merges: RxDB collections employ timestamped CRDT state logs ensuring conflict-free delta reconciliation rather than naive Last-Write-Wins (LWW) overrides.
    *   Deduplication of In-Flight Queries: Promise merging maps concurrent identical requests to a single execution context in `DataNexusContext.tsx`.
