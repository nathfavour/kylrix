```markdown
# INSTRUCTION FOR AI AGENT: ARCHITECTURAL TRANSITION TO SERVER-SIDE ENFORCEMENT (ZERO-TRUST ENVELOPE)

## 1. CONTEXT & THE SECURITY HOLE YOU MUST PLUG
The platform currently utilizes an Appwrite backend configuration where `localhost` is permanently left as an allowed origin. This is a deliberate, non-negotiable architectural choice to ensure frictionless open-source contributions (`pnpm build && pnpm dev`) and ultra-fast deployment velocities (fixing bugs and pushing to production in under 5 minutes). 

However, this creates a major security surface: a malicious actor can fork the repository, run an alternative client on `localhost`, and leverage the client SDK to bypass frontend restrictions, tamper with database writes, or execute unauthorized operations. This loop-hole is the explicit reason why public notes must be encrypted when toggled public. 

Your objective is to design a zero-trust architecture that completely closes this vector by revoking client-side direct access in favor of server-side SDK execution, without breaking local development or current user data.

---

## 2. THE CORE BUSINESS LOGIC RUNTIME CONTROLS
When auditing and refactoring the code, you must strictly adhere to the following binary rule of thumb:

1. **Database Layer:** Boundless and un-throttled. There are no caps, no row counts, and no numerical throttling logic. It is either completely unlimited or entirely blocked.
2. **Storage Layer:** Absolute zero-access from the client SDK. Direct client bucket creation rights must be treated as a vulnerability. The *only* allowed storage interactions for free users are:
   *   **Profile Picture Uploads:** Must be forced to pass through client-side downscaling and aggressive compression (< 1MB hard threshold).
   *   **Voice Notes:** Must enforce a strict client-side recording limitation of **120 seconds (2 minutes)** with hyper-aggressive encoding compression (e.g., Opus at low bitrates).
3. **The Enforcement:** For ALL storage buckets, write permissions must pass through server-side SDK actions utilizing a privileged API key known only to the deployment server. You are explicitly directed to identify the maximum possible write permissions (`Create`, `Update`, `Delete`) that can be yanked from the client SDK—even within the database tables—and routed through backend endpoints.

---

## 3. YOUR EXPLICIT EXECUTABLE TASKS
You must execute a full static analysis of the workspace data structures, API layer, and existing Appwrite service integrations to implement this delicate migration safely. You are required to generate exactly three artifact files within the workspace.

### Task 1: Generate `server.md`
Create a clean, human-readable markdown report in the root directory named `server.md`. This document must be easily digestible for a human administrator and must contain:
1.  **A Complete Data Structure Analysis:** Traverse the codebase to map out every single data model, collection, and storage bucket.
2.  **Permission Revocation Matrix:** A detailed layout listing the absolute maximum number of actions we can strip from the client SDK (including `Create`, `Update`, and `Delete` permissions for creators) and move behind server-side SDK actions without causing structural breaking changes.
3.  **Appwrite Console Instruction Manual:** Provide explicit, discrete, one-by-one click instructions for the human developer to toggle the necessary permission settings inside the Appwrite Web Console interface safely.
4.  **Data Integrity Impact Report:** Document exactly how moving these permissions to the server affects existing documents, ensuring no user data is corrupted or lost during the transition.
5.  **UX Enhancement Opportunities:** Highlight how removing client SDK dependencies simplifies frontend confirmation flows—specifically pointing out how public elements (like note comments) can bypass complex local cryptographic checks, leaving heavy encryption mechanisms (like master passwords) focused exclusively on data that strictly requires isolation (e.g., private vault records or chat contents).

### Task 2: Create the `cache/server-move/` Directory & Workflow Trackers
You must initialize a directory at `cache/server-move/` and output two specific files detailing your implementation path:

1.  `cache/server-move/task.md`: A comprehensive technical specification describing the exact engineering strategy you will use to shift file handling and database verification over to Server SDK Actions. Detail the streaming mechanisms, payload length verifications, and cryptographic isolation policies.
2.  `cache/server-move/todo.md`: A highly structured, atomic, checkbox-driven checklist of the exact steps required to complete this migration. Break this down into sequential phases: code refactoring, local validation, security boundary stress-testing, and database state verification to guarantee zero data loss.

Begin your codebase traversal now, locate all direct instances of client SDK mutations, and compile the requested files.

```
