---
name: sync
description: Canonical local-copy sync architecture for Kylrix objects. Live copy is UI SoT; Appwrite feeds and confirms it. Client-only pendingSync; detail never autosaves; upsert merge never wipes; shared SyncStatusDot. Use when wiring CRUD for notes, goals, vault, projects, or any object onto the live engine.
---

# Sync (Local Copy ↔ Appwrite)

This is the **canonical sync skill** for the suite. Notes/Ideas were the first reference implementation; the same rules apply when porting to goals, vault rows, projects, forms, etc.

**Code anchors**

| Piece | Path |
|-------|------|
| Object-agnostic merge / sort / soft-pull cadence | `lib/sync/local-copy-sync.ts` |
| Activity intensity + draft **push** cycle | `lib/services/sync-engine.ts` |
| Live-copy getter bridge for push payloads | `lib/sync/pending-sync-bridge.ts` |
| Pending vs remote-persisted flags (notes) | `lib/notes/compose-draft-registry.ts` |
| Shared amber/green affordance | `components/ui/SyncStatusDot.tsx` |
| Reference live-copy context | `context/NotesContext.tsx` |

Related (substrate only): `rxdb-appwrite-sync` — RxDB/IndexedDB details. **Do not** implement object list sync from that skill alone; follow **this** skill first.

---

## Intent

1. UI talks **only** to the live/local copy (context list + cache/RxDB).
2. Appwrite is the remote source of truth that **feeds and confirms** that live copy.
3. Push and pull are **upserts by id** — never “replace the whole list with a page” and never “discard the card because it uploaded.”
4. Background sync is **autonomic** (activity intensity + realtime), not random full reloads that strand the user on an empty screen.
5. **Pending sync is client-only** — never an Appwrite column. Card and detail share one indicator.

---

## Dual source of truth (strict)

| Layer | Role |
|-------|------|
| **Live / local copy** | SoT for **on-device UI** (cards, detail, selectors, composers). |
| **Appwrite database** | SoT that **confirms** and **replenishes** the live copy (push success, pull pages, realtime events). |

- Detail = **stateful plugin** on the live copy (edits → `pushLive*` + `markPendingSync`).
- Card/list = **stateless projection** of the live copy + shared `SyncStatusDot`.
- No open-path `getX()` in detail that overwrites newer local state.

---

## Pending sync (client-only — critical)

| Rule | Do | Do not |
|------|----|--------|
| Storage | In-memory set (`markComposeDraft` / `markPendingSync`) + React `composeSyncEpoch` | Appwrite attributes like `pendingSync`, `isDirty`, `syncStatus` |
| Who sets pending | Any edit path that mutates live copy | Detail-owned React state that cards cannot see |
| Who clears pending | Sync engine after **confirmed** remote write (`kylrix:sync-complete`) | Leaving the detail, unmount, “Saving…”, or “is this remote?” reads |
| What gets pushed | Live-copy payload via `getLiveNoteForSync` + `pick*AutosavePayload` | Pending flags, UI-only fields, or detail-private caches |
| Indicator | `SyncStatusDot` + `isPendingSync(id)` on **both** card and detail | Separate “Saving…” in detail and green on card |

### API surface (notes reference)

- `markPendingSync(id)` — edit happened; amber everywhere.
- `clearPendingSync(id)` — remote confirmed; green everywhere.
- `isPendingSync(id)` — ephemeral / unpersisted draft / pending set.
- `composeSyncEpoch` — bump so React re-evaluates dots without storing flags on rows.
- `autonomicSyncEngine.nudge()` — schedule a flush after marking pending.
- Events: `kylrix:sync-complete` (clear), `kylrix:sync-pending` (re-queue after concurrent edit).

---

## Detail must not own saves

Detail is **not** a second sync engine.

| Do | Do not |
|----|--------|
| `commitLocalEdit` / `pushLive*` + `markPendingSync` + `nudge()` | `useAutosave` / `forceSave` / immediate `updateNote` on every keystroke or voice insert |
| Leave pending amber when user closes detail | Clear pending on unmount / back / “Saving…” complete |
| Share `SyncStatusDot` with the card | Show “Saving…” only in detail while card stays green |
| Let sync engine create-or-update from live copy | Race detail autosave against the engine with different payloads |

**Why we ripped detail autosave:** it cleared pending when the detail believed it had saved, while the card only watched the compose registry — green card, dirty detail, then wipe/race on pull. One pending set, one flusher.

---

## Core sync rules

### 1. Separation of concerns
- Keystrokes / edits update the live copy **synchronously**.
- Remote writes are scheduled by the sync engine **asynchronously**.

### 2. Autonomic activity scheduling
- High typing intensity → shorter push check interval.
- Idle / reading → longer interval.
- Soft **pull** uses `shouldSoftPull({ lastPullAt, activityIntensity })` plus visibility/focus.

### 3. Draft / pending isolation
- Pending local edits use a pending-id set.
- Card amber/green reads that set (plus epoch).
- Push failures **isolate** that row; other rows keep syncing.
- `isNotePersistedRemote` (or equivalent) gates create vs update — it must **not** clear pending as a read side effect.
- After flush: if live `updatedAt` moved while the network call ran, **re-queue** (`markComposeDraft` + `kylrix:sync-pending`) — do not green prematurely.

### 4. Upsert merge — never wipe
Pulls return **pages**. Replacing the live list with `serverPage` drops local rows missing from that page → “card vanished after sync.”

Use `mergeServerPageWithLocalCopy`:

- Both sides → merge (live-edit guard / newer local `updatedAt` wins when appropriate).
- Local only → **keep**.
- Remote only → append.
- Remove only on **explicit** delete/tombstone (realtime `.delete`).

### 5. Push confirms — does not discard
After successful remote create/update: clear pending. The **card stays** in the live copy.

### 6. Canonical list order
`sortPinnedThenCreatedAt`: pinned first, then newest `$createdAt` / `createdAt`.

### 7. Auth / cold start
- Hydrate from cache/RxDB before network when possible.
- Clear live list only on **confirmed logout**, not auth flicker.
- Failed pull must not wipe a populated live copy.

---

## Modularizing for other objects (checklist)

For each object type `T`:

1. Context list = live copy (`pushLiveT` / `upsertT`).
2. **Client-only** pending registry keyed by id (or `resourceType:id`) — never DB columns.
3. Detail edits: live push + `markPendingSync` only; **no** detail-owned autosave to Appwrite.
4. Sync engine (or shared cycle): read live payload via a getter bridge; strip non-columns; create-or-update; emit complete / re-queue.
5. Every pull/reset → `mergeServerPageWithLocalCopy`.
6. Realtime → upsert/delete by id (with edit guards).
7. Soft pull via activity + `lastPullAt` + visibility.
8. Sort pinned → newest created.
9. Card + detail use the same pending indicator (`SyncStatusDot` or equivalent).
10. Do **not** give detail a private cache that “owns” the card.

---

## Problems we already solved (do not reintroduce)

1. **Wipe-after-sync** — `setList(serverPage)` dropped cards not on page 1. → Upsert merge; keep local-only ids.
2. **Detail vs card split brain** — Detail `getNote()` overwrote newer local. → Both read live copy.
3. **Green while dirty** — Pending only in detail React state / cleared by autosave. → Shared client-only pending + epoch; detail does not clear on leave.
4. **Pending cleared by “is remote?” reads** — Remote-id checks deleted pending. → Reads must not clear pending.
5. **Auth flash empty** — Logout clear during bootstrap. → Clear only on confirmed logout.
6. **Scattered order** — Pin sort without createdAt. → Pinned, then newest created.
7. **Manual refresh dependency** — No lastPull/activity heartbeat. → Soft pull + realtime.
8. **Push treated as discard** — “Uploaded = remove local.” → Push confirms; local remains UI SoT.
9. **Open-path network as SoT** — Parallel fetches racing the live copy. → Leave network to sync/realtime.
10. **Detail force-save on unmount** — Cleared amber while engine still had work / raced payloads. → Nudge engine; keep pending until confirm.
11. **Immediate updateNote on voice/paste/format** — Bypassed pending SoT and cleared dirty early. → Same `commitLocalEdit` path as typing.
12. **Concurrent edit during flush** — Cleared pending while live copy already moved on. → Compare timestamps; re-queue + `kylrix:sync-pending`.

---

## Quick test matrix

- Create → card survives amber→green, soft pull, and refresh.
- Edit in detail → amber on **card and detail** immediately; green only after flush; reopen keeps text.
- Close detail while amber → card stays amber; engine still flushes; no wipe.
- Type during an in-flight flush → stays/reverts to amber until latest live copy is confirmed.
- New device login → fills via soft pull/realtime without permanent empty.
- Pin + create → pinned block first, then newest created.
- Explicit delete → leaves live copy; mere omission from page 1 does not.
