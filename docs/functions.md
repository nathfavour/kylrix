# Appwrite Serverless Functions ⚙️

Kylrix delegates intensive background execution, garbage collection, and cross-table orchestration to 16 serverless helper functions.

---

## 1. Catalog of Active Serverless Functions

These serverless functions are deployed in our Appwrite instance and run asynchronously based on event triggers or cron schedules:

| Function ID | Trigger Event | Primary Responsibility |
|---|---|---|
| **`ghost-cleanup`** | Daily Cron Job | Purges expired Ghost Notes (7-day lifecycle), deleting files, comments, reactions, and attachments. |
| **`sync-user-profile`** | User Account Creation | Initializes user rows in DB tables, configures default configurations, and dispatches welcome emails. |
| **`data-porter`** | Server Action Invocation | Handles JSON backup generation, PBKDF2/AES-GCM exports, and Bitwarden migrations. |
| **`agent-action-guardrail`**| Agent Execution Hook | Intercepts autonomous agent operations to protect sensitive tables and verify credentials. |
| **`permission-updater`** | Sharing Event | Propagates read/write permission sets across collaborators when resources are shared. |
| **`account-cleanup`** | User Deletion | Automatically scrubs user files and database entries on account termination. |

---

## 2. Key Serverless Task Implementations

### Ghost Notes Lifecycle
The `ghost-cleanup` function ensures that ephemeral shared content is purged from database storage without leaving orphan files.

```typescript
// Conceptual execution step inside ghost-cleanup handler
async function purgeGhostNote(noteId: string) {
  await db.deleteRow(DATABASE_ID, NOTES_TABLE, noteId);
  await storage.deleteFile(BUCKET_ID, noteId);
}
```

> ### WHY this is done this way:
> 
> *   **Prevent Cold-Start Latency**: Performing batch purges or file cleanup directly in Web client requests slows down responses. Moving these tasks to serverless background queues keeps the application responsive.
> *   **Decoupled Permissions**: Operations like user profile setup need to access multiple databases and tables. Running these through serverless functions prevents us from exposing high-privilege keys to the client.
> *   **Orphan Cleanups**: When a note is deleted, related comments, reactions, and files must be cleaned up to prevent database bloat. The serverless cleanup functions handle this cascading deletion reliably.
