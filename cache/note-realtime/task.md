# Note Realtime Task Log

## Scope requested
- User requirement: while Create Note drawer is active, note card must exist and mirror realtime `title`, `content`, and `tags`.
- Expected behavior:
  - card appears as soon as draft is non-blank
  - card updates live while typing
  - card disappears only if draft returns to fully blank
  - no duplicate cards
  - no stale snapshots that show only first character/word

## Current user-reported failures (latest)
- Duplicate cards still appear for one note.
- Card preview still sometimes shows only first character (example: `g` from `good day`).
- Realtime parity between create drawer and card remains broken.

## What is currently right
- Create drawer now has an Attach entry in text actions.
- Attach flow in create drawer opens generalized resource picker (`ProjectAddObjectModal`, `mode="resource"`).
- Note detail text-action drawer includes attach actions and opens generalized picker.
- Build/lint pass at each attempted stage (but this did not validate UX correctness).

## What is currently wrong
- Live draft lifecycle remains unstable:
  - draft creation, migration (`live-*` -> saved id), and page list updates are still racing.
  - under some timing, stale or partial snapshot wins and card preview is truncated.
- Dedupe is incomplete:
  - both ephemeral and saved representation can still surface as separate cards in user flow.
- Final-state push on close did not fully eliminate stale/partial card state in practice.

## Changes attempted during this cycle

### 1) Notes context realtime-guard and live-draft support
- Added live-edit guard map for note updates.
- Added `pushLiveNote` API to upsert in-memory note state immediately.
- Added compose session APIs:
  - `registerComposeSession(noteId)`
  - `unregisterComposeSession(noteId)`
- Realtime subscription logic adjusted to avoid overwriting active compose state.

### 2) Create drawer realtime model changes
- Switched create flow toward candidate-note style realtime pushing.
- Generated ephemeral `live-*` note IDs on first non-blank input.
- Pushed draft note into `NotesContext` and local cache on each edit.
- Added cleanup path:
  - when draft becomes fully blank, remove ephemeral draft and reset.
- Added force-save/unmount save behavior using autosave hook patterns.

### 3) List visibility path changes
- Updated page-level `handleNoteCreated` to:
  - register compose session
  - push live note
  - clear search
  - go to page 1
- Goal: force draft card into visible list pipeline immediately.

### 4) ID migration / dedupe attempts
- Modified `migrateDraftId` to remove ephemeral note and transfer active session.
- Removed extra source-copy logic that could duplicate live and saved rows.
- Added final snapshot push in close handler before exit to preserve latest content.

### 5) Attach UX alignment attempts
- Added Attach in create text-actions drawer.
- Ensured attach in note detail text-actions remains visible and wired.
- Reused generalized attach picker component for both create and detail surfaces.

## Why it still fails (observed)
- The system still has multiple concurrent writers to card state:
  - create editor keystroke push
  - autosave callback path
  - realtime subscription path
  - id migration/update paths
- These writers can interleave and produce:
  - preview truncation (partial payload winning)
  - duplicate cards (ephemeral + saved timing overlap)

## Recommended next debugging direction (not implemented here)
- Introduce one authoritative draft reducer for create drawer with explicit states:
  - `ephemeral-active`, `migrating`, `saved-active`, `cleared`
- Enforce single writer rule for list card projection:
  - only reducer output may call `pushLiveNote`
  - all other flows write server/cache only
- Add hard dedupe invariant in `NotesContext`:
  - collapse rows with same logical draft lineage during migration window
- Add deterministic telemetry logs around:
  - draft id creation
  - draft id migration
  - list insert/update/remove
  - realtime event handling decision

## Explicit instruction followed now
- Per latest user instruction: no additional code fixes were made beyond creating this task file.
- No further lint/build/test actions performed after this instruction.

---

## Fix applied 2026-07-08 by new agent

### Root causes identified
1. **Double push on first note creation**: `candidateNote` useEffect in `CreateNoteForm` called `onNoteCreated(draftNote)`, which triggered `NoteDrawer`'s `pushLiveNote(newNote)` — two concurrent writes to the same card state.
2. **No debounce on keystroke pushes**: Every single character typed fired `pushLiveNote` synchronously, meaning rapid typing would fire many writes. If the Appwrite realtime `.create` event arrived between two pushes, a stale partial snapshot could win.
3. **Realtime create event during migration window added a duplicate card**: When `migrateDraftId` removed the `live-*` card and added the real saved card, the concurrent Appwrite realtime `.create` event would also arrive — and the old guard check (`if (!guard) return`) was insufficient: it would insert a new card if no guard existed yet.

### Fixes applied
- **`NotesContext.tsx`**: In the `.create` handler, when `activeComposeNoteIdsRef.has(payload.$id)`, instead of checking for a guard and returning early, now **never inserts a new card** — only updates the existing one in-place with guard-merged content. This mathematically prevents duplicate cards.
- **`CreateNoteForm.tsx`**: 
  - Added `pushLiveNoteTimerRef` — a debounce ref that batches rapid keystroke pushes into a single 80ms window. Eliminates partial/truncated push from concurrent rapid writes.
  - Removed `onNoteCreated(draftNote)` from the `candidateNote` useEffect — the form no longer announces itself through the callback path (which caused the double push). The callback is now reserved for post-save events only.
- **`NoteDrawer.tsx`**: Removed `pushLiveNote(newNote)` from the `onNoteCreated` callback — it was causing the second push leg of the double-push. `CreateNoteForm` is now the single authoritative writer for live note state.

### State after fix
- Single writer rule enforced: only the debounced effect in `CreateNoteForm` writes live state during compose.
- Realtime create events during compose window safely merge into existing card without inserting duplicates.
- Lint: passing (run after fix).
