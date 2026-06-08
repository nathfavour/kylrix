# Route Canonicalization Matrix

## Naming law

```
INTERNAL LIST ROUTE     → plural, app-scoped prefix (owner/collaborator workspace)
INTERNAL DETAIL ROUTE   → plural path + [id]  (authenticated app chrome)
PUBLIC ITEM ROUTE       → singular resource segment + [id]  (guest-readable, minimal chrome)
PROJECT-SCOPED PUBLIC   → /projects/[projectId]/[kind]/[entityId]  (hierarchy preserved)
```

**Why drop `s` only on public routes?**  
Plural paths signal "my collection inside Kylrix." Singular paths signal "one object on the web." Users sharing `kylrix.space/note/abc` intuit a single note; `kylrix.space/notes/abc` feels like a dashboard path that might 404 without login.

**Why deprecate `/note/notes`, `/flow/...` prefixes?**  
Historical app silos (`/note/`, `/flow/`, `/vault/`) added URL depth without semantic value. Canonical workspace paths shorten to `/notes`, `/goals`, `/forms`, etc. Middleware redirects preserve bookmarks.

---

## Master table

| Resource | Old internal list | **New internal list** | Old internal detail | **New internal detail** | **New public (guest)** | Project-scoped public |
|----------|-------------------|----------------------|---------------------|-------------------------|------------------------|----------------------|
| Note | `/note/notes` | `/notes` | `/note/(app)/notes/[id]` | `/notes/[id]` | `/note/[id]` | `/projects/[pid]/note/[id]` |
| Note (legacy shared) | `/note/shared` | `/notes/shared` or merge into filter tab | `/note/shared/[noteid]` | — | `/note/[id]` (301 from old) | — |
| Tag | `/note/tags` | `/notes/tags` | — | — | N/A (no guest single-tag URL) | — |
| Goal/Task | `/flow/goals`, `/flow/tasks` | `/goals` | — | `/goals/[id]` | `/goal/[id]` | `/projects/[pid]/goal/[id]` |
| Form | `/flow/forms` | `/forms` | `/flow/forms/[formId]` | `/forms/[id]` | `/form/[id]` | `/projects/[pid]/form/[id]` |
| Event | `/flow/events` | `/events` | `/flow/events/[eventId]` | `/events/[id]` | `/event/[id]` | `/projects/[pid]/event/[id]` |
| Calendar | `/flow/calendar` | `/calendar` | — | — | TBD | — |
| Vault credential | `/vault/dashboard` | `/vault` or keep `/vault/dashboard` | — | `/vault/[id]` (new) | `/vault/[id]` | `/projects/[pid]/secret/[id]` |
| TOTP | `/vault/totp` | `/vault/totp` | — | `/vault/totp/[id]` | `/totp/[id]` TBD | `/projects/[pid]/totp/[id]` |
| Project | `/projects` | `/projects` (unchanged) | `/projects/[id]` | `/projects/[id]` | `/project/[id]` | — |
| Huddle/Call | `/connect/calls` | `/connect/huddles` | `/connect/call/[id]`? | `/connect/huddles/[id]` | `/connect/huddle/[id]` | — |
| Chat | `/connect/chats` | `/connect/chats` | `/connect/chat/[id]` | `/connect/chats/[id]` | N/A (invite links separate) | — |
| Send (ephemeral) | `/send` | `/send` | `/send/[noteId]` | `/send/[noteId]` | `/send/[noteId]` | **Out of scope** |

---

## Redirect policy

| From | To | Code | Why |
|------|-----|------|-----|
| `/note/notes` | `/notes` | 308 | Permanent canonical list |
| `/note/notes/[id]` | `/notes/[id]` | 308 | Internal detail |
| `/note/shared/[noteid]` | `/note/[noteid]` | 301 | Public singular |
| `/flow/goals` | `/goals` | 308 | Drop flow prefix |
| `/flow/tasks` | `/goals` | 308 | Tasks merged UX into goals |
| `/flow/forms` | `/forms` | 308 | |
| `/flow/forms/[id]` | `/forms/[id]` | 308 | |
| `/flow/events` | `/events` | 308 | |
| `/flow/events/[id]` | `/events/[id]` | 308 | |
| `/connect/calls` | `/connect/huddles` | 308 | Terminology: huddle |
| `/connect/call/[id]` | `/connect/huddles/[id]` | 308 | Internal detail |
| `/projects/[id]` (guest, no auth) | `/project/[id]` | 302 | Only when serving public guest view — **careful:** internal collabs keep `/projects/[id]` |

**Implementation home:** `middleware.ts` + Next.js `redirect()` in old `page.tsx` stubs.

---

## Public route pages (to create)

Each needs a **minimal guest shell** (no GlobalShell sidebar, no vault unlock):

| Route | Page path (planned) | Data source |
|-------|---------------------|-------------|
| `/note/[id]` | `app/note/[id]/page.tsx` | `getSharedNoteSecure` or general `getResourceSecure` |
| `/goal/[id]` | `app/goal/[id]/page.tsx` | `secure-ops` task read guest path |
| `/form/[id]` | `app/form/[id]/page.tsx` | existing public form renderer if any |
| `/event/[id]` | `app/event/[id]/page.tsx` | new guest event view |
| `/project/[id]` | extend `app/(app)/project/[projectId]/page.tsx` or new `app/project/[id]/page.tsx` | guest project preview |
| `/vault/[id]` | `app/vault/[id]/page.tsx` | **high risk** — likely metadata-only guest view |
| `/connect/huddle/[id]` | `app/connect/huddle/[id]/page.tsx` | join flow |

---

## Internal route pages (to move)

| Current file | Target |
|--------------|--------|
| `app/(app)/note/(app)/notes/page.tsx` | `app/(app)/notes/page.tsx` |
| `app/(app)/note/(app)/notes/[id]/page.tsx` | `app/(app)/notes/[id]/page.tsx` |
| `app/(app)/flow/(dashboard)/goals/page.tsx` | `app/(app)/goals/page.tsx` |
| `app/(app)/flow/(dashboard)/forms/page.tsx` | `app/(app)/forms/page.tsx` |
| `app/(app)/connect/calls/page.tsx` | `app/(app)/connect/huddles/page.tsx` |

Keep old paths as thin re-export/redirect stubs until Phase 7 cleanup.

---

## URL generator migration checklist

Every callsite that builds URLs must switch to `buildPublicResourceUrl()` / `buildInternalResourceUrl()`:

- [ ] `lib/appwrite/note.ts` — `getShareableUrl`
- [ ] `components/overlays/ShareNoteDrawer.tsx`
- [ ] `lib/send/shared-note-api.ts`
- [ ] `lib/ecosystem/resume-route.ts`
- [ ] `components/UnifiedBottomBar.tsx`
- [ ] `components/layout/ConnectTopbar.tsx`
- [ ] `context/SectionContext.tsx` — `DEFAULT_LAYOUTS` keys
- [ ] `middleware.ts`
- [ ] `app/layout.tsx` — root redirect script
- [ ] `app/(app)/layout.tsx` — public path allowlist
- [ ] `components/providers/EcosystemStateTracker.tsx`
- [ ] Email / Telegram CTAs (`system.domain-canonicalization` skill)
- [ ] `lib/services/chat.ts` — invite links if applicable

---

## `entityKind` → URL kind mapping (project sub-paths)

| `project_objects.entityKind` | Public sub-path segment |
|------------------------------|-------------------------|
| `note` | `note` |
| `goal` | `goal` |
| `password` / `credential` | `secret` |
| `totp` | `totp` |
| `form` | `form` |
| `event` | `event` |
| `tag` | `tag` |
| `call` / `huddle` | `huddle` |
| `project` (sub-project) | `project` |

**Why `secret` not `password`?** Layman-friendly public URL per AGENTS.md terminology mandate in UI copy; path segment matches vault UX word "Secret."
