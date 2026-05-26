---
name: why.exportability-data-sovereignty
description: Explain why all user data is completely portable (importable/exportable) and how our Google integration promotes ultimate user data sovereignty.
---

# Why: Total Data Portability & Google Integration Sovereignty

A true secure workspace must respect user data ownership. If a platform locks user data in a proprietary format or makes it difficult to export, it operates as a data prison rather than a secure utility. 

Kylrix is designed with a core commitment to **Total Data Sovereignty**: all user data must be completely portable, importable, and exportable at any time.

We implement this in `lib/data-porter.ts` and `lib/import/`.

---

## 1. Zero Platform Lock-In

Users must be free to leave the platform at any moment. To support this, we provide a single-click export tool that compiles all notes, passwords, forms, and account settings into a standardized, readable JSON archive:

```typescript
// Export engine in data-porter.ts
export async function exportUserData(jwt: string) {
  const actor = await getActor(jwt);
  const adminTables = createSystemTablesDB();
  
  // 1. Compile all user tables into a single structural snapshot
  const [notes, passwords, forms] = await Promise.all([
    adminTables.listRows(NOTE_DB, NOTES_TABLE, [Query.equal('userId', actor.$id)]),
    adminTables.listRows(VAULT_DB, CREDENTIALS_TABLE, [Query.equal('userId', actor.$id)]),
    adminTables.listRows(FLOW_DB, FORMS_TABLE, [Query.equal('userId', actor.$id)])
  ]);
  
  const archive = {
    exportVersion: '1.0.0',
    exportedAt: new Date().toISOString(),
    userId: actor.$id,
    data: {
      notes: notes.rows,
      passwords: passwords.rows,
      forms: forms.rows
    }
  };
  
  // 2. Deliver the unencrypted or MasterPass-sealed JSON payload directly to user download stream
  return JSON.parse(JSON.stringify(archive));
}
```

---

## 2. Google Integration for Easy Portability

To support seamless transitions from other workspaces, we integrate with the Google Ecosystem. This allows users to import their documents, keep files synced, or export their data to Google Drive without friction:

```typescript
// Example Google Drive Sync/Export
export async function exportToGoogleDrive(fileData: string, accessToken: string) {
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=media', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: fileData
  });
  return await res.json();
}
```

By supporting easy import and export flows, we build trust. Users stay because of the product's merit and utility, not because their data is locked in a silo.
