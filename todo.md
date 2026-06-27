# Kylrix Ecosystem Development Roadmap & TODO 🏴

> [!IMPORTANT]
> **MANDATORY PREREQUISITE**: Before claiming, initiating, or writing code for any task listed below, the executor (agent or human) **MUST** read and fully digest [AGENTS.md](file:///home/nathfavour/code/kylrix/kylrix/AGENTS.md) and [ARCHITECTURE.md](file:///home/nathfavour/code/kylrix/kylrix/ARCHITECTURE.md).
> 
> **RULE OF COMPLETENESS**: Tasks must never be executed halfway. Any feature or fix implemented must satisfy its exact Definition of Done (DoD) in full. Zero-tolerance for partial fixes, stub variables, or placeholder comments.

---

## 🛠️ Execution Tiers & Guidelines

Before picking a task, verify your agent capability level against the **Target Tier**:
*   **Tier L1 (Basic UI & Layout)**: Stylesheets, simple React components, text edits. Minimal risk of breaking critical application states.
*   **Tier L2 (State & SDK Integration)**: Context providers, custom hooks, SDK facade calls, API bindings. Requires validation checks.
*   **Tier L3 (High-Risk Subsystems)**: Web Crypto, Service Worker, Billing Webhooks, Appwrite Functions, database schema migrations.
    *   > [!CAUTION]
    *   **L3 tasks are extremely fragile.** Improper execution can result in fatal data loss, transaction failures, or cryptographic lockout. Only highly capable agents or human supervisors should claim L3 tasks.

---

## 🔐 1. Cryptography, WESP & Security Substrate

### Task 1.1: Offload Key Derivation to Web Workers
*   **Location**: [lib/masterpass-crypto.ts](file:///home/nathfavour/code/kylrix/kylrix/lib/masterpass-crypto.ts)
*   **Complexity Weight**: High
*   **Target Tier**: L3 (Cryptographic, Performance)
*   **Risk Warning**: Direct impact on application boot speed. Derivation failure prevents user vault authentication.
*   **Discrete Subtasks**:
    *   [ ] Create a standalone worker script `public/workers/key-deriv.worker.js` that handles PBKDF2 stretching (600,000 iterations) and Argon2id WebAssembly derivation.
    *   [ ] Refactor `deriveKeyWithArgon2id` and `deriveKeyPBKDF2` in `lib/masterpass-crypto.ts` to instantiate this worker.
    *   [ ] Set up messaging interfaces (`postMessage` & `onmessage` listeners) to securely pass input parameters and return the derived `CryptoKey` payload.
    *   [ ] Implement worker timeout checks (terminate worker if execution exceeds 10 seconds).
*   **Definition of Done (DoD)**:
    1.  Web Worker handles stretching asynchronously.
    2.  `masterpass-crypto.ts` communicates with the worker via `postMessage`.
    3.  Main UI thread stays responsive (visual indicators spin smoothly) during derivation.
    4.  No cryptographic keys or plaintexts are serialized to persistent disk during the transfer.

### Task 1.2: In-Memory Key Zeroing on Lock/Logout
*   **Location**: [lib/masterpass-crypto.ts](file:///home/nathfavour/code/kylrix/kylrix/lib/masterpass-crypto.ts) & [lib/ecosystem/security.ts](file:///home/nathfavour/code/kylrix/kylrix/lib/ecosystem/security.ts)
*   **Complexity Weight**: Medium
*   **Target Tier**: L2 (Memory Management)
*   **Risk Warning**: Zeroing in-flight keys can trigger runtime null pointer exceptions if operations are not fully completed before teardown.
*   **Discrete Subtasks**:
    *   [ ] Refactor `lockApplication()` in `lib/masterpass-crypto.ts` to clear key memory arrays before reference releasing.
    *   [ ] Add memory-zeroing buffers helper in `lib/ecosystem/security.ts` to actively overwrite tab session keys on locking signals.
    *   [ ] Enforce immediate cleanup of `sessionStorage` values (`vault_unlocked` and `kylrix_vault_unlocked`).
*   **Definition of Done (DoD)**:
    1.  `lockApplication()` writes zeroes (`0`) across arrays before release.
    2.  All state variables holding key references are set to `null` immediately.
    3.  Tab session values are purged from memory space.

---

## 🔄 2. Data Nexus & RxDB Offline-First Sync Layer

### Task 2.1: Coalesce Duplicate Reads in Data Nexus
*   **Location**: [context/DataNexusContext.tsx](file:///home/nathfavour/code/kylrix/kylrix/context/DataNexusContext.tsx)
*   **Complexity Weight**: Medium
*   **Target Tier**: L2 (Caching Architecture)
*   **Risk Warning**: Cache collisions or stale references can lead to outdated state displays in UI widgets.
*   **Discrete Subtasks**:
    *   [ ] Implement a global React ref map `inFlightRequestsRef = useRef<Map<string, Promise<any>>>` inside `DataNexusProvider`.
    *   [ ] Intercept all fetch requests inside the context to check if a query with the identical cache key (database + table + filters) is already running.
    *   [ ] Return the matching active promise to concurrent callers instead of initiating new remote network fetches.
    *   [ ] Purge promise entries from `inFlightRequestsRef` once they resolve or fail.
*   **Definition of Done (DoD)**:
    1.  A local in-flight registry tracks active query promises.
    2.  Duplicate concurrent reads wait on the same promise instead of launching duplicate HTTP handshakes.
    3.  The remote fetch runs exactly once, distributing data to all subscribers.

---

## 💳 3. Billing, Subscriptions & BlockBee Webhook Verification

### Task 3.1: Enforce SHA-256 Webhook Signatures
*   **Location**: [app/(app)/(auth)/accounts/api/pro/notify/route.ts](file:///home/nathfavour/code/kylrix/kylrix/app/%28app%29/%28auth%29/accounts/api/pro/notify/route.ts)
*   **Complexity Weight**: Critical
*   **Target Tier**: L3 (Transaction Security)
*   **Risk Warning**: Webhooks without signature enforcement allow attackers to forge payment success signals, bypassing premium restrictions.
*   **Discrete Subtasks**:
    *   [ ] Read the BlockBee secret key environment variable `BLOCKBEE_IPN_SECRET` on server startup.
    *   [ ] Parse incoming webhook request payload and signature parameter `signature`.
    *   [ ] Generate local SHA-256 HMAC of the payload using the IPN secret.
    *   [ ] Perform a timing-safe comparison between the generated signature and the request signature.
*   **Definition of Done (DoD)**:
    1.  Incoming webhook validates headers/parameters against local signing keys.
    2.  Unsigned or mismatched signature payloads return `401 Unauthorized` instantly.
    3.  Valid payments process and log transaction parameters securely.

### Task 3.2: Webhook Idempotency Lock
*   **Location**: [app/(app)/(auth)/accounts/api/pro/notify/route.ts](file:///home/nathfavour/code/kylrix/kylrix/app/%28app%29/%28auth%29/accounts/api/pro/notify/route.ts) & [lib/services/internal/blockbee-pending-checkout.ts](file:///home/nathfavour/code/kylrix/kylrix/lib/services/internal/blockbee-pending-checkout.ts)
*   **Complexity Weight**: High
*   **Target Tier**: L3 (Transaction Integrity)
*   **Risk Warning**: Multiple concurrent callback requests can lead to duplicate plan allocations or stacked credits.
*   **Discrete Subtasks**:
    *   [ ] Set up an append-only transaction ledger check inside `notify/route.ts`.
    *   [ ] Verify if the payment reference `payment_id` exists in the local transaction table.
    *   [ ] Block execution if transaction row is already present, returning HTTP 200 with standard verification response.
*   **Definition of Done (DoD)**:
    1.  Transaction registry is verified prior to execution.
    2.  Duplicate payloads with the same transaction/payment ID return `ok` silently without stacking billing values.

---

## 🎨 4. UI Stacking Context & Interactivity Safety

### Task 4.1: OpenBricks Drawer Portal Audit
*   **Location**: [components/ui/DynamicSidebar.tsx](file:///home/nathfavour/code/kylrix/kylrix/components/ui/DynamicSidebar.tsx) & all drawers inside [components/ui/](file:///home/nathfavour/code/kylrix/kylrix/components/ui/)
*   **Complexity Weight**: Medium
*   **Target Tier**: L2 (UI Chrome)
*   **Risk Warning**: Portals rendered outside the React layout root can escape styling containers and block document events.
*   **Discrete Subtasks**:
    *   [ ] Search for OpenBricks `Drawer` component instances in the layout workspace.
    *   [ ] Enforce the `disablePortal: true` parameter on each Drawer component to lock rendering context locally.
    *   [ ] Configure `keepMounted: false` to force component unmounting upon closing.
*   **Definition of Done (DoD)**:
    1.  Sidebars render contextually inside their target parents.
    2.  No orphan overlay nodes are appended directly to the HTML document body.
    3.  WESP visual borders and theme moods scale properly within the layout boundary.
