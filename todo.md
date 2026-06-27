# Kylrix Ecosystem Development Roadmap & TODO 🏴

This document serves as the single source of truth for the development progress and future implementations of the Kylrix ecosystem. It tracks high-priority roadmap tasks grouped by architectural boundaries.

---

## 🔐 1. Cryptography, WESP & Security Substrate
*   **Web Workers Key Derivation**:
    *   [ ] Offload CPU-heavy PBKDF2 (600,000 iterations) and Argon2id WebAssembly-compiled stretching to a dedicated Web Worker to eliminate main thread blocking (UI freezing) during vault unlock.
*   **WebAuthn PRF Integration**:
    *   [ ] Support WebAuthn PRF (Pseudo-Random Function) extension to derive the Master Encryption Key (MEK) directly from physical/biometric credentials, bypassing password entry when biometrics are unlocked.
*   **WESP RAM Sanitation**:
    *   [ ] Implement explicit in-memory zeroing/overwriting of `CryptoKey` and raw array buffers when the application locks or user logs out to mathematically prevent RAM dump vulnerabilities.
*   **Temporal Sudo Mode Refinements**:
    *   [ ] Hard-lock the Sudo Mode context to exactly `300 seconds` (5 minutes) using browser-performance high-resolution timers (`performance.now`) instead of standard clock time to resist local clock manipulation.

---

## 🔄 2. Sync Engine & Data Infrastructure (Data Nexus & RxDB)
*   **CRDT Compact Delta Logs**:
    *   [ ] Implement periodic delta-sync compaction for RxDB/IndexedDB notes replication logs to prevent local IndexedDB database size bloat over long periods of collaborative note-taking.
*   **Multi-Tab Conflict Mitigation**:
    *   [ ] Optimize BroadcastChannel heartbeats to immediately coordinate local IndexedDB cache invalidation before writing to prevent race conditions during concurrent editing across multiple open tabs.
*   **Draft Autosave Engine Auditing**:
    *   [ ] Audit `lib/services/drafts.ts` and ensure comprehensive Server-Side Rendering (SSR) safety checks (`typeof window === 'undefined'`) are in place across all entry points.
*   **Aggressive Deduplication & Fetch Coalescing**:
    *   [ ] Implement a unified fetch manager in the Data Nexus to coalesce rapid identical read operations into a single network task, completely preventing "thundering herd" query spikes to Appwrite.

---

## 🔗 3. Broadcast Mesh & Service Worker Volatile Context
*   **Context Sync Hardening**:
    *   [ ] Expand `public/sw.js` (v1.0.3) context validation to verify tab matching tokens, preventing unauthorized tabs or extensions from querying the stored volatile MEK via cross-document messaging.
*   **Ecosystem Bridge Routing**:
    *   [ ] Standardize URL intents (e.g. `create_task`, `share_secret`) processed by `EcosystemBridge` to automatically launch or query the appropriate active tab workspace instead of spawning redundant sessions.
*   **Mesh Presence Telemetry**:
    *   [ ] Integrate local BroadcastChannel PULSE heartbeats with the Appwrite `app_activity` presence table to dynamically sync tab focus shifts and active/idle status.

---

## 💳 4. Billing, Subscriptions & BlockBee Hosted Checkout
*   **Webhook Signature Validation**:
    *   [ ] Enforce mandatory SHA-256 signature verification in `app/(app)/(auth)/accounts/api/pro/notify/route.ts` using the BlockBee API secret key, denying all unsigned webhook requests in production.
*   **IPN Transaction Idempotency Lock**:
    *   [ ] Implement redis-backed lock keys during BlockBee callback verification to prevent double-crediting of subscriptions in case of duplicate webhook notifications.
*   **Checkout Redirect Origin Auditing**:
    *   [ ] Ensure `billing-urls.ts` resolves pathnames cleanly using `NEXT_PUBLIC_APP_URL` and strictly appends `/accounts/` to avoid broken hosted redirect origins.

---

## 🤖 5. AI Subsystem, Guardrails & BYOK Context
*   **Privacy Scrubbing & Sanitization**:
    *   [ ] Implement a client-side lexical scanner inside `context/AIContext.tsx` to automatically scrub usernames, passwords, and private identifiers from note/task contexts before transmitting payloads to external LLM endpoints.
*   **Agentic Orchestration Guardrails**:
    *   [ ] Hardcode strict rule blocks in the `agent-action-guardrail` serverless function to explicitly reject file deletion requests and limit daily email output, mitigating rogue agent behaviors.

---

## 📊 6. Engagement Analytics & Real-Time Presence
*   **Anonymized Analytics Hashing**:
    *   [ ] Strengthen viewer privacy in `engagement-views.ts` by salting and hashing (SHA-256) IP and User-Agent combinations on a daily epoch basis to prevent static cross-day user tracking.
*   **Cursor Sync Optimization**:
    *   [ ] Throttle collaborative editing cursor broadcast messages to a maximum of `100ms` intervals to optimize WebSocket frame overhead during multi-user document sessions.

---

## 🔔 7. Priority Notification System & Dispatcher
*   **Email Queue Throttling**:
    *   [ ] Refine anti-spam rules in `lib/unorganic-email-api.ts` to strictly enforce the maximum quotas (5 ordinary emails/month, 2/week) and queue low-priority digests when limits are exceeded.
*   **Telegram Webhook Auto-Retry**:
    *   [ ] Implement automatic retry queues with exponential backoff inside `telegram-dispatch.ts` to handle Telegram API rate limit errors (HTTP 429) during high activity peaks.

---

## 🎨 8. UI/UX, Design Language & OpenBricks Portals
*   **OpenBricks Portal Audit**:
    *   [ ] Verify that all OpenBricks drawer, dialog, and modal components strictly use `disablePortal: true` and `keepMounted: false` configurations to prevent layout collisions.
*   **Global Unmount Enforcements**:
    *   [ ] Scan component layouts (`components/`, `app/`) to confirm that all interactive overlays are conditionally rendered (`{isOpen && <Component />}`) rather than hidden via CSS classes, ensuring complete pointer-event safety.
*   **Tailwind Transition Cleanup**:
    *   [ ] Clean up remaining deprecated CSS class selectors in `globals.css` and enforce strict utility mappings aligned with the OpenBricks design tokens.
