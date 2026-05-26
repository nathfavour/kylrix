---
name: why.crosslinks-tagging
description: Deep dive into the tag-prefix relational mapping pattern in Kylrix. Explains how crosslink tags (e.g. `source:kylrixnote:id`) represent relationships without complex database join-tables.
---

# Why: Crosslinks Tagging & Lightweight Relational Mapping

In standard database systems, connecting one record to another (e.g., attaching a Note to a Chat Message, or linking two related Notes) usually requires a dedicated join-table or complex index constraints. While robust, join-tables introduce additional query latency, schema maintenance, and network round-trips.

Kylrix solves this through the **Crosslinks Tagging pattern** in `lib/sdk/crosslinks/index.ts`.

## 1. Relational Tag Prefixes

We represent structural relationships by embedding prefixed strings directly in a single `tags` array column. This removes the need for joining tables:
- **`source:kylrixnote:<id>`**: Specifies that this resource is linked back to a parent Note source.
- **`note:<id>`**: Specifies that this resource belongs to or references a vault Note.

```typescript
export const NOTE_SOURCE_TAG_PREFIX = 'source:kylrixnote';
export const VAULT_NOTE_TAG_PREFIX = 'note';

export function buildSourceNoteTags(noteIds: Array<string | null | undefined>) {
  return uniqueStrings(noteIds).map((noteId) => `${NOTE_SOURCE_TAG_PREFIX}:${normalizeNoteId(noteId)}`);
}
```

## 2. Fast Parsing and Extraction

Parsing these relationships is extremely fast and can be done on the client without database lookups:

```typescript
export function extractLinkedNoteIdsFromTags(tags: Array<string | null | undefined> = []) {
  const ids = new Set<string>();
  for (const tag of tags) {
    const value = String(tag || '').trim();
    if (value.startsWith(`${NOTE_SOURCE_TAG_PREFIX}:`)) {
      const noteId = value.slice(`${NOTE_SOURCE_TAG_PREFIX}:`.length).trim();
      if (noteId) ids.add(noteId);
    }
  }
  return Array.from(ids);
}
```

## 3. Structural Metadata Overlays

For rich, interactive rendering (e.g., showing a preview card of an attached note inside a conversation chat thread), we complement tag relationships with structural payload metadata:

```typescript
export function buildNoteAttachmentMetadata(note: {
  $id?: string;
  title?: string | null;
  content?: string | null;
}) {
  return {
    type: 'attachment',
    entity: 'note',
    subType: 'shared_note',
    referenceId: note.$id || null,
    payload: {
      label: note.title || 'Attached Note',
      preview: String(note.content || '').slice(0, 100),
    },
  };
}
```

This pattern keeps our data layout flat and performant while supporting rich relational features.
