# Task: Address Hardcoded Coupon Duration Fallback

## Problem
The `claimCouponAction` and `calculateStackedPeriod` functions default to a 1-month duration (`months: 1`) when coupon metadata is missing or invalid.

## Impact
This fallback is applied regardless of the discount percentage (100% or below), leading to inconsistent subscription durations. It creates technical debt by relying on opaque defaults instead of explicit, configurable coupon properties.

## Recommended Action
1. Remove hardcoded 1-month defaults.
2. Enforce required `months` metadata for all coupon documents.
3. Update `claimCouponAction` to throw an error if duration metadata is missing.
