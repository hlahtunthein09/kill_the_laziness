# Skill: E2a — TimerDisplay + TimerControls Support for No Sub-piece

## Goal
Make the timer UI gracefully handle project-only focus where no sub-piece is selected. Hide the remaining-time section and the destructive reset button when there is no active sub-piece.

## Scope
- Modify `components/timer/TimerDisplay.tsx`.
- Modify `components/timer/TimerControls.tsx`.
- Modify `components/timer/__tests__/TimerDisplay.test.tsx`.
- Modify `components/timer/__tests__/TimerControls.test.tsx`.

## Required Changes
1. In `components/timer/TimerDisplay.tsx`:
   - Only render the `လက်ကျန် အချိန် (Remaining)` section when `allocatedMinutes` is provided and greater than `0`.
   - Keep the project time section always visible.
2. In `components/timer/TimerControls.tsx`:
   - Only render the destructive red reset button (`အချိန်ကို 0 မှ ပြန်စမယ် (Reset)`) when the `onResetToZero` prop is defined.
   - Keep the Discard Session and Start/Pause buttons always visible.
3. In tests:
   - `TimerDisplay.test.tsx`: add a test that the Remaining section is not rendered when `allocatedMinutes` is undefined or `0`.
   - `TimerControls.test.tsx`: add a test that the red Reset button is not rendered when `onResetToZero` is not provided.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/timer/__tests__/TimerDisplay.test.tsx` passes.
- [ ] `npx vitest run components/timer/__tests__/TimerControls.test.tsx` passes.
- [ ] No files outside the scope are modified.
