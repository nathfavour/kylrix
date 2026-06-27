# Kylrix Ecosystem Development Roadmap & TODO 🏴

> [!IMPORTANT]
> This roadmap is the single source of truth for all autonomous agent and human executors. Each task is defined with exact file paths, risk levels, complexity weight, capability tier, and a strict Definition of Done (DoD) to prevent ambiguous executions.

---

## 🛠️ Execution Tiers & Guidelines

Before picking a task, verify your agent capability level against the **Target Tier**:
*   **Tier L1 (Basic UI & Layout)**: Stylesheets, simple React components, text edits. Minimal risk of breaking critical application states.
*   **Tier L2 (State & SDK Integration)**: Context providers, custom hooks, SDK facade calls, API bindings. Requires validation checks.
*   **Tier L3 (High-Risk Subsystems)**: Web Crypto, Service Worker, Billing Webhooks, Appwrite Functions, database schema migrations.
    *   > [!CAUTION]
    *   **L3 tasks are extremely fragile.** Improper execution can result in fatal data loss, transaction failures, or cryptographic lockout. Only highly capable agents or human supervisors should claim L3 tasks.

---

## 🔐 1. Cryptography, WESP & Security Substrate (RAM-Only MEK)

### Task 1.1: Offload Key Derivation to Web Workers
*   **Location**: [lib/masterpass-crypto.ts](file:///home/nathfavour/code/kylrix/kylrix/lib/masterpass-crypto.ts)
*   **Complexity Weight**: High
*   **Target Tier**: L3 (Cryptographic, Performance)
*   **Risk Warning**: Direct impact on application boot speed. Derivation failure prevents user vault authentication.
*   **Objective**: Implement a dedicated Web Worker to process PBKDF2 stretching (600,000 iterations) and Argon2id WebAssembly derivation, preventing UI main thread freezes during authentication.
*   **Definition of Done (DoD)**:
    1.  Web Worker handles stretching asynchronously.
    2.  `masterpass-crypto.ts` communicates with the worker via `postMessage`.
    3.  Main UI thread stays responsive (visual indicators spin smoothly) during derivation.
    4.  No cryptographic keys or plaintexts are serialized to persistent disk during the transfer.

### Task 1.2: WebAuthn PRF-Backed MEK Generation
*   **Location**: [lib/passkey.ts](file:///home/nathfavour/code/kylrix/kylrix/lib/passkey.ts) & [lib/masterpass-crypto.ts](file:///home/nathfavour/code/kylrix/kylrix/lib/masterpass-crypto.ts)
*   **Complexity Weight**: High
*   **Target Tier**: L3 (Biometric Crypto)
*   **Risk Warning**: Changing the MEK derivation source can permanently lock existing encrypted resources if key synthesis is incorrect.
*   **Objective**: Use WebAuthn PRF (Pseudo-Random Function) extension values to synthesize the MEK directly from hardware biometrics/security keys.
*   **Definition of Done (DoD)**:
    1.  Passkey registration checks for PRF support in client browser.
    2.  If supported, biometric verification derives a consistent 256-bit entropy value.
    3.  Derived value is used directly as the MEK envelope key without manual password inputs.

### Task 1.3: In-Memory Key Zeroing on Lock/Logout
*   **Location**: [lib/masterpass-crypto.ts](file:///home/nathfavour/code/kylrix/kylrix/lib/masterpass-crypto.ts) & [lib/ecosystem/security.ts](file:///home/nathfavour/code/kylrix/kylrix/lib/ecosystem/security.ts)
*   **Complexity Weight**: Medium
*   **Target Tier**: L2 (Memory Management)
*   **Risk Warning**: Zeroing in-flight keys can trigger runtime null pointer exceptions if operations are not fully completed before teardown.
*   **Objective**: Force clean memory wiping of cryptographic structures (`CryptoKey` instances and temporary `Uint8Array` buffers) upon lock or logout.
*   **Definition of Done (DoD)**:
    1.  `lockApplication()` writes zeroes (`0`) across arrays before release.
    2.  All state variables holding key references are set to `null` immediately.
    3.  Tab session values are purged from memory space.

---

## 🔄 2. Data Nexus & RxDB Offline-First Sync Layer

### Task 2.1: Implement RxDB Delta-Sync Log Compaction
*   **Location**: [lib/webrtc/RxDBManager.ts](file:///home/nathfavour/code/kylrix/kylrix/lib/webrtc/RxDBManager.ts) & [lib/services/collaboration.ts](file:///home/nathfavour/code/kylrix/kylrix/lib/services/collaboration.ts)
*   **Complexity Weight**: High
*   **Target Tier**: L3 (Data Integrity)
*   **Risk Warning**: Improper log compaction can truncate un-replicated offline edits, leading to permanent data loss.
*   **Objective**: Build an automated cleanup routine that compacts local CRDT edit history logs once rows are verified as fully replicated to Appwrite.
*   **Definition of Done (DoD)**:
    1.  Local revision history is safely purged of intermediate character states.
    2.  Final unified content snapshots are preserved.
    3.  Database storage size is verified to shrink after running compaction.

### Task 2.2: Coalesce Duplicate Reads in Data Nexus
*   **Location**: [context/DataNexusContext.tsx](file:///home/nathfavour/code/kylrix/kylrix/context/DataNexusContext.tsx)
*   **Complexity Weight**: Medium
*   **Target Tier**: L2 (Caching Architecture)
*   **Risk Warning**: Cache collisions or stale references can lead to outdated state displays in UI widgets.
*   **Objective**: Consolidate multiple simultaneous read operations targeting the same row/table query into a single remote promise execution.
*   **Definition of Done (DoD)**:
    1.  A local in-flight registry tracks active query promises.
    2.  Duplicate concurrent reads wait on the same promise instead of launching duplicate HTTP handshakes.
    3.  The remote fetch runs exactly once, distributing data to all subscribers.

---

## 🔗 3. Broadcast Mesh & Service Worker Context Preservation

### Task 3.1: SW Message Origin Validation
*   **Location**: [public/sw.js](file:///home/nathfavour/code/kylrix/kylrix/public/sw.js) & [hooks/useServiceWorker.ts](file:///home/nathfavour/code/kylrix/kylrix/hooks/useServiceWorker.ts)
*   **Complexity Weight**: High
*   **Target Tier**: L3 (Cross-Document Security)
*   **Risk Warning**: Vulnerability to message spoofing from malicious extensions or subdomains if verification is weak.
*   **Objective**: Lock down the Service Worker communication channel to restrict MEK transfers only to validated parent tabs.
*   **Definition of Done (DoD)**:
    1.  `sw.js` validates that messaging clients match the primary application host.
    2.  Transfer payloads are bound to unique tab-specific session tokens.
    3.  Foreign tab/iframe queries are explicitly blocked and logged as security anomalies.

---

## 💳 4. Billing, Subscriptions & BlockBee Webhook Verification

### Task 4.1: Enforce SHA-256 Webhook Signatures
*   **Location**: [app/(app)/(auth)/accounts/api/pro/notify/route.ts](file:///home/nathfavour/code/kylrix/kylrix/app/%28app%29/%28auth%29/accounts/api/pro/notify/route.ts)
*   **Complexity Weight**: Critical
*   **Target Tier**: L3 (Transaction Security)
*   **Risk Warning**: Webhooks without signature enforcement allow attackers to forge payment success signals, bypassing premium restrictions.
*   **Objective**: Verify the BlockBee signature parameter using the configured private IPN secret before fulfilling billing stacking.
*   **Definition of Done (DoD)**:
    1.  Incoming webhook validates headers/parameters against local signing keys.
    2.  Unsigned or mismatched signature payloads return `401 Unauthorized` instantly.
    3.  Valid payments process and log transaction parameters securely.

### Task 4.2: Webhook Idempotency Lock
*   **Location**: [app/(app)/(auth)/accounts/api/pro/notify/route.ts](file:///home/nathfavour/code/kylrix/kylrix/app/%28app%29/%28auth%29/accounts/api/pro/notify/route.ts) & [lib/services/internal/blockbee-pending-checkout.ts](file:///home/nathfavour/code/kylrix/kylrix/lib/services/internal/blockbee-pending-checkout.ts)
*   **Complexity Weight**: High
*   **Target Tier**: L3 (Transaction Integrity)
*   **Risk Warning**: Multiple concurrent callback requests can lead to duplicate plan allocations or stacked credits.
*   **Objective**: Implement a transaction locking mechanism using a key format of `lock:payment:{payment_id}`.
*   **Definition of Done (DoD)**:
    1.  Lock is acquired on webhook processing startup.
    2.  Duplicate payloads with the same transaction/payment ID fail the lock check and return `ok` silently.
    3.  Locks are properly released in `finally` blocks.

---

## 🤖 5. AI Context & Safety Guardrails

### Task 5.1: Client-Side Context Payload Sanitizer
*   **Location**: [context/AIContext.tsx](file:///home/nathfavour/code/kylrix/kylrix/context/AIContext.tsx)
*   **Complexity Weight**: Medium
*   **Target Tier**: L2 (Data Sanitization)
*   **Risk Warning**: Leaking decrypted user credentials or PII to external AI endpoints violates client trust and regulatory guidelines.
*   **Objective**: Build a regex/dictionary scanning engine to automatically sanitize PII and credentials from the note context before routing payloads to LLMs.
*   **Definition of Done (DoD)**:
    1.  Scanner runs synchronously prior to compiling the context array.
    2.  Matches for email patterns, credentials, API keys, or raw hashes are redacted.
    3.  The sanitized string is returned for generation.

---

## 🔔 6. Notification Dispatcher & Spam Control

### Task 6.1: Queue Throttling and Digest Generation
*   **Location**: [lib/unorganic-email-api.ts](file:///home/nathfavour/code/kylrix/kylrix/lib/unorganic-email-api.ts) & [lib/services/internal/notification-dispatcher.ts](file:///home/nathfavour/code/kylrix/kylrix/lib/services/internal/notification-dispatcher.ts)
*   **Complexity Weight**: Medium
*   **Target Tier**: L2 (Integration)
*   **Risk Warning**: Rapid event bursts (like multiple chat messages) can trigger massive email spam, causing domain blacklisting.
*   **Objective**: Implement a caching layer that aggregates non-critical notification events within a 15-minute window into a single digest email.
*   **Definition of Done (DoD)**:
    1.  Notifications are parsed and cached.
    2.  Daily limit quotas are checked prior to triggering dispatcher events.
    3.  Emails are consolidated into a clean, uniform HTML digest template.

---

## 🎨 7. UI Stacking Context & Interactivity Safety

### Task 7.1: OpenBricks Drawer Portal Audit
*   **Location**: [components/ui/DynamicSidebar.tsx](file:///home/nathfavour/code/kylrix/kylrix/components/ui/DynamicSidebar.tsx) & all drawers inside [components/ui/](file:///home/nathfavour/code/kylrix/kylrix/components/ui/)
*   **Complexity Weight**: Medium
*   **Target Tier**: L2 (UI Chrome)
*   **Risk Warning**: Portals rendered outside the React layout root can escape styling containers and block document events.
*   **Objective**: Enforce the `disablePortal: true` configuration across all sidebar drawers to keep stacking contexts unified.
*   **Definition of Done (DoD)**:
    1.  Sidebars render contextually inside their target parents.
    2.  No orphan overlay nodes are appended directly to the HTML document body.
    3.  WESP visual borders and theme moods scale properly within the layout boundary.
