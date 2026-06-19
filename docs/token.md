# Economy & Token Substrate 🪙

Kylrix features an embedded utility economy driven by the **`$KYLRIX`** token. This token rewards ecosystem activity, regulates storage demand, and coordinates collaborative moderation.

---

## 1. Token Policy & Emissions Architecture

The `$KYLRIX` economy is governed by the rules defined in [lib/sdk/token/contract.ts](file:///home/nathfavour/code/kylrix/kylrix/lib/sdk/token/contract.ts):

*   **Symbol**: `$KYLRIX`
*   **Decimals**: `6` (Micro-unit: `1,000,000` units = `1 $KYLRIX`)
*   **Maximum Supply**: `100,000,000 $KYLRIX`
*   **Emission Target**: `10%` yearly emission cap.
*   **Daily Mint Cap**: `300,000 $KYLRIX`.
*   **Max Single Transfer**: `200,000 $KYLRIX`.

---

## 2. Activity Rewards & Reward Scale Rates

To incentivize engagement, users earn token emissions when they trigger system events:

| Activity Event | Base Reward ($KYLRIX) | Description |
|---|---|---|
| `daily_login` | `0.05 $KYLRIX` | Emitted once per 24 hours on active login |
| `note_create` | `0.08 $KYLRIX` | Emitted when a new private or collaborative note is saved |
| `share_public_note_moment` | `0.65 $KYLRIX` | Emitted when publishing public notes/moments |
| `call_initiate` | `0.20 $KYLRIX` | Emitted upon launching an ecosystem call |
| `referral_signup` | `1.50 $KYLRIX` | Emitted when a referred user establishes an account |

---

## 3. Rewards Scaling & Anti-Spam Spike Suppression

To protect the economy from sybil networks and bot farms, rewards are dynamically scaled down during activity spikes:

```typescript
// From lib/sdk/token/contract.ts
export function calculateMintRate(baseReward: bigint, recentSpikeFactorBps: number): bigint {
  // Reduces rewards by up to 40% if high activity spikes are detected
  const scale = 10000 - Math.min(recentSpikeFactorBps, 4000); 
  return (baseReward * BigInt(scale)) / 10000n;
}
```

> ### WHY this is done this way:
> 
> *   **Sybil Protection**: Bot scripts can generate notes or messages rapidly. By tracking global volume spikes over a 30-minute window, the contract automatically dampens rewards by up to **40%**. This makes farming attacks economically unviable.
> *   **Trust-Score Gating**: Minting operations require a minimum reputation floor of `20`. If a user's trust score drops due to moderation warnings or spam behaviors, reward minting is suspended.
> *   **Micro-Unit Accuracy**: All calculations are performed using native JavaScript `BigInt` (micro-units). This prevents rounding errors and floating-point issues during reward distribution.
