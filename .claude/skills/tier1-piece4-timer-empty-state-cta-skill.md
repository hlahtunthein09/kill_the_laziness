# Skill: Tier 1 Piece 4 — Timer Empty-State CTA

## Goal
When the timer page has no active project, give the user a clear call-to-action to choose a project instead of leaving them at a dead end.

## Files to Read
1. `components/timer/TimerPanel.tsx`
2. `components/timer/__tests__/TimerPanel.test.tsx`
3. `__mocks__/next-navigation.ts` (for reusing the router mock)

## Files to Create
None.

## Files to Modify
1. `components/timer/TimerPanel.tsx` — add a CTA button in the "no active project" empty state.
2. `components/timer/__tests__/TimerPanel.test.tsx` — add a test for the CTA button navigation.

## Implementation Details
- In the empty state returned when `!activeProject`, add a shadcn/ui `Button` below the existing message.
- Button label:
  - Burmese: `"ပရောဂျက်တစ်ခုရွေးချယ်ပါ"`
  - English subtitle: `"Choose a project"`
- Use `useRouter` from `next/navigation` and call `router.push("/projects")` on click.
- Alternatively use `next/link` wrapped around the button.
- Keep existing styling (centered icon, Burmese message, English subtitle).

## Test Strategy
- The existing store and timer mocks are already in place.
- Mock `useRouter` with the reusable `__mocks__/next-navigation.ts` mock (already aliased in `vitest.config.ts`).
- New test: when no active project, clicking the CTA button calls `router.push("/projects")`.

Run:
1. `npx vitest run components/timer/__tests__/TimerPanel.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] Empty state shows a CTA button
- [ ] Clicking CTA navigates to `/projects`
- [ ] Existing TimerPanel tests still pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep changes under 30 lines.
- This completes Tier 1 of the daily focus tool roadmap.
