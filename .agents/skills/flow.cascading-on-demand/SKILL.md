---
name: flow.cascading-on-demand
description: The Cascading-on-Demand (CoD) CRUD optimization pattern for extremely snappy rendering and highly efficient data/permission queries in the Kylrix ecosystem. Use when designing CRUD, access-control logic, or real-time application rendering.
---

# Cascading-on-Demand (CoD) CRUD Pattern

The **Cascading-on-Demand (CoD)** pattern is a high-performance, tiered evaluation strategy designed to keep the Kylrix ecosystem as snappy as a static HTML page while supporting complex security and collaboration matrices.

By organizing checks in a statistically and computationally prioritized cascade, we eliminate redundant database hits, avoid unnecessary network round-trips, and minimize CPU cycles.

---

## 🏗️ The Tiered Execution Cascade

Access and rendering requests must evaluate through five distinct layers of escalating complexity. Always exit the cascade at the earliest possible level.

```
       [ Request Received ]
               │
               ▼
   ┌───────────────────────┐
   │ 1. Guest Check (RAM)  │ ──► [DENIED] if isGuest = false & Unauthenticated
   └───────────────────────┘
               │
               ▼
   ┌───────────────────────┐
   │ 2. Public Check (RAM) │ ──► [GRANTED] if isPublic = true & Action = read
   └───────────────────────┘
               │
               ▼
   ┌───────────────────────┐
   │ 3. Owner Check (RAM)  │ ──► [GRANTED] if actorId = userId/ownerId (Full Control)
   └───────────────────────┘
               │
               ▼
   ┌───────────────────────┐
   │ 4. Parent / Project   │ ──► [GRANTED] if inherited from general project context
   └───────────────────────┘
               │
               ▼
   ┌───────────────────────┐
   │ 5. Collaborators (DB) │ ──► [RESOLVE] Query Collaborators table (Asynchronous / Lazy)
   └───────────────────────┘
```

---

## ⏱️ Why Ownership (userId) Must Be Checked Before Collaborators

**Rule**: Always compare `userId`/`ownerId` *before* querying any secondary collaboration tables.

### The Computational / Network trade-off:
- **Ownership Check (Synchronous RAM)**: Comparing `row.ownerId === actorId` is an in-memory, CPU-only operation. It executes in **~0 milliseconds (instant)** because the primary resource row is already loaded.
- **Collaborator Check (Asynchronous DB Query)**: Querying the `Collaborators` table or parsing complex permissions requires an asynchronous database query or network round-trip. This takes **2ms to 200ms**.

### Statistical Efficiency:
- Even if there are statistically more collaborators than owners trying to edit, performing a 0ms in-memory check first is **computationally free** for non-owners, but saves a full database query for every owner action. 
- Swapping the order would force the system to perform a slow database query for *everyone*, including the resource owner.

---

## 💻 Code Reference Implementation

### Permissions Verification (`verifyResourcePermissionSecure`)

```typescript
export async function verifyResourcePermissionSecure(params: {
  row: any;
  actorId: string | null;
  action: 'read' | 'update' | 'delete';
}) {
  const { row, actorId, action } = params;

  // --- TIER 1: GUEST GATE (RAM) ---
  // If the resource does NOT support guest access and there is no active session,
  // we block immediately without wasting database or CPU resources.
  const isGuestAllowed = row.isGuest === true;
  if (!isGuestAllowed && !actorId) {
    return false;
  }

  // --- TIER 2: PUBLIC ACCESS GATE (RAM) ---
  // If public access is enabled and this is a read request, instantly authorize.
  const isPublic = row.isPublic === true;
  if (isPublic && action === 'read') {
    return true;
  }

  // --- TIER 3: IN-MEMORY OWNERSHIP GATE (RAM) ---
  // If the visitor is the verified owner, instantly grant full access.
  // This synchronous RAM check must ALWAYS happen before any asynchronous DB queries.
  const isOwner = actorId && (row.ownerId === actorId || row.userId === actorId);
  if (isOwner) {
    return true;
  }

  // --- TIER 4: PROJECT / PARENT INHERITANCE (LAZY) ---
  // Check if resource inherits access from its parent container (e.g. linked project or note comments).
  if (row.projectId) {
    const hasProjectAccess = await checkParentProjectPermission(row.projectId, actorId, action);
    if (hasProjectAccess) return true;
  }

  // --- TIER 5: DISCRETE ACCESS / COLLABORATORS (DATABASE QUERY) ---
  // Only execute slow asynchronous DB queries if all cheaper options are exhausted.
  if (actorId && row.$id) {
    const matchedRole = await queryCollaboratorRoleFromDatabase(row.$id, actorId);
    if (matchedRole) {
      if (action === 'read') return ['viewer', 'editor', 'admin'].includes(matchedRole);
      if (action === 'update') return ['editor', 'admin'].includes(matchedRole);
      if (action === 'delete') return matchedRole === 'admin';
    }
  }

  return false;
}
```

---

## ⚡ Application to Frontend Rendering & Loading

The same CoD principle must be applied to UI rendering to eliminate layout shifts and keep transitions lightning fast:

1. **Instant Shell (Tier 1)**: Instantly render the parent container or page shell with static/cached structures.
2. **Local Memory Hydration (Tier 2)**: Populate widgets instantly using cached variables (`localStorage`, `sessionStorage`, or custom context memory) before hitting any APIs.
3. **On-Demand Hydration (Tier 3)**: Lazy load or dynamically import heavier overlays, complex tabs, and interactive sidebars *only* when requested (e.g., hover, click).
