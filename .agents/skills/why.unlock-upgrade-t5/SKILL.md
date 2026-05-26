---
name: why.unlock-upgrade-t5
description: Explain the single Kylrix Pro subscription model, the symbolism of crypto-only payment, detachment from corporate compliance bloat, and the exclusion of Teams from the free tier.
---

# Why: Kylrix Pro Crypto-Only Model & Enterprise Detachment

To maintain absolute alignment with our core philosophy of **uncompromising utility** and **freedom**, Kylrix explicitly rejects traditional corporate SaaS patterns (such as credit card integrations, enterprise multi-tiered plans, and corporate compliance contracts).

We achieve this via our crypto-only Pro subscription model implemented in `lib/services/internal/subscription-entitlement.ts` and `lib/actions/client-ops.ts`.

---

## 1. Symbolism of Crypto-Only Payments

Traditional payment gateways (Stripe, credit cards) introduce central points of failure, account freezes, corporate monitoring, and excessive transaction fees. 
Kylrix accepts **only cryptocurrency payments** as a symbol of detachment and financial sovereignty:

```typescript
// Example from billing verification
export async function verifyCryptoCheckout(checkoutId: string) {
  const { databases } = createSystemClient();
  const pending = await databases.getRow(DB_ID, CHECKOUTS_TABLE, checkoutId);
  
  if (pending.status === 'confirmed') {
    // Escalate user to PRO plan directly
    await databases.updateRow(USER_DB, USERS_TABLE, pending.userId, {
      tier: 'pro',
      subscriptionActive: true,
      billingMode: 'crypto'
    });
  }
}
```

This ensures there is no corporate BS attached to our financial operations.

---

## 2. Dynamic Free vs. Pro Entitlements

We believe in maximum utility. Databases, passwords, forms, and TOTPs are completely free and unlimited for all users. However, complex abstractions (like Teams and heavy file uploads) are gated strictly behind **Kylrix Pro**:

```typescript
// Gating helper in subscription-entitlement.ts
export function checkUserEntitlement(actor: any, feature: string): boolean {
  if (actor.tier === 'pro') return true; // Pro unlocks EVERYTHING
  
  const freeRestricted = ['teams_collaboration', 'heavy_storage_upload', 'unlimited_collaborators'];
  if (freeRestricted.includes(feature)) {
    return false; // Free users cannot access these high-complexity features
  }
  
  return true; // Everything else is free
}
```

---

## 3. Rejecting the Teams Abstraction for Free Users

Managing shared team databases introduces a complex layer of access abstractions that are costly to maintain and prone to bugs. To protect our engineering resources from being drained by free-tier support demands, **Teams is a paid-only Pro feature**:

```typescript
export async function createTeamSecure(teamData: any, jwt: string) {
  const actor = await getActor(jwt);
  if (actor.tier !== 'pro') {
    throw new Error('Forbidden: Teams collaboration is a Pro feature.');
  }
  
  const adminTables = createSystemTablesDB();
  return await adminTables.createRow(TEAM_DB, TEAMS_TABLE, ID.unique(), teamData);
}
```

This keeps the codebase light, fast, and free of corporate enterprise bloat.
