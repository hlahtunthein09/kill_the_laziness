# Skill: Rename Timer Reset Button to "Discard Session"

## Goal
Rename the timer reset button so its label matches the new discard-session semantics and is no longer confusing.

## Scope
- Modify only `components/timer/TimerControls.tsx`.
- Modify only `components/timer/__tests__/TimerControls.test.tsx`.

## Required Changes
1. In `components/timer/TimerControls.tsx`:
   - Change the reset button text from `ပြန်စ (Reset)` to `မူလမှပြန်စမယ် (Discard Session)`.
   - Keep the `RotateCcw` icon, `variant="outline"`, and `data-testid="timer-reset"`.
2. In `components/timer/__tests__/TimerControls.test.tsx`:
   - Update any assertions that look for the old label text (`ပြန်စ` or `Reset`) to match the new label.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/timer/__tests__/TimerControls.test.tsx` passes.
- [ ] No files outside the scope are modified.
