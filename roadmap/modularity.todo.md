# Kylrix Absolute Modularity Roadmap 🧱

This roadmap outlines the milestones, design rules, and refactoring checklist required to transition Kylrix into a hyper-modular system. 

Our core philosophy dictates that **in the backend, everything is an Object; in the frontend, everything is a Module; and everything in between is an Adapter.** 

By establishing pristine, isolated boundaries, the entire application achieves maximum loading speeds, optimal performance, and clean maintainability. Most importantly, this refactoring enforces the **Tablecloth Principle**—spinning up new features becomes as simple as importing modules, with zero risk of breaking active users in production.

---

## ⬡ 1. Backend Modularity: "Everything is an Object"

In the backend, all database integrations, business rules, and services must be encapsulated inside self-contained objects, leaving zero loose global functions or unmapped configurations.

- [ ] **Establish Domain Feature Isolation**:
  - Restructure backend features into discrete domain objects:
    - `NoteDomain`: Manages note actions and collaborative table mapping.
    - `VaultDomain`: Coordinates cryptographic operations and credential rows.
    - `FlowDomain`: Governs tasks, calendars, and form tables.
    - `ConnectDomain`: Governs messaging histories and call channels.
  - Every domain feature exposes a pristine **Service Object** (e.g. `NoteService`, `VaultService`) acting as the single entry-point for that sub-system.
- [ ] **Standardize Port Interface Operations**:
  - Ensure that all business logic objects communicate with infrastructure purely through abstract port objects (e.g., `DatabasePort`, `StoragePort`) resolved via the `Registry`, keeping them completely swappable.
- [ ] **Strict Terminology Mapping in Objects**:
  - Enforce strict terminology in all backend service methods, variables, and logs: Use `getRow`, `listRows`, `createRow`, `updateRow`, and `deleteRow` across all modules.

---

## 🎨 2. Frontend Modularity: "Everything is a Module"

In the frontend, every visual element, button, drawer, and layout card operates as an atomic, self-contained module.

- [ ] **Atomic UI Component Library**:
  - Standardize all basic interactive elements (Buttons, Input textboxes, Dividers, Card wells) into an isolated library of atomic Openbricks modules.
  - Components must be styled solely using their internal design parameters, with zero reliance on global style overrides.
- [ ] **Autonomous Workspace Sub-Apps**:
  - Group visual features (Notes List, Task Workspace, Password Vault, Conversation Chat) into fully self-contained, independent visual sub-apps.
  - Sub-apps must manage their own internal contexts, caching, and state transitions, communicating with the shell strictly via declarative parameter interfaces.
- [ ] **Enforce Global Unmount Rule**:
  - Ensure every interactive overlay (such as sidebars, share managers, and prompt modals) unmounts physically from the DOM tree when inactive:
    ```tsx
    // Modular sub-app component composition
    {isWorkspaceActive && <NotesWorkspaceModule />}
    ```

---

## 🔌 3. Inter-Layer Adapters: "Everything in Between is an Adapter"

The glue between the modular frontend and backend objects must be strictly governed by primary and secondary Adapters, eliminating spaghetti dependencies.

- [ ] **Surgically Standardize Server Actions as Adapters**:
  - Refactor all Next.js Server Actions (`lib/actions/secure-ops.ts`, `cascade-delete.ts`, etc.) to serve strictly as primary input adapters.
  - These actions receive untrusted client parameters, execute verified actor assertions via the `AuthPort`, and forward clean, validated parameters down to the domain Use Case objects.
- [ ] **Abstract Real-Time Subscriptions**:
  - Group all WebSocket real-time triggers and table row updates behind a unified event-adapter layer. This isolates components from direct dependency on Appwrite's real-time client.
- [ ] **Pluggable Seed & Migration Adapters**:
  - Structure all database migration scripts and data import/export utilities as offline adapters, keeping production schemas completely unaffected.

---

## 🚀 4. Rapid Feature Provisioning (The Plug-and-Play Objective)

- [ ] **Create a "New Feature Template" Blueprint**:
  - Provide a standardized workspace template. To spin up a new mini-app within the suite, a developer simply imports predefined frontend modules and plugs their service object into the registry.
- [ ] **Ecosystem Core Separation Check**:
  - Audit import trees to ensure no cross-app imports (e.g. Chat directly importing Notes state) occur without flowing through the abstract registry adapters.
