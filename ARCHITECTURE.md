# Kylrix System Architecture & Unified Manifest 🏴

This blueprint serves as the single, authoritative architectural guide and features manifest for the Kylrix ecosystem, defining security boundaries, cryptographic protocols, data models, and execution flows.

---

## 🏗️ Core Architectural Mandates
1. **Web Ecosystem Security Protocol (WESP)**: Decryption context and Master Encryption Keys (MEK) reside strictly in ephemeral, tab-scoped RAM or service worker cache.
2. **Cascading-on-Demand (CoD) CRUD**: Hybrid local-first data model. Local cache (in-memory & RxDB) acts as the immediate UI Source of Truth (SoT); remote Appwrite writes execute asynchronously.
3. **Global Unmount**: Overlays, drawers, and sidebars are physically unmounted when closed (`{isOpen && <Component />}`). OpenBricks overlays use `keepMounted: false` and `disablePortal: true`.
4. **Least Privilege / Proxy Mutations**: Database tables enforce read-only policies. Client writes are intercepted by a JS `Proxy` and routed via verified Server Actions (`lib/actions/client-ops.ts`) using elevated Admin/TablesDB contexts.
5. **Single Database Mandate**: All tables exist inside a single Appwrite database ID: `passwordManagerDb`. Legacy references to `whisperrflow` are prohibited.
6. **Table/Row Terminology**: Appwrite TablesDB vocabulary is canonical. Use **Table** and **Row** exclusively in code, logs, and docs — never Collection / Document.

---

## I. CORE PLATFORM & SECURITY SUBSTRATE

### 1. Cryptographic Key Hierarchy
- **Master Encryption Key (MEK)**: A cryptographically secure 256-bit symmetric key generated locally via `window.crypto.subtle.generateKey` (`lib/masterpass-crypto.ts`). It is kept in volatile tab-scoped memory.
- **Key Encryption Key (KEK)**: Derived by stretching the master password with PBKDF2 (600,000 iterations of HMAC-SHA-256) and Argon2id (64MB, 3 iterations, parallelism: 4). The KEK wraps/unwraps the MEK envelope stored in Appwrite user preferences.
- **Service Worker Context Preservation**: `public/sw.js` holds the MEK context in volatile memory, allowing it to survive tab reloads without touching persistent disk storage.

### 2. Authentication & Sudo mode
- **Dual-Role Passkeys (WebAuthn)**: Single credentials handle both account login and PRF-wrapped MEK vault unlock. Challenges are verified statelessly using HMAC-signed tokens (`app/api/auth/passkey/route.ts`).
- **MasterPass/Account Password Unification**: Account login password and vault master password are synced on unlock/setup/change via `syncMasterpassToAccountPassword()`.
- **Temporal Sudo Mode**: High-risk actions (rotations, wipes, exports) require re-authentication, enabling a 5-minute in-memory Sudo context. Multi-step confirmation drawers (`security-confirm`) enforce step confirmation sequences before triggering Sudo.

---

## II. HYBRID DATA INFRASTRUCTURE & SYNC

```
   [UI View]
       │ (Instant Read/Write)
       ▼
 ┌─────────── TIER 1 ───────────┐
 │   Tab In-Memory Map Ref      │
 └─────────────┬────────────────┘
               │ (Miss / Hydration)
               ▼
 ┌─────────── TIER 2 ───────────┐
 │       RxDB IndexedDB         │◀───[ character-level CRDT sync ]
 └─────────────┬────────────────┘
               │ (Miss / Sync Push-Pull)
               ▼
 ┌─────────── TIER 3 ───────────┐
 │   Appwrite DB (elevated)    │
 └──────────────────────────────┘
```

### 1. 3-Tier Caching Hierarchy
- **Tier 1 (Memory)**: Instant read JavaScript `Map` references.
- **Tier 2 (RxDB)**: Local IndexedDB database (`kylrix_nexus_db_v2`) containing collections for `notes`, `tags`, `tasks`, `forms`, `events`, and `cache`. Supports conflict-free (CRDT) offline replication.
- **Tier 3 (Appwrite)**: Remote fetch. Deduplicates concurrent identical requests and caches reads under a configurable TTL.

### 2. Local-First Ideas Compose Flow
Authenticated note creation is entirely local-first using a single reserved Appwrite ID:
1. Opening the composer calls `ID.unique()`, registering a compose session on a globally shared set (`globalThis.__unpersistedDraftIds`), and pushing the shell to the cache.
2. Character updates flush to the live copy synchronously.
3. The first autosave or composer close calls `createNoteSecure($id)` once; subsequent writes route via `updateNoteSecure($id)`.
4. Card/detail sync status dots read the global `unpersistedDraftIds` set directly to render the amber pending indicator.

---

## III. MIDDLEWARE & COMPUTE GATES

### 1. Middleware Defense Layers
`middleware.ts` operates edge-level request guards:
- **Reload Storm Defense**: Tracks rapid reloads via `k_rld` cookie. Triggers a `429 Too Many Requests` block if 30 requests occur within 5 seconds.
- **Redirect Loop Circuit Breaker**: Aborts chained navigation loops if a user exceeds 5 consecutive redirects, routing them back to the root index.
- **Canonical Routing migrations**: Enforces redirects from `/note/*` to `/app/*`, `/send` to `/app`, and unauthenticated entry points to `/app/landing` or `/connect`.

### 2. Compute Entitlements & Pricing
- **Tiers**: `FREE`, `PRO`, `TEAMS`, `ORG`, `LIFETIME` resolved dynamically (`maxBillingUiTier`).
- **Project Collaboration**: Sharing, sub-projects, and group calls are strictly gated to `TEAMS` and higher. Ordinary note sharing requires `PRO` or higher.
- **BlockBee Hosted Checkout**: Checkout redirects authenticated users directly to `pay.blockbee.io` via `createBillingCheckoutSessionAction` with whitelisted callback origins (`https://www.kylrix.space/accounts/pro/success`). IPN webhooks verify transaction authenticity statelessly.

---

## IV. AI & KYLIE AGENTIC SUB-APP

- **Ecosystem Context Aggregator**: Automatically aggregates notes, tasks, and project domains into system instructions, providing contextually aware AI generation.
- **Global Agentic Drawer**: Renders a z-index-safe bottom panel (`z-index: 1300+`) utilizing a strict `60dvh` viewport cap. Chat history uses layout containment to prevent scrolling breaks.
- **Kylie Autocomplete / Steering**: The milestone suggestion bottom drawer queries the AI using a single structured call, returning a JSON array of sequential subtasks. Includes a steering input field allowing users to refine the generated outputs.
- **Guardrails**: Safety boundaries enforced via `agent-action-guardrail` serverless functions, intercepting high-risk write intents.

---

## V. ECOSYSTEM MESH & MESSAGING

- **Ecosystem Tab Node**: Tabs broadcast presence via `BroadcastChannel` heartbeats, enabling cross-tab intent routing (e.g., `create_task`) and tab-wide lock coordination.
- **Real-Time Presence**: Online/offline tracking, cursor positions, and typing indicators are synced live using Appwrite Realtime subscriptions.
- **Analytics View Rollups**: Content engagement is tracked anonymously by hashing viewer details (SHA-256 with salt) and aggregating views into rollups to rank feed algorithms.
- **Multi-Channel Notifications**:
  - **Email**: `lib/unorganic-email-api.ts` implements priority scoring, quota gates, and deduplication/anti-spam limits.
  - **Telegram Bot**: Operates as a lightweight push notification bridge.

---

## VI. BACKGROUND SERVERS & CRONS

### 1. Internal API Job Trigger
`app/api/internal/runtime-functions/route.ts` runs cron tasks, secured via timing-safe comparison against the `KYLRIX_INTERNAL_JOBS_SECRET` token.

### 2. Appwrite Serverless Functions
| Function | Schedule / Trigger | Purpose |
|---|---|---|
| `ghost-cleanup` | Daily (Cron) | Purges expired guest note data (`isGhost: true`) and recursively cascades deletion to related storage assets, comments, and voice files. |
| `data-porter` | On Demand | Executes JSON backup imports and exports. |
| `flow-agent-orchestrator` | Realtime Events | Runs background AI task workflows. |
| `permission-updater` | Permission Mutate | Propagates updated row permissions. |
| `sync-user-profile` | User Create | Initializes profiles and sends welcome emails. |
