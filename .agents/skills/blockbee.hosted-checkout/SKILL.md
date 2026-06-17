---
name: blockbee.hosted-checkout
description: BlockBee hosted checkout for Pro/Teams billing. Use when editing pricing, checkout server actions, BlockBee URLs, IPN fulfillment, or yearly discount charging.
---

# BlockBee Hosted Checkout (Canonical)

## Use hosted checkout — not custom flow

**Current**: `GET https://api.blockbee.io/checkout/request/` → redirect user to `payment_url`.

**Retired for Pro billing**: `/{ticker}/create/` with in-app QR/address UI. See `blockbee.custom-flow.md` for archaeology only.

### Why we switched

- Faster checkout: login drawer (if needed) → immediate BlockBee redirect
- BlockBee owns coin selection, minimums, and payment UI
- Less client code (no `CryptoPaymentDrawer` on `/pricing`)
- Fewer chain-specific edge cases in our app

## Implementation map

| Layer | File |
|---|---|
| Pricing UI | `app/pricing/page.tsx` |
| Checkout action | `app/(app)/(auth)/accounts/actions/billing.ts` → `createBillingCheckoutSessionAction` |
| BlockBee API | `lib/billing/providers/crypto-provider.ts` |
| Canonical URLs | `lib/billing/blockbee-urls.ts` |
| Pending registry | `lib/services/internal/blockbee-pending-checkout.ts` |
| IPN | `app/(app)/(auth)/accounts/api/pro/notify/route.ts` |
| Price math | `lib/subscription/ppp.ts` |

## BlockBee API parameters (required shape)

```typescript
const params = new URLSearchParams({
  apikey: process.env.BLOCKBEE_API!,
  value: amountUsd.toString(),
  currency: 'USD',
  redirect_url: resolveBlockBeeRedirectBaseUrl() + '?order_id=...',
  notify_url: resolveBlockBeeNotifyBaseUrl() + '?order_id=...&plan_id=...&months=...',
  post: '1',
});
```

**Do not use**: `return_url`, `cancel_url`, double-encoded URLs, or `window.location.origin` for callbacks.

## Dashboard whitelist (production)

- Notify: `https://www.kylrix.space/accounts/api/pro/notify`
- Redirect: `https://www.kylrix.space/accounts/pro/success`

Local dev still **charges** via BlockBee using these production callbacks; users land on `www.kylrix.space` after payment.

## Auth on `/pricing`

1. Not logged in → `sessionStorage` checkout intent + `openUnified('login')`
2. After login → auto-call `createBillingCheckoutSessionAction` and redirect
3. Never `openIDMWindow` for billing

## Yearly discount

- **Charge**: `calculateSubscriptionPrice` → 10 months paid per 12-month block
- **Grant**: `months` metadata stays the real term (12, 24, …)
- **UI free months**: `getBundledFreeMonths(months)` = `floor(months/12)*2`

Never charge `monthly × months` while displaying the bundled price.

## Server row writes

Use TablesDB row APIs on the server (`createSystemTablesDB` or proxied `createSystemClient().databases`). Raw `Databases` has no `listRows`.

## IPN checklist

- [ ] Signature verified (`lib/billing/blockbee-webhook-verify.ts`)
- [ ] Pending checkout row exists for `payment_id`
- [ ] Paid amount ≥ `expectedAmountUsd * 0.88`
- [ ] Stack subscription with `meta.months` (not discounted month count)
- [ ] Respond `*ok*`
