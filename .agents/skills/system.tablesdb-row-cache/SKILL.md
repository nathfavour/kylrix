---
name: system.tablesdb-row-cache
description: Explains the read-through caching engine for TablesDB. Explains key hashing, cache eviction schedules, and coalescing concurrent inflight queries to prevent network thundering herds.
---

# Why: TablesDB Row Caching & Request Coalescing

In highly dynamic and real-time workspaces, certain hot database rows (such as user metadata, group details, and system settings) are queried frequently by different components on the screen. Making separate API requests for each request creates severe network bloat, database contention, and lag.

The read-through cache in `lib/ecosystem/tablesdb-row-cache.ts` solves this.

## 1. Request Coalescing (Inflight Deduplication)

If multiple components request the same row at the exact same moment (e.g. at page mount), we do not trigger multiple database requests. Instead, we register a single inflight `Promise` and resolve all callers with the exact same promise:

```typescript
const rowCache = new Map<string, { row: any; at: number }>();
const inflight = new Map<string, Promise<any>>();

export async function getTablesDbRowCached(
  parts: TablesDbRowCacheKey,
  fetcher: () => Promise<any>,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<any> {
  const k = cacheKey(parts);
  
  // Cache Hit
  const hit = rowCache.get(k);
  if (hit && Date.now() - hit.at < ttlMs) {
    return hit.row != null ? { ...hit.row } : hit.row;
  }

  // Coalesce concurrent requests
  const pending = inflight.get(k);
  if (pending) {
    const row = await pending;
    return row != null ? { ...row } : row;
  }

  const request = fetcher()
    .then((row) => {
      rowCache.set(k, { row, at: Date.now() });
      return row;
    })
    .finally(() => {
      inflight.delete(k);
    });

  inflight.set(k, request);
  const row = await request;
  return row != null ? { ...row } : row;
}
```

## 2. Terminology Mandate: Rows & Tables

Notice that this caching layer is built specifically around the concepts of **Tables** and **Rows** instead of "Collections" and "Documents". 
- `TablesDbRowCacheKey` consists of `databaseId`, `tableId`, and `rowId`.
- Evictions are performed using `invalidateTablesDbRowCache` to enforce cache cleanliness upon row mutations.

## 3. Strict Cloning Protection

To prevent components from accidentally mutating cached items directly in memory (which leads to rendering bugs and memory leaks), `getTablesDbRowCached` returns structural copies of the data (`{ ...row }` or deep clones).
