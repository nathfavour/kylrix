# Task: Resolve Maximum Update Depth Infinite Loop

## Objective
Identify and fix the dependency or conditional logic causing `GlobalShell` to trigger a state update loop via `closeSecondarySidebar` in `LayoutContext`.

## Steps
1. [ ] **Analyze `components/GlobalShell.tsx`**: Locate the `useEffect` at line 82.
2. [ ] **Examine Dependencies**: Identify the variables in the dependency array that might change on every render.
3. [ ] **Inspect `LayoutContext.tsx`**: Verify how `setSecondarySidebar` behaves when called during rendering or effects.
4. [ ] **Apply Fix**: Stabilize the dependency array or wrap the trigger in a conditional check to ensure the state update is idempotent or only occurs when necessary.
5. [ ] **Verification**: Run `pnpm build` to ensure the infinite loop is gone and the build succeeds.
