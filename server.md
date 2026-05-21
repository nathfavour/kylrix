# ZERO-TRUST ARCHITECTURE: SERVER-SIDE ENFORCEMENT & HARDENING REPORT

This document outlines the architectural transition of the Kylrix platform from direct client-side Appwrite SDK mutations to a hardened, server-side validated **Zero-Trust Envelope**. 

By completely removing direct `Create`, `Update`, and `Delete` permissions from the client-side SDK for all users and guests, and routing all state-changing mutations through authenticated Next.js Server Actions backed by an Admin SDK instance, we completely eliminate the security loophole of `localhost` origin access.

---

## 1. COMPLETE DATA STRUCTURE ANALYSIS

The Kylrix platform operates across four logical Appwrite databases and 12 active storage buckets. Here is the absolute mapping of every data model, collection, and bucket across the workspace:

### A. Database Collections Mapping

#### 1. Note Database (`67ff05a9000296822396` / Alias: `NOTE`, `KYLRIXNOTE`)
Stores the primary notes, tag mappings, activity logs, public blogs, and user profiles related to the collaborative editor.
- **`users` (`67ff05c900247b5673d3`)**: Core user account mappings.
- **`notes` (`67ff05f3002502ef239e`)**: Collaborative note document body, metadata, and ACLs.
- **`tags` (`67ff06280034908cf08a`)**: User-defined folder/tag taxonomies.
- **`apikeys` (`67ff064400263631ffe4`)**: External developer and integrations API tokens.
- **`blogposts` (`67ff065a003e2bb950f7`)**: Public-facing publishing and blog posts.
- **`comments` (`comments`)**: Threaded discussion logs on notes and documents.
- **`extensions` (`extensions`)**: Custom tools, workspace widgets, and sidebar panels.
- **`reactions` (`reactions`)**: Emojis and comment/moment interactions.
- **`collaborators` (`collaborators`)**: Fine-grained note permission shares.
- **`activityLog` (`activityLog`)**: Non-repudiable audit logs of user actions.
- **`settings` (`settings`)**: Editor appearance, typography, and profile preferences.
- **`subscriptions` (`subscriptions`)**: Billing states and feature tier configurations.
- **`note_tags` (`note_tags`)**: Many-to-many relationship join table for notes and tags.
- **`note_revisions` (`note_revisions`)**: Text diff logs and history version snapshots.
- **`walletMap` (`walletMap`)**: Verified Web3 address to Web2 user mappings.
- **`profiles` (`profiles`)**: Public-facing user social profiles.

#### 2. Vault Database (`passwordManagerDb` / Alias: `VAULT`, `PASSWORD_MANAGER`)
Stores end-to-end encrypted items, keychain records, and zero-knowledge structures.
- **`credentials` (`credentials`)**: Client-side AES-GCM encrypted passwords and account credentials.
- **`totpSecrets` (`totpSecrets`)**: Client-side encrypted authenticator secrets.
- **`folders` (`folders`)**: Vault item categories.
- **`securityLogs` (`securityLogs`)**: Session access, password leakage, and security audit logs.
- **`user` (`user`)**: Core user encryption keys and parameters.
- **`keychain` (`keychain`)**: Pointers to shared private keys and zero-knowledge claims.
- **`key_mapping` (`key_mapping`)**: Key-share structures for shared passwords.
- **`wallets` (`wallets`)**: Client-side encrypted private keys and wallet backups.
- **`identities` (`identities`)**: Secure autofill profile details.

#### 3. Flow Database (`whisperrflow` / Alias: `FLOW`, `KYLRIXFLOW`)
Stores project management boards, task lists, calendar events, and agent states.
- **`tasks` (`tasks`)**: Workspace task tickets, status columns, priorities, and descriptions.
- **`events` (`events`)**: Calendar occurrences, schedules, and event coordinates.
- **`eventGuests` (`eventGuests`)**: Invited event attendees and attendance RSVP states.
- **`Collaborators` (`Collaborators`)**: Project-level permission settings.
- **`forms` (`forms`)**: Form-generation configurations.
- **`formSubmissions` (`formSubmissions`)**: Data payloads from public/private forms.
- **`agents` (`agents`)**: Autonomic backend agent parameters and instruction payloads.

#### 4. Chat Database (`chat` / Alias: `CONNECT`, `CHAT`)
Stores real-time DM/group chats, social moments, following logs, and WebRTC calls.
- **`users` (`users`)**: Social user handles, presence, and verified status.
- **`profiles` (`profiles`)**: Connect-specific social metadata.
- **`conversations` (`conversations`)**: DM and Group Chat master contexts.
- **`conversationMembers` (`conversationMembers`)**: Mappings of users to conversations with role permissions.
- **`messages` (`messages`)**: Enrypted or plaintext chat history logs.
- **`joinRequests` (`joinRequests`)**: Requests to join public or invite-only group channels.
- **`messageReactions` (`messageReactions`)**: Emoji reactions on chat messages.
- **`epochs` (`epochs`)**: Epoch parameters for chat rolling windows.
- **`unorganic_emails` (`unorganic_emails`)**: Invited emails for platform onboarding.
- **`accountEvents` (`accountEvents`)**: Ephemeral social actions.
- **`app_activity` (`app_activity`)**: Application active usage tracking metrics.
- **`calls` (`calls`)**: Active and history WebRTC call codes and metadata.
- **`follows` (`follows`)**: Social graph mappings (followers and following).
- **`moments` (`moments`)**: Social feed micro-blogging posts and replies.
- **`interactions` (`interactions`)**: Social post likes, bookmarks, and repost records.
- **`contacts` (`contacts`)**: Address book listings.
- **`kylrix_token_ledger` (`kylrix_token_ledger`)**: Secure balance and token audit ledger.
- **`engagement_views` (`engagement_views`)**: Social impressions and view logs.
- **`engagement_view_rollups` (`engagement_view_rollups`)**: Rolled-up analytical views.
- **`telegram_connections` (`telegram_connections`)**: Secure Telegram user linkage mappings.

---

### B. Storage Buckets Mapping

1. **`profile_pictures`**: User avatars. Free users uploads are downscaled and compressed on the client before submission.
2. **`group_avatars`**: Custom icons for group chats.
3. **`notes_attachments`** (Alias: `task_attachments`): Document uploads inside notes and task boards.
4. **`blog_media`** (Alias: `event_covers`): Cover art and media for public blogs and calendar events.
5. **`extension_assets`**: Assets uploaded by custom plugins.
6. **`backups`**: JSON backups of user passwords/keychains.
7. **`temp_uploads`**: Temporary staging buffers for slow uploads.
8. **`kylrix_send`**: Ephemeral encrypted files with high compression and 7-day TTL.
9. **`messages`**: General file, image, and media attachments sent inside chat channels.
10. **`voice`**: Client-side compressed Opus recordings limited to a strict 120-second (2-minute) hard cap.
11. **`video`**: Direct video attachments.
12. **`documents`**: Plain documents, PDFs, and generic files.

---

## 2. PERMISSION REVOCATION MATRIX

The zero-trust goal is to strip direct client-side SDK mutations (`Create`, `Update`, `Delete`) from the client for almost all databases and buckets, routing mutations through Next.js server actions.

| Database / Collection / Bucket | Client SDK (Read) | Client SDK (Create/Update/Delete) | Revocation Action | New Server-Side Validation Route |
| :--- | :--- | :--- | :--- | :--- |
| **NOTE DB: `notes`** | **Allowed** (ACL owned/shared) | **Revoke** | Revoke all client writes | Server Action `updateNoteAction` checks authenticated user session and writes. |
| **NOTE DB: `comments`** | **Allowed** (Any/Auth) | **Revoke** | Revoke all client writes | Server Action `createCommentAction` validates content and writes. |
| **NOTE DB: `apikeys`** | **Allowed** (Owner) | **Revoke** | Revoke all client writes | Server Action `createApiKeyAction` generates key and writes. |
| **NOTE DB: `activityLog`** | **Revoke** | **Revoke** (Vulnerable!) | Revoke all client access | Server Actions write non-repudiable logs on operations using Admin SDK. |
| **NOTE DB: `subscriptions`** | **Allowed** (Owner) | **Revoke** (Critical!) | Revoke all client writes | Handled strictly via webhook / Stripe backend. |
| **VAULT DB: `credentials`** | **Allowed** (Owner) | **Revoke** | Revoke all client writes | Server Action `upsertCredentialAction` takes client-side encrypted payloads, validates owner, and writes. |
| **VAULT DB: `totpSecrets`** | **Allowed** (Owner) | **Revoke** | Revoke all client writes | Server Action `saveTotpSecretAction` handles. |
| **FLOW DB: `tasks`** | **Allowed** (Project Memb) | **Revoke** | Revoke all client writes | Server Action `upsertTaskAction` checks project bounds. |
| **FLOW DB: `formSubmissions`**| **Revoke** | **Revoke** | Revoke direct submission | Server endpoint validates Turnstile Captcha and writes to database. |
| **CHAT DB: `messages`** | **Allowed** (Chat Memb) | **Revoke** (Spoof Risk!) | Revoke all client writes | Server Action `sendMessageAction` forces sender ID to authenticated user session ID. |
| **CHAT DB: `calls`** | **Allowed** (Participants) | **Revoke** | Revoke all client writes | Already migrated to Server Action `createChatCallAction`. |
| **CHAT DB: `kylrix_token_ledger`**| **Allowed** (Owner) | **Revoke** (Massive Risk!) | Revoke all client writes | Handled strictly by backend hooks and functions. |
| **BUCKET: `profile_pictures`**| **Allowed** (Any) | **Revoke** (Vulnerable!) | Revoke client upload rights | Server Action `uploadAvatarAction` verifies session, accepts downscaled image (<1MB), and uploads. |
| **BUCKET: `voice`** | **Allowed** (Chat Memb) | **Revoke** | Revoke client upload rights | Server Action `uploadVoiceAction` verifies session, validates 120s limit, and uploads. |
| **BUCKET: `kylrix_send`** | **Allowed** (Any) | **Revoke** | Revoke client upload rights | Server Action `uploadSendFileAction` validates limits and uploads. |

---

## 3. APPWRITE CONSOLE INSTRUCTION MANUAL

Follow these discrete, sequential instructions inside the Appwrite Web Console to configure the permissions safely:

### Step A: Lock Down Database Collections
For every collection listed in the **Permission Revocation Matrix** (e.g., `notes`, `messages`, `credentials`, `tasks`):
1. Log in to the Appwrite Console (`https://console.kylrix.space` or local container panel).
2. Click on **Databases** from the left-side navigation.
3. Select the target database (e.g., **Connect**, **passwordManagerDb**, **whisperrflow**, or **67ff05a9000296822396**).
4. Click on the target **Collection** (e.g., `messages`).
5. Navigate to the **Settings** tab.
6. Scroll down to the **Permissions** section.
7. Click the trash/delete icon next to `Create`, `Update`, and `Delete` permissions for roles:
   * **`All Users` / `users`**
   * **`Any` / `any`**
   * **`Guests` / `guests`**
8. Keep only the **`Read`** permission active (usually bound to `users` or a specific role/user).
9. Click **Update** at the bottom of the page to save.

### Step B: Lock Down Storage Buckets
For every bucket (e.g., `profile_pictures`, `group_avatars`, `voice`, `kylrix_send`):
1. Click on **Storage** from the left-side navigation.
2. Select the target **Bucket**.
3. Navigate to the **Settings** tab.
4. Scroll down to the **Permissions** section.
5. Under the **Permissions** list:
   * Keep the **`Read`** checkbox active for target readers (e.g., `users`).
   * Completely uncheck the **`Create`**, **`Update`**, and **`Delete`** checkboxes for all client-facing roles.
6. Under **Security**:
   * Enable **Encryption** if not already active.
   * Restrict **File Size Limit** (e.g., set `profile_pictures` to `1 MB` and `voice` to `5 MB` to backstop server-side verification).
   * Restrict **Allowed Extensions** (e.g., allow only `jpg`, `png`, `webp` for `profile_pictures`, and `ogg`, `webm` for `voice`).
7. Click **Update** to apply the security rules.

---

## 4. DATA INTEGRITY IMPACT REPORT

Transitioning permissions to Server Actions powered by the Admin SDK (`node-appwrite`) guarantees **absolute data safety and zero disruption** for existing users, under the following constraints:

### No Database Schema Modifications
- **Zero Schema Changes:** Because this is purely a permission policy shift, no database columns, row layouts, or data tables are modified. Existing documents remain completely untouched.
- **Immediate Server Override:** Since the Server Actions utilize an Admin Client initialized with an `APPWRITE_API` key, the Appwrite engine completely bypasses the collection-level permissions. The server will be able to read, create, update, and delete rows and files regardless of the collection settings.

### Document Access Control (ACL) Integrity
- **Existing ACLs Intact:** Existing documents that have individual document-level permissions (such as notes shared with specific user IDs) will continue to respect those ACLs. The client SDK can still perform queries and read these documents directly.
- **Server Action Responsibility:** Since the Admin SDK bypasses database permissions, Server Actions must be programmed to explicitly query documents and verify ownership (`document.userId === actor.$id`) before executing any update or delete operations on behalf of a user. If this verification is omitted, a user could theoretically request an action on a resource they do not own.

---

## 5. UX ENHANCEMENT OPPORTUNITIES

Shifting the boundary of trust to the server allows us to simplify the user experience (UX) and eliminate complex client-side workflows:

### A. Trivializing Public Elements (e.g. Note Comments)
- **Direct Plaintext Writes:** Public comments, tag mappings, and blog interactions do not require heavy, slow client-side cryptographic derivation. Because these elements are public, the client can send the comment directly via the Server Action. The server validates the user's active session and writes the comment immediately. This eliminates lag, loading spinners, and local cryptographic verification for public notes.

### B. Crytographic Isolation
- **Laser-focused Security:** The complex, compute-intensive client-side zero-knowledge architecture (generating vault keys, PBKDF2 iterations, AES-GCM decryption/encryption) is isolated strictly to the **Vault** and **Chat** layers where absolute data privacy is required.
- **Clean SSR (Server-Side Rendering):** Because the server handles public note writes and reads using plaintext pathways, public notes can be server-rendered (SSR) instantly, crawled by search engine crawlers (boosting SEO), and accessed instantly by visitors without requiring a web worker or decryption step upon page load.
