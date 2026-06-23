# Skill: Piece 6e-a — Theme Provider Wiring

## Goal
Wire up `next-themes` so the app can later switch themes via the settings page.

## Files to Read
1. `app/layout.tsx`
2. `app/globals.css` (confirm `.dark` class and CSS variables)
3. `package.json` (confirm `next-themes` is installed)

## Files to Create
1. `components/providers/ThemeProvider.tsx` — thin wrapper around `next-themes` `ThemeProvider`.
2. `components/providers/__tests__/ThemeProvider.test.tsx` — smoke test that provider renders children.

## Files to Modify
1. `app/layout.tsx` — wrap `<StoreHydrationProvider>` (or the inner app content) with `<ThemeProvider>`.

## Implementation Details
- Create a client component wrapper (`"use client"`) that re-exports/renders `ThemeProvider` from `next-themes`.
- Pass sensible defaults:
  - `attribute="class"` so theme is applied via the `dark` class on `<html>`.
  - `defaultTheme="system"`.
  - `enableSystem={true}`.
  - `disableTransitionOnChange={false}`.
- In `layout.tsx`, keep `suppressHydrationWarning` on `<html>` (already present) to avoid hydration warnings from next-themes.
- Do NOT connect to Zustand `settings.theme` yet; that happens in Piece 6e-b.

## Test Strategy
- Mock `next-themes` minimally so the test doesn't need DOM theme APIs.
- Test 1: `ThemeProvider` renders its children.

Run:
1. `npx vitest run components/providers/__tests__/ThemeProvider.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `components/providers/ThemeProvider.tsx` created
- [ ] `app/layout.tsx` wraps app content with `<ThemeProvider>`
- [ ] Theme provider test passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] No settings/theme selector logic added yet

## Notes
- Keep wrapper under 30 lines.
- Do not change theme-related Zustand state in this piece.
