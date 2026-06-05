'use server';

import { ID, Permission, Query, Role } from 'node-appwrite';
import { getActor } from '@/lib/actions/secure-ops';
import { createAdminClient, createSystemClient } from '@/lib/appwrite-admin';
import { APPWRITE_CONFIG } from '@/lib/appwrite/config';
import { requireAdmin } from '@/lib/services/internal/admin';

const CHAT_DB_ID = APPWRITE_CONFIG.DATABASES.CHAT;
const EVENTS_TABLE_ID = APPWRITE_CONFIG.TABLES.CHAT.ACCOUNT_EVENTS;
const USERS_TABLE_ID = APPWRITE_CONFIG.TABLES.CHAT.USERS;

export async function listCouponsAction(jwt?: string) {
  const user = await getActor(jwt);
  if (!user) {
    throw new Error('Unauthorized');
  }
  requireAdmin(user);
  const { databases } = createAdminClient(user.email);
  const result = await databases.listRows(CHAT_DB_ID, EVENTS_TABLE_ID, [
    Query.equal('type', 'coupon'),
    Query.orderDesc('$createdAt'),
    Query.limit(100)
  ]);
  return result.rows;
}

export async function invalidateCouponAction(couponId: string, jwt?: string) {
  const user = await getActor(jwt);
  if (!user) throw new Error('Unauthorized');
  requireAdmin(user);
  
  const { databases } = createAdminClient(user.email);
  await databases.updateDocument(CHAT_DB_ID, EVENTS_TABLE_ID, couponId, {
    status: 'revoked'
  });
  return { success: true };
}

export async function createCouponAction(input: {
  userIds?: string[];
  discountPercent: number;
  status?: string;
  expiresAt?: string;
  title?: string;
  note?: string;
  redemptionLimit?: number;
  metadata?: Record<string, unknown>;
}, jwt?: string) {
  const user = await getActor(jwt);
  if (!user) {
    throw new Error('Unauthorized');
  }
  requireAdmin(user);
  const { databases } = createAdminClient(user.email);
  const systemClient = createSystemClient();
  const recipients = (input.userIds || []).map((id) => String(id || '').trim()).filter(Boolean);
  const scope = recipients.length > 0 ? 'targeted' : 'open';
  const targets = recipients.length > 0 ? recipients : [null];
  const created: any[] = [];
  
  for (const targetUserId of targets) {
    const row = await databases.createRow(
      CHAT_DB_ID,
      EVENTS_TABLE_ID,
      ID.unique(),
      {
        userId: targetUserId || user.$id,
        type: 'coupon',
        actorId: user.$id,
        relatedUserId: targetUserId,
        status: String(input.status || 'active').toLowerCase(),
        discountPercent: Number(input.discountPercent),
        expiresAt: input.expiresAt || null,
        redemptionLimit: targetUserId ? 1 : Math.max(1, Number(input.redemptionLimit || 1)),
        redemptionCount: 0,
        delta: null,
        metadata: JSON.stringify({
          ...(input.metadata || {}),
          note: input.note || null,
          title: input.title || null,
          source: 'admin.coupons.action',
          coupon: {
            userId: targetUserId,
            title: input.title || null,
            discountPercent: Number(input.discountPercent),
            createdBy: user.$id,
            scope,
            targetUserId,
          },
        }),
      },
      targetUserId ? [Permission.read(Role.user(targetUserId))] : [Permission.read(Role.user(user.$id))],
    );
    created.push(row);

    // Dispatch email if targeted
    if (targetUserId) {
      try {
        const { users: systemUsers } = systemClient;
        const targetAccount = await systemUsers.get(targetUserId);
        if (targetAccount && targetAccount.email) {
          const { dispatchEmail } = await import('@/lib/services/internal/emailDispatch');
          await dispatchEmail({
            eventType: 'feature_announcement', // Best fit for generic notifications/coupons
            sourceApp: 'accounts',
            recipientEmails: [targetAccount.email],
            recipientIds: [targetUserId],
            actorId: user.$id,
            actorName: 'Kylrix Admin',
            metadata: {
              subject: 'You received a Kylrix Coupon!',
              couponId: row.$id,
              discountPercent: Number(input.discountPercent),
              couponUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://accounts.kylrix.space'}/accounts/coupon/${row.$id}`
            }
          });
        }
      } catch (err) {
        console.warn('[Admin] Failed to send coupon email to target:', err);
      }
    }
  }
  return { count: created.length, coupons: created };
}
