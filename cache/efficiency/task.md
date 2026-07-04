# Kylrix Codebase Optimization & De-bloating Plan 🧹

This document tracks progress, discoveries, and tasks for aggressively cutting down bloat, duplicates, and zombie pages in the Kylrix ecosystem.

## 🎯 Target Goals
1. **Deduplicate Settings Screens**: Consolidate settings pages from `/app/(app)/settings`, `/app/(app)/accounts/settings/*`, etc., into a unified, tabbed settings view at `/settings`.
2. **Remove Zombie Routes**: Identify and delete routes that have been absorbed by drawers or modals (especially around vault reset, setup, billing, profile editing, and legacy auth).
3. **Clean Up Vault Import/Export**: Eliminate duplicate vault import/export implementations competing with the main data-porter workflow.
4. **Remove Unused Dependencies**: Strip unused NPM packages from `package.json` (e.g., Upstash, Redis, etc.) and prune their associated files.
5. **Deduplicate SDK & Component Code**: Consolidate duplicated logic between core folders and helper classes.

## 📋 Task List

### Phase 1: Planning & Discovery
- [ ] Map out all existing settings subroutes and their features.
- [ ] Map out all vault import/export routes and components.
- [ ] Scan `package.json` for unused packages (Upstash, etc.) and locate references to delete.

### Phase 2: Upstash & Dependency Cleanup
- [ ] Remove Upstash package references from `package.json`.
- [ ] Delete `lib/upstash/` or similar files.
- [ ] Prune any Redis/Upstash connection configurations.

### Phase 3: Vault Import & Export Consolidation
- [ ] Locate and compare old import/export implementations against data-porter.
- [ ] Delete legacy or duplicate vault import/export views.

### Phase 4: Settings Consolidation
- [ ] Consolidate `/app/(app)/settings` and `/app/(app)/accounts/settings/*` views.
- [ ] Move billing settings into a bottom drawer context.
- [ ] Ensure Connected Services (Google, GitHub), Account Activity logs, and Admin settings are fully functional in the consolidated view.

### Phase 5: Build & Lint Checks
- [ ] Run `pnpm lint` to ensure no imports are broken.
- [ ] Run `pnpm build` to verify production builds compile cleanly.
