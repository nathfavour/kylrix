# CHECKLIST: ZERO-TRUST SERVER-SIDE MIGRATION

This highly structured, atomic checklist tracks the sequential phases of migrating the Kylrix platform to a zero-trust server-side validation paradigm.

---

## PHASE 1: CORE INFRASTRUCTURE SETUP
- [ ] **Configure Environment Variables**
  - [ ] Assert `APPWRITE_API` (Admin API key) is defined in `.env` and production environments.
  - [ ] Verify `lib/appwrite-admin.ts` correctly instantiates `createAdminClient()` and `createAdminTablesDB()`.
- [ ] **Audit Existing Security Boundary**
  - [ ] Perform a full codebase search for instances of `storage.createFile`, `storage.updateFile`, and `storage.deleteFile`.
  - [ ] Perform a full codebase search for `databases.createDocument`, `databases.updateDocument`, and `databases.deleteDocument`.

---

## PHASE 2: SERVER ACTIONS REFACTORING (DATABASE MUTATIONS)

### 2.1 Note Database Migration
- [ ] **Implement Server Actions in `lib/actions/note-server.ts`**
  - [ ] Implement `createNoteAction` using `createAdminTablesDB()` and assign strict initial ACL read/update/delete permissions to the creator.
  - [ ] Implement `updateNoteAction` (verifies session, fetches current document, asserts ownership `userId === actor.$id`, writes changes).
  - [ ] Implement `deleteNoteAction` (verifies session, asserts ownership, deletes document).
- [ ] **Implement Comment & Tag Server Actions**
  - [ ] Implement `createCommentAction` (verifies session, writes to comment table).
  - [ ] Implement `upsertTagAction` (verifies session, binds tag to user).
- [ ] **Update Client-Side Consumers**
  - [ ] Refactor `lib/appwrite/note.ts` (redirect editor save/delete functions to invoke `updateNoteAction`/`deleteNoteAction` instead of direct client-side collection updates).

### 2.2 Vault Database Migration
- [ ] **Implement Server Actions in `lib/actions/vault-server.ts`**
  - [ ] Implement `upsertCredentialAction` (verifies user session, asserts ownership if updating, stores encrypted payload).
  - [ ] Implement `deleteCredentialAction` (verifies session, asserts ownership, deletes credential).
- [ ] **Refactor Vault Client Services**
  - [ ] Redirect all methods in `lib/appwrite/vault.ts` (e.g. `cloudBackup`, keychain writes) to secure Server Actions.

### 2.3 Flow Database Migration
- [ ] **Implement Server Actions in `lib/actions/flow-server.ts`**
  - [ ] Implement `upsertTaskAction` (verifies user is workspace member, writes task details).
  - [ ] Implement `deleteTaskAction` (verifies task ownership or project administrator status).
  - [ ] Implement secure `submitPublicFormAction` (incorporates Turnstile check, rates limit submissions, and writes to `formSubmissions`).

### 2.4 Chat Database Migration
- [ ] **Implement Server Actions in `lib/actions/chat-server.ts`**
  - [ ] Implement `sendMessageAction` (validates conversation membership, forces sender ID to authenticated session user ID to prevent spoofing, writes message).
  - [ ] Implement `createConversationAction` (creates conversation, maps memberships using secure transactions).

---

## PHASE 3: SERVER-SIDE FILE UPLOAD PIPELINE

### 3.1 Profile Pictures Upload Refactoring
- [ ] **Implement Client-Side Pre-processing**
  - [ ] Update `ProfileManager.tsx` to downscale pictures to `512x512` pixels.
  - [ ] Add aggressive compression to export format (`image/webp` or `image/jpeg` at `0.75` quality).
  - [ ] Assert size is physically `< 1 MB` before initiating upload.
- [ ] **Create `uploadAvatarAction` Server Action**
  - [ ] Validate active session and retrieve `actor.$id`.
  - [ ] Assert file size is strictly `< 1 MB`.
  - [ ] Validate MIME type is `image/jpeg`, `image/png`, or `image/webp`.
  - [ ] Stream file buffer to `profile_pictures` bucket using Admin client.
  - [ ] Update user's profile metadata in `users`/`profiles` collection with new `fileId`.

### 3.2 Voice Notes Upload Refactoring
- [ ] **Implement Client-Side Recording Limit**
  - [ ] Configure `ChatWindow.tsx` recorder to stop automatically at **120 seconds**.
  - [ ] Compress recording immediately using low-bitrate Opus codecs.
- [ ] **Create `uploadVoiceAction` Server Action**
  - [ ] Verify conversation participant state.
  - [ ] Assert uploaded audio size is `< 2 MB`.
  - [ ] Stream file to `voice` storage bucket.
  - [ ] Create chat message document referencing the secure `fileId`.

---

## PHASE 4: SECURITY BOUNDARY & DATABASE STRESS-TESTING

- [ ] **Apply Appwrite Console Restrictions**
  - [ ] Revoke client `Create`, `Update`, and `Delete` permissions on collections (`notes`, `credentials`, `tasks`, `messages`).
  - [ ] Revoke client upload permissions on buckets (`profile_pictures`, `voice`, `kylrix_send`).
- [ ] **Bypass Simulation (Attack Vector Testing)**
  - [ ] Using a test script or alternative client on `localhost`, attempt direct Appwrite Client SDK queries to mutate/delete rows.
  - [ ] Verify that all direct client mutations return `403 Access Denied`.
- [ ] **Data Loss Prevention Audit**
  - [ ] Run automated tests or perform thorough manual tests to verify that editing existing notes, credentials, and tasks completes successfully via Server Actions.
  - [ ] Verify that document ownership and sharing settings are fully preserved for all historical records.
