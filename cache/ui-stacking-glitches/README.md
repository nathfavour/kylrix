# UI Glitch Investigation: Stacking Context Artifacts

This cache entry tracks the "color television" visual glitches (scanning bands/shearing) observed across the UI, particularly on pages like `/u/profile`.

## Issue Description
Visual shearing or "matrix-style" scanning bands appear on the screen during interactions or animations. These are classic symptoms of poor stacking context management in complex web interfaces.

## Root Cause
Likely caused by overlapping UI layers (drawers, modals, overlays) incorrectly competing for screen space without proper z-index isolation, leading to browser composition failures.

## Investigation Path
- Audit `z-index` usage in global shells and dynamic overlays.
- Inspect `position: fixed` or `absolute` container nesting.
- Check for missing `isolation: isolate` on parent containers to properly manage stacking contexts.
