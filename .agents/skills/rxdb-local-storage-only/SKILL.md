---
name: rxdb-local-storage-only
description: Strict mandate that all local copy engine operations must use RxDB / IndexedDB substrate (LocalEngine / getRxDB) and avoid browser localStorage.
---

# RxDB Substrate Mandate for Local Copy Engine

## Core Directives
1. **RxDB/IndexedDB Only**: In the Kylrix ecosystem, "local copy" and offline data persistence are powered exclusively by **RxDB / IndexedDB** via `LocalEngine` (`@/lib/services/LocalEngine`) and `getRxDB` (`@/lib/webrtc/RxDBManager`).
2. **Prohibit `localStorage`**: Direct browser `localStorage` calls are strictly prohibited for application domain entities, user keychain rows, workspace objects, and AI chat history.
3. **LocalEngine API**:
   - `LocalEngine.cacheGet<T>(id: string, maxAgeMs?: number)`: Reads cached items from the RxDB substrate.
   - `LocalEngine.cacheSet<T>(id: string, data: T)`: Upserts items to the RxDB substrate.
   - `LocalEngine.cacheDelete(id: string)`: Removes cached items from the RxDB substrate.
4. **Offline First Architecture**: When offline (`!navigator.onLine` or network error), all UI reads (notes, tasks, vault, workspaces, agentic history) MUST load from `LocalEngine` without throwing errors or setting user/data state to null.
