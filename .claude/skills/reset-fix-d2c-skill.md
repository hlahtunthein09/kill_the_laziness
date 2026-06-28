# Skill: Reset Fix D2c — Wire `resetToZero` into `TimerPanel`

## Goal
Connect the new `resetToZero` action from `useTimer` to the new destructive Reset button in `TimerControls`.

## Scope
- Modify only `components/timer/TimerPanel.tsx`.
- Modify only TimerPanel test files:
  - `components/timer/__tests__/TimerPanel.test.tsx`
  - `components/timer/__tests__/TimerPanel.session-summary.test.tsx`
  - `components/timer/__tests__/TimerPanel.extension-controls.test.tsx`

## Required Changes
1. In `components/timer/TimerPanel.tsx`:
   - Destructure `resetToZero` from `useTimer`.
   - Pass `resetToZero` to `TimerControls` via the `onResetToZero` prop.
2. In each TimerPanel test file:
   - Add `resetToZero: vi.fn()` to every mocked `useTimer` return object so the prop is provided.

## Verification Checklist
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/timer/__tests__/TimerPanel.test.tsx` passes.
- [ ] `npx vitest run components/timer/__tests__/TimerPanel.session-summary.test.tsx` passes.
- [ ] `npx vitest run components/timer/__tests__/TimerPanel.extension-controls.test.tsx` passes.
- [ ] No files outside the scope are modified.
