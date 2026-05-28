# Task: Resolve UI Stacking Context Glitches

## Objective
Identify and fix the visual rendering artifacts (scanning bands/shearing) caused by improper stacking contexts.

## Steps
1. [ ] **Reproduction**: Trigger the glitch on `/u/profile` and identify the offending overlay/drawer/layer.
2. [ ] **Audit Z-Index**: Use browser DevTools to inspect the `z-index` and `position` properties of overlapping elements.
3. [ ] **Isolate Contexts**: Introduce `isolation: isolate` or appropriate `z-index` stacking to affected parents.
4. [ ] **Cleanup**: Debloat redundant stacking contexts by refactoring complex overlay nesting.
5. [ ] **Validation**: Verify that glitches no longer appear during intense animations or rapid component toggling.
