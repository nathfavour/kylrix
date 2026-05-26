---
name: why.projects-ecosystem-flagship
description: Explain why Projects are the flagship synergy feature that locks users in through merit and actual utility rather than paywalls.
---

# Why: Projects as the Flagship Ecosystem Synergy Engine

Many collaborative tools treat notes, chat messages, task boards, and credentials as separate, isolated silos. Users have to jump between different apps or menus to coordinate their work, destroying productivity.

Kylrix solves this through **Projects**, the flagship feature of our ecosystem (implemented in `lib/services/workflows.ts` and `lib/actions/workflows.ts`).

---

## 1. Synergizing the Workspace

Projects act as a unified mapping layer that binds all other resources (Notes, Passwords, Forms, Tasks, Calls) into a cohesive context. Instead of forcing users to stay using artificial lock-ins or paywalls, we build **retention through utility**.

When a user opens a Project, every related asset is instantly accessible within the same project workspace:

```typescript
// Fetching project resources in workflows.ts
export async function getProjectContext(projectId: string, jwt: string) {
  const actor = await getActor(jwt);
  const database = Registry.getDatabase();
  
  // 1. Fetch the project record
  const project = await database.getRow(FLOW_DB, PROJECTS_TABLE, projectId);
  
  // 2. Fetch all linked resource mappings
  const resources = await database.listRows(FLOW_DB, PROJECT_RESOURCES_TABLE, [
    Query.equal('projectId', projectId)
  ]);
  
  return {
    project,
    resources: resources.rows // Contains pointers to related Notes, Tasks, and Vault Keys
  };
}
```

---

## 2. Open Merit vs. Paywall Lock-ins

We believe that core features should never be locked behind gimmicky paywalls. If a feature is limited (like file storage capacity or collaborator limits), it is because it carries actual, disproportionate backend resource costs. 

Projects, task boards, and collaborative note editors are fully open and free because they represent pure engineering utility rather than infrastructure costs.

---

## 3. Contextual Focus

By organizing all assets into Projects, users can manage their focus and workflows seamlessly. Projects serve as the primary glue that holds the Kylrix ecosystem together, providing a unified workspace where teams and individuals can get work done.
