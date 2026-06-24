# Skill: Tier 3 Piece 1b — Wire TimerRing into Timer UI

## Goal
Integrate the existing `TimerRing` component into the `/timer` page so users see a visual countdown ring around the active sub-piece timer.

## Files to Read
1. `components/timer/TimerRing.tsx`
2. `components/timer/TimerDisplay.tsx`
3. `components/timer/TimerPanel.tsx`
4. `components/timer/__tests__/TimerPanel.test.tsx`
5. `.claude/memory/ui-conventions.md`

## Files to Create
1. `components/timer/__tests__/TimerDisplay.test.tsx`

## Files to Modify
1. `components/timer/TimerDisplay.tsx`
2. `components/timer/TimerPanel.tsx`

## Implementation Details
- Add `allocatedMinutes: number` prop to `TimerDisplay`.
- `TimerPanel` should pass `firstIncompleteSubPiece.allocatedMinutes` to `TimerDisplay`.
- In `TimerDisplay`, render `TimerRing` behind/around the existing time labels:
  - Use a relative container (`relative`) with the ring as absolute/full-fill and labels centered on top.
  - Keep the existing project elapsed and remaining time text readable.
  - Ring size ~220px, stroke width ~12px.
  - Ring color reflects remaining time via `TimerRing`'s built-in thresholds.
- Preserve existing status badge, Burmese/English labels, and conditional red text for last 60 seconds.
- No changes to timer logic or store.

## Test Strategy
Create `components/timer/__tests__/TimerDisplay.test.tsx`:
- Test: renders Burmese project time label.
- Test: renders English remaining label.
- Test: renders the `TimerRing` SVG when `allocatedMinutes` is provided.
- Test: passes `remainingSeconds` and `allocatedMinutes` correctly to the ring (verify stroke-dashoffset or data attributes).
- Test: does not render ring when `allocatedMinutes` is 0 (edge case guard).

Extend or update `components/timer/__tests__/TimerPanel.test.tsx` if needed:
- Test: active project with sub-piece renders `TimerRing`.

Run:
1. `npx vitest run components/timer/__tests__/TimerDisplay.test.tsx components/timer/__tests__/TimerPanel.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `TimerDisplay` accepts and forwards `allocatedMinutes`
- [ ] `TimerPanel` passes `allocatedMinutes` from active sub-piece
- [ ] Ring visually surrounds time labels on `/timer`
- [ ] `TimerDisplay.test.tsx` created and passing
- [ ] `TimerPanel` tests still passing
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep under 50 lines total change.
- Burmese-first labels remain unchanged.
- This is wiring only — no new timer behavior.
