# Skill: Make Dashboard Greeting Dashboard-Only (Observation #2A)

## Scope
Move the Burmese/English greeting from the global `Header` into the dashboard page (`app/page.tsx`) so it only appears on `/`.

## Files
- `components/layout/Header.tsx` — remove center greeting block
- `app/page.tsx` — add greeting near the page heading
- `components/layout/__tests__/Header.test.tsx` — new test: greeting not rendered in Header
- `app/__tests__/page.test.tsx` — add/update assertion that greeting renders on dashboard

## Changes
1. In `Header.tsx`, remove the center greeting `div` (lines 28-35).
2. In `app/page.tsx`, insert the greeting text above or near the existing page heading.
3. Add tests verifying the new behavior.

## Test Strategy
- Run `npx vitest run components/layout/__tests__/Header.test.tsx`
- Run `npx vitest run app/__tests__/page.test.tsx`
- Run `npx tsc --noEmit`.

## Verification
- No browser verification required.
