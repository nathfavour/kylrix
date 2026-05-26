---
name: system.token-ledger-minting
description: Explains the internal Kylrix Token ledger architecture. Explains micro-denomination conversions, supply restrictions, risk tightening, and activity-based mint distributions.
---

# Why: Kylrix Token Ledger & Controlled Minting

Providing an internal currency or token to power peer interactions, AI queries, and premium resources requires a highly secure ledger. We must prevent inflation, duplicate spending, or unauthorized minting.

We enforce these token economics and security checks in `lib/services/internal/kylrix-token.ts`.

## 1. Micro-Denomination Precision (BigInt)

To prevent floating-point calculation errors and rounding exploits, all token transactions are calculated using micro-denominations (1 token = 1,000,000 micro-tokens). We track all balances internally using **BigInt** (safe 64-bit integer values):

```typescript
const asMicro = (v: unknown) => {
  try {
    return BigInt(String(v ?? '0'));
  } catch {
    return 0n;
  }
};
const toMicro = (v: bigint) => v.toString();
const toToken = (micro: bigint) => (Number(micro) / 1_000_000).toFixed(6);
```

## 2. Supply Cap & Genesis Protection

The token ledger defines a strict Genesis state (`state` row in the database) containing immutable rules:
- **`maxSupplyMicro`**: The absolute maximum supply that can ever exist.
- **`circulatingMicro`**: The sum of all active user balances.
- **`rootBalanceMicro`**: The reserve pool from which new minting draws.

Every minting attempt validates these bounds. If the total minted tokens would exceed `maxSupply`, the operation is aborted.

## 3. Risk-Level & Tightening Policies

To defend against rapid automated drain attacks, the service calculates systemic velocity (tokens minted per minute) and updates the risk level (`normal`, `tightened`, `critical`):

```typescript
// If rapid minting spikes are detected, the ledger tightens limits:
if (isSuddenSpike) {
  state.riskLevel = 'tightened';
  // Enforces tighter per-user hourly and daily minting quotas
}
```

## 4. Activity-Based Distribution

Tokens are minted to reward genuine user activities (e.g. sharing knowledge, completing flows, host presence uptime) via activity signals:

```typescript
export interface KylrixActivitySignal {
  userId: string;
  activityType: KylrixActivityType;
  metadata?: Record<string, unknown>;
}
```

Each signal triggers a look-up against the token contract, checks the user's hourly quota, records the ledger transaction row, and issues a notification to keep the user informed.
