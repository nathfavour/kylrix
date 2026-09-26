import pc from 'picocolors';
import { getClient, hasAuth } from '../client';
import { printError, printJson, printTable } from '../formatter';
import { LocalStore } from '../local/store';

export async function searchCommand(
  query: string,
  opts: { url?: string; token?: string; workspace?: string; json?: boolean; limit?: string }
) {
  try {
    const isAuthed = hasAuth(opts);
    const limit = opts.limit ? parseInt(opts.limit, 10) : 25;

    // 1. Search authoritative local SQLite store first (instant local-first results)
    const localResults = LocalStore.search(query);
    const allResults = [...localResults];

    // 2. If authed, query cloud search and merge
    if (isAuthed) {
      try {
        const cloudResults = await getClient(opts).search.query(query, {
          workspaceId: opts.workspace,
          limit,
        });
        const existingIds = new Set(allResults.map((r) => r.id));
        const existingCloudIds = new Set(allResults.map((r) => r.cloudId).filter(Boolean));

        for (const cr of cloudResults || []) {
          if (!existingIds.has(cr.id) && !existingCloudIds.has(cr.id)) {
            allResults.push({
              kind: cr.kind,
              id: cr.id,
              title: cr.title,
              snippet: cr.snippet,
              syncStatus: 'synced',
              cloudId: cr.id,
              isLocal: false,
            });
          }
        }
      } catch {
        // Fall back gracefully to local results
      }
    }

    if (opts.json) {
      printJson(allResults.slice(0, limit));
      return;
    }

    if (!allResults || allResults.length === 0) {
      console.log(`\nNo items matching "${pc.bold(query)}" found.`);
      return;
    }

    console.log(`\nSearch results for "${pc.bold(query)}":\n`);
    const rows = allResults.slice(0, limit).map((r: any) => {
      let syncBadge = pc.yellow('○ unsynced');
      if (r.syncStatus === 'synced' || (!r.isLocal && isAuthed)) {
        syncBadge = pc.green('● synced');
      } else if (!isAuthed) {
        syncBadge = pc.dim('💻 local');
      }
      return {
        kind: r.kind.toUpperCase(),
        id: r.id,
        title: r.title,
        snippet: r.snippet || '',
        sync: syncBadge,
      };
    });

    printTable(rows, ['kind', 'id', 'title', 'snippet', 'sync']);
  } catch (err: any) {
    printError('Search query failed', err);
    process.exit(1);
  }
}
