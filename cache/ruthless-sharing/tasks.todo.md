# Implementation Tasks — Ruthless Sharing

**Track religiously.** Update status inline as work proceeds.  
**Do not start** until explicit user go-ahead after cache review.

Status: `[ ]` todo · `[~]` in progress · `[x]` done · `[—]` deferred · `[!]` blocked

---

## Phase 0 — Planning & sign-off

- [x] Create `cache/ruthless-sharing/` program directory
- [x] Document architecture, routes, resource matrix
- [ ] Product sign-off on OD-1..OD-6 in `architecture.md` §10
- [ ] User explicit "implement" instruction

---

## Phase 1 — Canonical URL layer (no UI)

**Why first:** Every later phase copies links; one builder prevents drift.

- [ ] **1.1** Create `lib/share/public-url.ts`
  - `buildPublicResourceUrl(type, id, opts?)`
  - `buildInternalListUrl(type)`
  - `buildInternalDetailUrl(type, id)`
  - `buildProjectScopedPublicUrl(projectId, kind, entityId)`
  - Unit tests or inline dev assertions for all resource kinds in `resource-matrix.md`
- [ ] **1.2** Create `lib/share/resource-types.ts` — union type `PublicResourceType`
- [ ] **1.3** Add `www.kylrix.space` base enforcement (reuse `system.domain-canonicalization` helpers)
- [ ] **1.4** Mark legacy generators `@deprecated` in `getShareableUrl`, `ShareNoteDrawer` link builder

---

## Phase 2 — Server: unified public/guest toggle

**Why before UI:** Lock button must not call per-resource ad-hoc toggles.

- [ ] **2.1** `toggleResourcePublicGuestSecure` in `secure-ops.ts`
  - Modes: `publish`, `copy_only`, `make_private`, `guest_off`, `guest_on`
  - Owner verification per resource type
- [ ] **2.2** `getResourcePublicGuestSecure` — read flags for card state hydration
- [ ] **2.3** Note adapter: wrap/replace `toggleNoteVisibility` to set **both** flags; decide OD-2 `Role.any()` removal
- [ ] **2.4** Task/goal adapter — flow DB `tasks` table
- [ ] **2.5** Form adapter — sync `status` + flags
- [ ] **2.6** Event adapter
- [ ] **2.7** Credential adapter — implement OD-6 policy (block or metadata-only)
- [ ] **2.8** TOTP adapter — return blocked for `publish`
- [ ] **2.9** Project adapter — sync `visibility` enum
- [ ] **2.10** Huddle/call adapter — define row + flags
- [ ] **2.11** Client wrapper `lib/actions/client-ops.ts` → `toggleResourcePublicGuest()`
- [ ] **2.12** DataNexus invalidation map per resource after toggle

---

## Phase 3 — Shared UI components

- [ ] **3.1** `components/share/ShareLockButton.tsx`
  - Props per `architecture.md` §5
  - States: private lock, public link, loading, disabled + tooltip
  - Clipboard + toast on success
- [ ] **3.2** `components/share/AccessControlMenuItems.tsx`
  - Returns context menu nodes; only when `isPublic || isGuest`
  - Confirm dialog for make private
- [ ] **3.3** `hooks/useLongPressContextMenu.ts`
  - 500ms long-press → `openMenu` (mobile)
  - Reuse existing `ContextMenuContext`
- [ ] **3.4** `components/share/ShareLockButton.stories` or dev fixture page (optional)

---

## Phase 4 — Card chrome rollout (remove three-dot)

**Order:** Notes → Goals → Forms → Vault → Projects → Events → Connect

### 4A — Notes

- [ ] Remove `MoreHorizIcon` button from `components/NoteCard.tsx`
- [ ] Remove duplicate from `components/ui/NoteCard.tsx`
- [ ] Add `ShareLockButton` + keep `Pin`
- [ ] Wire `onContextMenu` + long-press to existing menu (includes Access Control when public)
- [ ] Remove redundant inline "Copy Share Link" when public (link icon is ShareLockButton)

### 4B — Goals / Tasks

- [ ] Remove `MoreVertical` from `components/tasks/TaskItem.tsx` visible chrome
- [ ] Add ShareLockButton (accent `#A855F7`)
- [ ] Context menu: add Access Control subtree; keep Synergy/Project/Tags/Workflow
- [ ] `TaskDetails.tsx` header: optional lock/link duplicate for detail view

### 4C — Forms

- [ ] `forms/page.tsx` card actions: remove overflow menu trigger from card surface
- [ ] Add Pin + ShareLockButton per form row
- [ ] Context menu on right-click row

### 4D — Vault credentials

- [ ] `CredentialItem.tsx`: remove overflow from inline chrome if present
- [ ] Add ShareLockButton (disabled until OD-6 resolved)
- [ ] Pin stays

### 4E — Projects

- [ ] `LocalProjectCard` in `projects/page.tsx`: Pin + ShareLockButton
- [ ] `ProjectCard.tsx`: same
- [ ] Remove inline delete? **No** — delete stays; only remove three-dot if redundant with context menu

### 4F — Events

- [ ] `EventCard.tsx`: Pin (if added) + ShareLockButton
- [ ] Context menu migration

### 4G — Connect / Huddles

- [ ] Chat list items: evaluate lock for invite link (may differ from resource cards)
- [ ] Huddle history cards if applicable

---

## Phase 5 — Access Control UI (public-only)

- [ ] **5.1** Bottom drawer `AccessControlDrawer.tsx` (or extend existing)
  - Shows: guest toggle, make private, manage collaborators link
- [ ] **5.2** Wire drawer from context menu only (not card)
- [ ] **5.3** Demote `ShareNoteDrawer` to collaborator management entry point only
- [ ] **5.4** Update `UnifiedDrawerContext` type if new drawer id `access-control`

---

## Phase 6 — Public guest pages (singular routes)

- [ ] **6.1** `app/note/[id]/page.tsx` — guest read shell
- [ ] **6.2** `app/goal/[id]/page.tsx`
- [ ] **6.3** `app/form/[id]/page.tsx`
- [ ] **6.4** `app/event/[id]/page.tsx`
- [ ] **6.5** `app/project/[id]/page.tsx` — guest project preview (may exist partially)
- [ ] **6.6** `app/vault/[id]/page.tsx` — metadata-only if OD-6 allows
- [ ] **6.7** `app/connect/huddle/[id]/page.tsx`
- [ ] **6.8** `app/projects/[pid]/[kind]/[entityId]/page.tsx` — project-scoped public resolver

---

## Phase 7 — Internal route moves + redirects

See `migration.todo.md` for full redirect list.

- [ ] **7.1** Middleware redirects (308/301)
- [ ] **7.2** Move note pages to `/notes`
- [ ] **7.3** Move flow dashboard pages to flat routes
- [ ] **7.4** Rename `/connect/calls` → `/connect/huddles`
- [ ] **7.5** Update `UnifiedBottomBar` route map
- [ ] **7.6** Update `SectionContext` DEFAULT_LAYOUTS keys
- [ ] **7.7** Update `EcosystemStateTracker` + `resume-route.ts` allowlists
- [ ] **7.8** Update `app/(app)/layout.tsx` public route prefixes
- [ ] **7.9** Update root `app/layout.tsx` redirect script
- [ ] **7.10** Search codebase for hardcoded `/note/notes`, `/flow/`, `/connect/calls` — grep sweep

---

## Phase 8 — Cleanup & QA

- [ ] **8.1** QA matrix: private link → 403/redirect to login (when guest off, public on)
- [ ] **8.2** QA: guest link → loads without account (guest on)
- [ ] **8.3** QA: collaborator write still works when private
- [ ] **8.4** QA: make private → guest link 404/forbidden
- [ ] **8.5** QA: lock double-tap debounce
- [ ] **8.6** QA: long-press menu on mobile Safari + Android Chrome
- [ ] **8.7** Remove dead share UI paths
- [ ] **8.8** Update `.agents/skills` if public URL patterns change

---

## Cross-cutting concerns (apply during phases)

- [ ] **X.1** Layman copy audit — no "ACL", "RLS", "E2EE" in lock/toast strings
- [ ] **X.2** Terminology: Table/Row not collection/document in new code comments
- [ ] **X.3** No new `app/api/*` routes — Server Actions only
- [ ] **X.4** Global unmount: drawers use `keepMounted: false`
- [ ] **X.5** Telegram/email share links use new canonical URLs

---

## Progress summary

| Phase | Total | Done | % |
|-------|-------|------|---|
| 0 | 4 | 2 | 50% |
| 1 | 4 | 0 | 0% |
| 2 | 12 | 0 | 0% |
| 3 | 4 | 0 | 0% |
| 4 | 7 groups | 0 | 0% |
| 5 | 4 | 0 | 0% |
| 6 | 8 | 0 | 0% |
| 7 | 10 | 0 | 0% |
| 8 | 8 | 0 | 0% |

*Update counts when checking boxes.*
