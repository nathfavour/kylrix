export const STATE_STORAGE_KEY = 'kylrix_ecosystem_state_tracker';
const MAX_HISTORY = 15;

export interface RouteState {
  path: string;
  scrollY: number;
  timestamp: number;
}

export function saveEcosystemState(path: string, scrollY: number) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STATE_STORAGE_KEY);
    let history: RouteState[] = raw ? JSON.parse(raw) : [];

    // Filter out duplicates of the same path
    history = history.filter(s => s.path !== path);

    // Unshift the new state
    history.unshift({ path, scrollY, timestamp: Date.now() });

    // Truncate to max history
    if (history.length > MAX_HISTORY) {
      history = history.slice(0, MAX_HISTORY);
    }

    localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Ignore quota errors
  }
}

export function getLastEcosystemRoute(): RouteState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STATE_STORAGE_KEY);
    if (!raw) return null;
    const history: RouteState[] = JSON.parse(raw);
    
    // Dynamically filter out public paths to prevent stale redirects
    const validHistory = history.filter(s => {
      const p = s.path;
      return !(
        p.startsWith('/send') ||
        p === '/' ||
        p.startsWith('/i/') ||
        p.startsWith('/note/shared') ||
        p.startsWith('/u/') ||
        p.startsWith('/p/') ||
        p.startsWith('/call/') ||
        p.startsWith('/connect/call/') ||
        p.startsWith('/flow/forms/') ||
        p.startsWith('/flow/events/')
      );
    });

    return validHistory.length > 0 ? validHistory[0] : null;
  } catch {
    return null;
  }
}
