# Skill: Tier 3 Piece 1a — TimerRing Component

## Goal
Create a reusable circular timer ring component for the `/timer` page.

## Files to Read
1. `components/timer/TimerDisplay.tsx`
2. `components/timer/TimerPanel.tsx`
3. `.claude/memory/ui-conventions.md`

## Files to Create
1. `components/timer/TimerRing.tsx`
2. `components/timer/__tests__/TimerRing.test.tsx`

## Files to Modify
None.

## Implementation Details
- Props interface:
  - `remainingSeconds: number`
  - `allocatedMinutes: number`
  - `size?: number` (default 180)
  - `strokeWidth?: number` (default 12)
  - `className?: string`
- Use SVG with two `<circle>` elements: a background track and a progress arc.
- Radius and circumference are derived from `size` and `strokeWidth`.
- Progress fraction = `Math.max(0, remainingSeconds / (allocatedMinutes * 60))`.
- Stroke dashoffset = `circumference * (1 - fraction)`.
- Color by remaining fraction:
  - `> 0.5` → `text-teal-500`
  - `> 0.2` → `text-amber-500`
  - `<= 0.2` → `text-rose-500`
- Use `cn()` from `lib/utils.ts` for class merging.
- Use `transform="rotate(-90)"` on the SVG so the ring starts at the top.
- No labels inside the ring — `TimerDisplay` will place time text over it later.

## Test Strategy
Create `components/timer/__tests__/TimerRing.test.tsx`:
- Test: renders an `<svg>` element.
- Test: full remaining time shows complete ring (offset near 0).
- Test: half remaining time shows half ring.
- Test: zero remaining time shows empty ring.
- Test: color is teal when > 50% remains.
- Test: color is rose when <= 20% remains.
- Test: custom `size` and `strokeWidth` are applied.

Run:
1. `npx vitest run components/timer/__tests__/TimerRing.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `TimerRing.tsx` created with typed props
- [ ] SVG track + progress arc rendered
- [ ] Progress math correct for remaining / allocated
- [ ] Color thresholds applied
- [ ] 7 tests passing
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- No store access — pure presentational component.
- Keep component under 60 lines.
- Burmese labels are not needed inside this component; they live in `TimerDisplay`.
