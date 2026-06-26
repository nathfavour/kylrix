// Centralized Upstash Redis client stub
// Disconnected internally to prevent realtime malfunctions on archived free-tier databases.
// Can be re-connected in the future by restoring SDK initialization.
export const redis = {
  get: async () => null,
  set: async () => null,
  del: async () => null,
};

// Centralized sliding window ratelimiter stub
export const serverActionLimiter = {
  limit: async () => ({ success: true, remaining: 999, reset: 0, pending: Promise.resolve() }),
};

/**
 * Server-side rate limiter helper for Server Actions
 * @param identifier Unique request key (e.g. actorId or client IP)
 * @returns Object indicating success or throttled state
 */
export async function limitServerAction(identifier: string) {
  // Statically bypass Upstash network dependencies entirely.
  return { success: true, remaining: 999, reset: 0 };
}
