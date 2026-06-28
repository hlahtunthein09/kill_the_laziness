# Skill: H1b — Update TimerPanel for New TimerControls Props

## Goal
Remove the now-obsolete `onReset` and `onResetToZero` prop calls from `TimerPanel` to `TimerControls` so the type check passes.

## Scope
- Modify only `components/timer/TimerPanel.tsx`.
- Modify only `components/timer/__tests__/TimerPanel.test.tsx`.

## Required Changes
1. In `components/timer/TimerPanel.tsx`:
   - Keep destructuring `reset` and `reinitialize` from `useTimer` (they are still used for extension events and session-summary continue).
   - Remove `onReset={reset}` and `onResetToZero={resolvedSubPiece ? resetToZero : undefined}` from the `<TimerControls />` JSX call.
2. In `components/timer/__tests__/TimerPanel.test.tsx`:
   - Update any `TimerControls` assertions or mock expectations that rely on reset buttons if necessary. Since the tests mock `useTimer`, likely only need to ensure the component still renders without error.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/timer/__tests__/TimerPanel.test.tsx` passes.
- [ ] No files outside the scope are modified.
