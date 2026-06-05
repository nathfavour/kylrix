'use server';

import { getActor } from '@/lib/actions/secure-ops';
import { getAdminStats, listAdminUsers, requireAdmin } from '@/lib/services/internal/admin';
import { createAdminClient } from '@/lib/appwrite-admin';

export async function getAdminStatsAction(jwt?: string) {
  const user = await getActor(jwt);
  if (!user) {
    throw new Error('Unauthorized');
  }
  requireAdmin(user);
  return getAdminStats(user.email);
}

export async function getAdminUsersAction(params: {
  search?: string;
  verifiedOnly?: boolean;
  limit?: number;
  cursorAfter?: string | null;
}, jwt?: string) {
  const user = await getActor(jwt);
  if (!user) {
    throw new Error('Unauthorized');
  }
  requireAdmin(user);
  return listAdminUsers(params, user.email);
}

export async function getAdminUserByIdAction(userId: string, jwt?: string) {
  const user = await getActor(jwt);
  if (!user) {
    throw new Error('Unauthorized');
  }
  requireAdmin(user);
  const { users } = createAdminClient(user.email);
  const targetUser = await users.get(userId);
  return {
    id: targetUser.$id,
    name: targetUser.name,
    email: targetUser.email,
  };
}
