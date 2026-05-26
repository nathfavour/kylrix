---
name: note.decoupled-sdk
description: Deep dive into the platform-agnostic Notes SDK structure. Explains the injection pattern, isolation of database queries, and modular mock compatibility.
---

# Why: Decoupled Platform-Agnostic Notes SDK

In keeping with the **Tablecloth Principle** and the **Hexagonal Backend Architecture**, the core business rules of Kylrix must remain decoupled from specific database engines or SaaS platforms. We should be able to run this system against SQL, SQLite, Supabase, or Appwrite without changing SDK code.

The decoupled architecture of the Note SDK is implemented in `lib/sdk/notes/index.ts`.

## 1. Zero Direct Database/Appwrite Dependencies

Instead of importing `databases` or client packages directly inside the SDK file, `lib/sdk/notes/index.ts` operates on pure interface declarations (`NoteCreationContext`):

```typescript
export interface NoteCreationContext<NoteRow = any> {
  databaseId: string;
  tableId: string;
  getCurrentUser: () => Promise<{ $id: string } | null>;
  createRow: <T = unknown>(databaseId: string, tableId: string, data: T, rowId?: string, permissions?: string[]) => Promise<NoteRow>;
  getNote: (noteId: string) => Promise<NoteRow>;
  getNotePermissions: (userId: string, isPublic: boolean) => string[];
  cleanDocumentData: <T>(data: Partial<T>) => Record<string, unknown>;
  filterNoteData: (data: Record<string, unknown>) => Record<string, unknown>;
  syncTags?: (params: { noteId: string; rawTags: string[]; userId: string; now: string }) => Promise<void>;
  generateId?: () => string;
}
```

The service is fully instantiated through dependency injection (`createNoteCreationService`):

```typescript
export function createNoteCreationService<NoteRow = any>(deps: NoteCreationContext<NoteRow>) {
  return {
    async createNote(data: NoteCreationInput) {
      const user = await deps.getCurrentUser();
      if (!user?.$id) throw new Error('User not authenticated');
      // Business logic, data filtering, tag syncing...
      await deps.createRow(deps.databaseId, deps.tableId, payload, docId, permissions);
      return await deps.getNote(docId);
    }
  };
}
```

## 2. Benefits for Portability and Polyglots

This decoupled pattern has powerful architectural benefits:
- **Portability**: The same SDK code can run seamlessly inside a Next.js server action, a CLI client, a local offline-first SQLite sync script, or a React Native bundle.
- **Testability**: Writing mock unit tests becomes trivial. We can pass completely local in-memory arrays as mock storage database layers without having to mock complex global Appwrite SDK instances.
- **Zero Lock-In**: It keeps our business logic separate from vendor integrations, keeping the platform clean and resilient.
