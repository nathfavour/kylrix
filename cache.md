# Critical Bug: Live Auto-Title Failure in SendComposer

## Problem Statement
The auto-title generation logic in `/send` (`components/send/SendComposer.tsx`) fails to reactively update the title as the user types in the note/discussion body. While the intended behavior is to have the title intelligently populate based on the body content (matching the fluid experience in the main Note creation drawer), the current implementation either "stalls" after the first character or fails to trigger at all.

## Reference implementation (Works Correctlly)
- **File**: `app/(app)/note/(app)/notes/CreateNoteForm.tsx`
- **Behavior**: As the user types in the body, the title field instantly updates using `buildAutoTitleFromContent` until the user manually interacts with the title field.

## Failed Attempts (Summary)

### Attempt 1: Uncontrolled Input Bridge
- **Approach**: Attempted to use the existing `FastDraftInput` (an uncontrolled component using `useImperativeHandle` and `refs` for performance). Added an `onChange` prop to the bridge to notify `SendComposer` of every value change.
- **Outcome**: **FAILED**. The title would often capture only the first character typed and then stop updating. Likely caused by stale closures in the ref-based bridge or React's asynchronous state batching interfering with the cross-component ref communication.

### Attempt 2: Full State Control & Logic Replication
- **Approach**: Completely abandoned the "Fast Draft" (uncontrolled) model. Lifted a controlled `noteBody` state into `SendComposer` and refactored `NoteComposerCard` to use a standard controlled `<textarea>`. Replicated the exact `useEffect` block and state management pattern from `CreateNoteForm.tsx`.
- **Outcome**: **FAILED** (according to user report). Even with identical code structure, the reactivity in the `/send` surface remains inconsistent or non-functional. 

## Strategic Guidance for Next Agent
1. **Analyze Environment Differences**: Investigate if there are subtle differences in the component tree of `SendComposer` vs `CreateNoteForm` that cause re-render loops or state resets (e.g., `React.memo` usage or parent context triggers).
2. **Input Lag / Event Dropping**: Check if the custom styling or Framer Motion wrappers in `SendComposer` are swallowing events or causing enough of a layout shift to interrupt the input stream.
3. **Build Pattern**: Verify that `buildAutoTitleFromContent` is being called with the correct string buffer and that the `isTitleManuallyEdited` guard isn't being triggered prematurely by auto-fill or focus events.
4. **Controlled Loop**: Ensure the `noteBody` state is actually reaching the `useEffect` trigger on every keystroke without being throttled by any underlying middleware.

**DO NOT REVERT TO REFS.** The solution must be a robust, controlled React state pattern that matches the Note app's reliability.
