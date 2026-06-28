# Skill: H1 — Remove Reset Buttons from TimerControls

## Goal
Remove both reset buttons from `TimerControls` so only Start/Pause remains.

## Scope
- Modify only `components/timer/TimerControls.tsx`.
- Modify only `components/timer/__tests__/TimerControls.test.tsx`.

## Required Changes
1. In `components/timer/TimerControls.tsx`:
   - Remove the `onReset` and `onResetToZero` props.
   - Remove the Discard Session button (`မူလမှပြန်စမယ်`).
   - Remove the destructive Reset button (`အချိန်ကို 0 မှ ပြန်စမယ်`) and its confirmation dialog imports/state.
   - Keep only Start/Pause button.
   - Clean up unused imports (e.g., `RotateCcw`, dialog primitives if no longer used).
2. In `components/timer/__tests__/TimerControls.test.tsx`:
   - Remove or update tests that assert reset button behavior.
   - Keep tests for Start/Pause.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/timer/__tests__/TimerControls.test.tsx` passes.
- [ ] No files outside the scope are modified.
