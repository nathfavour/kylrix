# Maximum Update Depth Exceeded Investigation

This cache entry tracks the infinite re-render loop identified in `GlobalShell.tsx` and `LayoutContext.tsx`.

## Issue Description
`GlobalShell.tsx` contains a `useEffect` that triggers `closeSecondarySidebar` from `LayoutContext`. This state update causes a re-render, which in turn re-triggers the `useEffect`, creating an infinite loop that crashes the UI.

## Root Cause
The `useEffect` in `GlobalShell` likely relies on a dependency that updates every render, or the effect itself is improperly gated, causing the `LayoutContext` state update to run continuously.

## Files Involved
- `components/GlobalShell.tsx` (the trigger)
- `context/LayoutContext.tsx` (the state management)
