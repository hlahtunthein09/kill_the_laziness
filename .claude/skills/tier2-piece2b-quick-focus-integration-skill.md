# Skill: Tier 2 Piece 2b — Quick Focus Dashboard Integration + Navigation

## Goal
Integrate the quick-focus input into the dashboard and navigate to `/timer` after starting.

## Files to Read
1. `components/timer/QuickFocusInput.tsx`
2. `components/timer/__tests__/QuickFocusInput.test.tsx`
3. `app/page.tsx`

## Files to Create
None.

## Files to Modify
1. `components/timer/QuickFocusInput.tsx` — add optional `onStart` prop and call it after submit.
2. `components/timer/__tests__/QuickFocusInput.test.tsx` — add navigation callback test.
3. `app/page.tsx` — render `<QuickFocusInput onStart={() => router.push("/timer")} />`.

## Implementation Details
- In `QuickFocusInput`:
  - Add prop: `onStart?: () => void`
  - After `setActiveProject(targetProject.id)` and `setText("")`, call `onStart?.()`.
- In `app/page.tsx`:
  - Import `useRouter` from `next/navigation`.
  - Import `QuickFocusInput`.
  - Render `<QuickFocusInput onStart={() => router.push("/timer")} />`.
  - Suggested placement: inside the existing quick-action card or as a new card below the stat cards.
- Keep dashboard styling consistent (`bg-card-glow`, pastel theme).

## Test Strategy
- Test: `QuickFocusInput` calls `onStart` after submit.
- Test (page): dashboard renders `QuickFocusInput`.

Run:
1. `npx vitest run components/timer/__tests__/QuickFocusInput.test.tsx app/__tests__/page.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `QuickFocusInput` accepts and calls `onStart` prop
- [ ] Dashboard page renders `QuickFocusInput`
- [ ] Submitting quick focus navigates to `/timer`
- [ ] Tests pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep under 70 lines total.
- No new hooks or pages.
- Burmese-first labels, English subtitle.
