# Skill: Piece 5c — Fix `require()` in `extension/lib/redirect.ts`

## Goal
Replace the `require("wxt/browser")` call in `extension/lib/redirect.ts` with a dynamic ES module import, consistent with Pieces 5a and 5b.

## Files to Read
1. `extension/lib/redirect.ts`
2. `extension/lib/__tests__/background-redirect.test.ts`

## Implementation Steps
1. Change `getBrowser()` in `redirect.ts` from sync to async (`Promise<Browser>`).
2. Replace:
   ```ts
   const { browser } = require("wxt/browser");
   _browser = browser;
   ```
   with:
   ```ts
   const { browser } = await import("wxt/browser");
   _browser = browser;
   ```
3. Update all call sites in `redirect.ts` to `await getBrowser()`:
   - `getExtensionSettings`
   - `handleTabUpdate` (both `runtime.getURL` and `tabs.update` calls)
   - `logDistractionAttempt` (both `storage.local.get` and `storage.local.set` calls)
4. Do NOT modify any other files.

## Test Strategy
- Run `npx vitest run extension/lib/__tests__/background-redirect.test.ts` — all 11 existing tests must pass.
- Run `npx tsc --noEmit` — TypeScript must be clean.
- Run `npm run build:ext` — WXT build must succeed.

## Verification Checklist
- [ ] `require("wxt/browser")` no longer appears in `extension/lib/redirect.ts`
- [ ] `background-redirect.test.ts` passes (11/11)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build:ext` succeeds
- [ ] No other extension files modified

## Notes
- Tests call `setRedirectBrowserInstance(mockBrowser)` before any redirect operation, so the dynamic import branch is not exercised in tests.
- This piece is Tiny: only one file is modified because all public functions in `redirect.ts` are already async.
