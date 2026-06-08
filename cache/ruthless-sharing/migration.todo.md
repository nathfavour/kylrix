# Migration & Compatibility — Ruthless Sharing

Breaking URL and sharing behavior changes require deliberate migration. This file tracks **every** callsite class and rollback strategy.

---

## 1. Why migration is phased

| Risk | Mitigation |
|------|------------|
| External links break (email, Slack, Notion embeds) | 301/308 redirects for 12+ months |
| SEO indexed `/note/shared/x` | Permanent redirect to `/note/x` |
| User muscle memory `/note/notes` | Middleware + bottom bar update same release |
| Appwrite rows with `isPublic` but not `isGuest` | One-time backfill script (optional) |

**We do not** mass-update historical rows without audit — old public notes may intentionally be auth-only public.

---

## 2. Redirect implementation

**File:** `middleware.ts`

```typescript
// Pseudocode — implement in Phase 7
const REDIRECTS: Record<string, string | ((path) => string)> = {
  '/note/notes': '/notes',
  '/flow/goals': '/goals',
  '/connect/calls': '/connect/huddles',
  // dynamic: /note/shared/:id → /note/:id
};
```

- [ ] Add redirect map
- [ ] Log redirect hits via existing telemetry (1% sample) to measure legacy traffic
- [ ] Document in changelog for users

---

## 3. Link generator migration (exhaustive)

### 3.1 Core libraries

| File | Function / area | Old pattern | New pattern |
|------|-----------------|-------------|-------------|
| `lib/appwrite/note.ts` | `getShareableUrl` | `/note/shared/${id}` | `buildPublicResourceUrl('note', id)` |
| `lib/appwrite/note.ts` | `getCurrentPublicNoteShareUrl` | same | same |
| `components/overlays/ShareNoteDrawer.tsx` | `getShareUrl()` | `/note/shared/`, `/shared/${type}/` | builder |
| `lib/send/shared-note-api.ts` | public URLs | TBD | unchanged `/send/` |
| `lib/ecosystem/resume-route.ts` | allowlist | `/note/shared` | `/note/`, `/notes` |

### 3.2 Navigation chrome

| File | Area |
|------|------|
| `components/UnifiedBottomBar.tsx` | `note.notes`, `connect.calls` hrefs |
| `components/layout/ConnectTopbar.tsx` | quick actions hrefs |
| `components/ui/ContextMenuContext.tsx` | "Notes Vault" push target |
| `context/SectionContext.tsx` | `DEFAULT_LAYOUTS` route keys |
| `middleware.ts` | auth redirect target `/note/notes` → `/notes` |

### 3.3 Layout guards

| File | Area |
|------|------|
| `app/(app)/layout.tsx` | `isPublic` path prefixes |
| `app/layout.tsx` | root redirect `/connect/chats` logic |
| `components/providers/EcosystemStateTracker.tsx` | skip tracking on public paths |
| `components/GlobalShell.tsx` | `isSharedPage` detection |

### 3.4 Page-internal

| File | Area |
|------|------|
| `app/(app)/note/(app)/notes/page.tsx` | `history.replaceState` paths |
| `app/(app)/projects/page.tsx` | insights link `/note/notes` |
| `app/(app)/connect/chats/page.tsx` | huddle start href |
| `app/(app)/connect/page.tsx` | huddle href |
| `components/layout/DesktopRightSection.tsx` | panel deep links |

### 3.5 Greppable patterns (run before release)

```bash
rg "/note/notes" --glob "*.{ts,tsx}"
rg "/note/shared" --glob "*.{ts,tsx}"
rg "/flow/goals" --glob "*.{ts,tsx}"
rg "/flow/forms" --glob "*.{ts,tsx}"
rg "/flow/events" --glob "*.{ts,tsx}"
rg "/connect/calls" --glob "*.{ts,tsx}"
rg "getShareableUrl" --glob "*.{ts,tsx}"
rg "note/shared" --glob "*.{ts,tsx}"
```

- [ ] Record grep output baseline in this folder as `migration-baseline.txt` before Phase 7
- [ ] Re-run after Phase 7; zero unexpected hits

---

## 4. Data backfill (optional)

### 4.1 Notes with `isPublic: true` and `isGuest: false`

**Why backfill:** Ruthless lock always sets both; legacy public notes may require login today.

**Options:**

| Option | Action | User impact |
|--------|--------|-------------|
| A — Aggressive | Set `isGuest: true` on all `isPublic` notes | Old "auth-only public" links become guest-open |
| B — Conservative | Leave legacy; only new lock uses both | Two behaviors coexist |
| C — Prompt | Owner sees banner "Upgrade link to guest access" | Best UX, more work |

**Recommended:** Option B until analytics show volume.

- [ ] Decision recorded
- [ ] If A: one-shot `secure-ops` admin script with audit log

### 4.2 Projects `visibility: public` without `isGuest`

- [ ] Map `visibility === 'public'` → `isPublic: true, isGuest: true` on read in `getResourceSecure`
- [ ] Or one-time sync

---

## 5. Cache invalidation keys (DataNexus)

When `toggleResourcePublicGuestSecure` runs, invalidate:

| Resource | Cache keys |
|----------|------------|
| Note | `note_${id}`, `initial_notes_${userId}`, `pinned_ids_${userId}` |
| Task | `flow_warm_${userId}`, task list keys in TaskContext |
| Form | `f_user_forms_${userId}` |
| Project | `projects_user_${userId}`, `projects` list cache |
| Credential | vault dashboard cache keys |

- [ ] Document in `toggleResourcePublicGuestSecure` implementation
- [ ] Add integration test or manual checklist

---

## 6. Feature flags (optional safety valve)

If rollout is risky:

```typescript
// lib/flags.ts
RUTHLESS_SHARING_CARD_CHROME: false  // Phase 4
RUTHLESS_SHARING_ROUTES: false       // Phase 7
```

**Why optional:** User asked for ruthless ship; flags only if staging proves breakage.

- [ ] Decide: flags yes/no

---

## 7. Rollback plan

| Phase rolled back | Action |
|-------------------|--------|
| Phase 4 only | Revert ShareLockButton; restore three-dot menus |
| Phase 7 only | Keep new UI; revert middleware redirects |
| Phase 2 only | Disable lock calling new action; fall back old toggles |

Keep `getShareableUrl` deprecated wrapper pointing to old URL until Phase 7 verified in production 7 days.

---

## 8. Communications

- [ ] In-app toast on first lock: one-time education "Tap link to copy again. Right-click for access settings."
- [ ] No blog required for internal ship; optional `docs/` page for public link format

---

## 9. Testing checklist (copy to PR)

- [ ] Private note → lock → paste in incognito → content visible
- [ ] Public note → link click → clipboard only, still public
- [ ] Access Control → guest off → incognito fails with friendly page
- [ ] Access Control → make private → incognito fails
- [ ] Collaborator editor can still edit private resource
- [ ] `/note/shared/old-id` redirects to `/note/old-id`
- [ ] `/note/notes` redirects to `/notes`
- [ ] Bottom bar Notes tab lands on `/notes`
- [ ] Project public `/project/id` loads for guest
- [ ] TOTP lock disabled
- [ ] Encrypted note lock shows blocker (per OD-1)

---

## 10. Timeline suggestion (not committed)

| Week | Phase |
|------|-------|
| 1 | 1–2 (URL builder + server) |
| 2 | 3–4A (components + notes) |
| 3 | 4B–4G (remaining cards) |
| 4 | 5–6 (access control + guest pages) |
| 5 | 7–8 (routes + QA) |

Adjust when implementation starts.
