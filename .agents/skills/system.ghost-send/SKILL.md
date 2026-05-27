---
name: system.ghost-send
description: Intricacies and architectural mandates for the Unified Send (Ghost Relay) system. Explains the 7-day auto-clearing polymorphic relay, zero-idle onboarding, and forced-encryption defaults.
---

# Why: Unified Ghost Send Relay

The **Unified Send** system is the flagship discovery engine for the Kylrix suite. It transforms the `notes` table into a universal polymorphic relay that serves two primary purposes:
1.  **Viral Adoption**: Public, unencrypted previews on `/send` drive viral discovery and lower the barrier to entry.
2.  **Hard Security**: Zero-knowledge sharing on the same infrastructure protects high-value secrets (Passwords, TOTP, Files).

## 🏗️ Architectural Mandates

### 1. The 7-Day Purge Rule
Every object created via `/send` is a **Ghost Object**. 
-   **Identification**: Marked with `isGhost: true`.
-   **Lifecycle**: Subjects the row to an automated 7-day cleanup sweep via `cleanupExpiredPublicGhostNotes`.
-   **Recursive Purge**: The cleanup is fully recursive. Deleting a ghost note cascades to `general_storage` files (if `isFile`), comments, reactions, and associated voice notes (by extracting `voiceFileId` from the metadata).
-   **Persistence**: If a user wants to keep a Send item, they MUST "Claim" it before the 7-day window expires.

### 2. Zero-Idle Onboarding
To maintain momentum and leave no user time idle, unauthenticated traffic to protected sub-apps (`/note`, `/vault`, `/flow`, etc.) is **redirected to `/send`** via middleware. This ensures new users land on a high-value creation surface rather than a login wall.

### 3. Forced Encryption (Security First)
The legacy `/send/secure` sub-route is **ABANDONED**. Everything is unified on `/send` with a dynamic UI toggle.
-   **Credentials & Files**: Passwords (`isPass`), TOTP seeds (`isTotp`), and Files (`isFile`) are **ALWAYS** zero-knowledge encrypted regardless of the UI toggle. The toggle hides itself and locks to "Secure Mode".
-   **Notes & Discussions**: Can be either public previews or zero-knowledge encrypted based on the user's toggle.
-   **Sub-items**: Comments in an encrypted discussion inherit the encryption state and are E2E encrypted with the same URL key fragment.

### 4. Polymorphic Relaying
The `notes` table carries diverse payloads using first-class booleans:
-   `isPass`, `isTask`, `isFile`, `isTotp`, `isDiscussion`.
-   This avoids the complexity of separate "Ghost" tables and enables high-performance indexing. `isDiscussion` represents ephemeral chat threads, while `isThread` represents permanent, claimed huddles.

### 5. Discrete Sharing (The Collaborators Engine)
While most Sends are global (`isPublic: true` && `isGuest: true`), the system supports **Selective Audience** delivery. 
-   **Mechanism**: Uses the global `Collaborators` table in `whisperrflow`.
-   **Permission**: Recipients receive a baseline `read` permission.
-   **Access**: This allows guests to search for specific users and share items securely without making them fully public.

### 6. The Claim Escalation Path
Claims convert ephemeral rows into permanent resources.
-   **Verification**: The server MUST verify the `ghostSecret` (held locally in the creator's "Spark" stash) before escalation.
-   **Escalation**: Claims use the `forceSystem: true` flag in the database adapter to bypass Read-Only RLS after server-side permission checks.
-   **Cleanup**: Once a claim is successful, the original ghost link is **burned** (deleted) immediately.

## 🚫 PROHIBITED PATTERNS
-   **Do NOT** create separate tables for new Send types. Add a boolean to `notes` instead.
-   **Do NOT** store password/totp content in plaintext.
-   **Do NOT** bypass the middleware redirection without a hard technical requirement.
-   **Do NOT** allow claims without verifying the `ghostSecret`.

This system is designed for high-velocity sharing with a hard security boundary. Dismantling the polymorphic relay or the 7-day sweep logic will cause immediate database bloat and security regressions.
