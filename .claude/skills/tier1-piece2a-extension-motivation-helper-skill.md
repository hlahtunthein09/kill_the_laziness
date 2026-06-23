# Skill: Tier 1 Piece 2a — Extension Motivation Helper

## Goal
Make motivational messages available inside the extension so the background service worker can include them in desktop notifications.

## Files to Read
1. `lib/motivation.ts`
2. `lib/__tests__/motivation.test.ts`
3. `.claude/memory/notification-spec.md`

## Files to Create
1. `extension/lib/motivation.ts` — port of web app motivation helper for extension use.
2. `extension/lib/__tests__/motivation.test.ts` — tests for tier selection and message format.

## Files to Modify
None.

## Implementation Details
- Port the existing motivation logic from `lib/motivation.ts` to `extension/lib/motivation.ts`.
- Keep the same types and public API:
  - `MotivationTier`: `'beginning' | 'struggling' | 'succeeding' | 'completing'`
  - `MotivationContext`: `{ elapsedSeconds, remainingSeconds?, isRunning, completedToday }`
  - `MotivationMessage`: `{ my: string; en: string }`
  - `getMotivation(context)` returns `{ my, en, tier }`
- Keep Burmese-first messages + English subtitles.
- Keep the same tier-determination rules from the spec:
  - `beginning`: elapsed < 60s
  - `completing`: remaining < 60s
  - `struggling`: elapsed > 300s and (no remaining or remaining > 300s)
  - `succeeding`: everything else

## Test Strategy
- Test each tier returns the expected tier label.
- Test each tier returns a non-empty Burmese `my` string.
- Test edge cases: no remaining, undefined remaining, boundary seconds.
- Test `completedToday` doesn't break tier selection.

Run:
1. `npx vitest run extension/lib/__tests__/motivation.test.ts`
2. `npx tsc --noEmit`
3. `npm run build:ext`

## Verification Checklist
- [ ] `extension/lib/motivation.ts` created
- [ ] `getMotivation` returns correct tier and Burmese message
- [ ] Extension motivation tests pass
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build:ext` succeeds
- [ ] No changes to web app `lib/motivation.ts`

## Notes
- Keep under 100 lines.
- This piece only creates the helper; notification triggering happens in Piece 2b.
- Random message selection can make deterministic tests tricky; test tier and truthiness only (same pattern as web app tests).
