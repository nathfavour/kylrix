---
name: rxdb-appwrite-sync
description: RxDB/IndexedDB substrate for local-first storage. For object list/detail sync architecture (pendingSync, upsert merge, detail-must-not-autosave), follow the canonical `sync` skill first.
---

# RxDB / Appwrite substrate

**Canonical object sync rules live in `.agents/skills/sync/SKILL.md`.** Read and follow that skill before wiring CRUD for notes, goals, vault, projects, etc.

This skill covers the **storage substrate** (RxDB cache, IndexedDB, replication helpers). Do not implement list wipe/merge or pending-dot behavior from here alone.

## Pointers

| Concern | Where |
|---------|--------|
| Live copy SoT, pendingSync, detail no-autosave, merge, sort | **`sync` skill** |
| Merge / soft-pull helpers | `lib/sync/local-copy-sync.ts` |
| Push cycle | `lib/services/sync-engine.ts` |
| Notes live-copy context | `context/NotesContext.tsx` |

## Substrate notes

- Prefer RxDB/cache as cold-start hydrate before network.
- Upsert cache rows by `note_${id}` (or object-equivalent) after confirmed sync — never treat cache write as “remove from UI list.”
- Pending flags stay **out of** Appwrite and preferably out of persisted row payloads; they are client memory + epoch (see `sync` skill).

## Lessons (summary — full list in `sync`)

Do not: wipe list on page pull, clear pending on detail leave, Appwrite columns for sync status, detail `useAutosave` / immediate `updateNote` on typing, clear pending on “is remote?” reads.

Do: merge by id, shared `SyncStatusDot`, `markPendingSync` + engine `nudge`, clear only on `kylrix:sync-complete`, re-queue on concurrent edit.
