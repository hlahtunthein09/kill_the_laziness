# Skill: Piece 5a — Fix `require()` in `extension/lib/storage.ts`

## Goal
Replace the `require("wxt/browser")` call in `extension/lib/storage.ts` with a dynamic ES module import while keeping the swappable `setBrowserInstance` test seam intact.

## Files to Read
1. `extension/lib/storage.ts`
2. `extension/lib/__tests__/storage.test.ts`

## Implementation Steps
1. Change `getBrowser()` from a synchronous function to an `async` function.
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
3. Update every call site to await `getBrowser()`:
   - `setTimerState`
   - `getTimerState`
   - `clearTimerState`
4. Do NOT change the public API signatures beyond adding internal awaits.
5. Do NOT touch other extension files in this piece.

## Test Strategy
- Run `npx vitest run extension/lib/__tests__/storage.test.ts` — all 5 existing tests must pass.
- Run `npx tsc --noEmit` — TypeScript must be clean.
- Run `npm run build:ext` — WXT build must succeed.

## Verification Checklist
- [ ] `require("wxt/browser")` no longer appears in `extension/lib/storage.ts`
- [ ] `storage.test.ts` passes (5/5)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build:ext` succeeds
- [ ] No other extension files modified

## Notes
- Tests call `setBrowserInstance(fakeBrowser)` before any storage operation, so the dynamic import branch is not exercised in tests.
- Keep changes minimal; this is a Tiny piece.
