# Skill: Piece 5d — Fix `require()` in `extension/lib/focusSync.ts`

## Goal
Replace the `require("wxt/browser")` call in `extension/lib/focusSync.ts` with a dynamic ES module import, consistent with Pieces 5a–5c.

## Files to Read
1. `extension/lib/focusSync.ts`
2. `extension/lib/__tests__/focusSync.test.ts`

## Implementation Steps
1. Change `getBrowser()` in `focusSync.ts` from sync to async (`Promise<Browser>`).
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
3. Update `syncFocusSession` to `await getBrowser()` before calling `runtime.sendMessage`.
4. Do NOT modify `startFocusSyncPolling` (it does not call `getBrowser` directly).
5. Do NOT modify any other files.

## Test Strategy
- Run `npx vitest run extension/lib/__tests__/focusSync.test.ts` — all 12 existing tests must pass.
- Run `npx tsc --noEmit` — TypeScript must be clean.
- Run `npm run build:ext` — WXT build must succeed.

## Verification Checklist
- [ ] `require("wxt/browser")` no longer appears in `extension/lib/focusSync.ts`
- [ ] `focusSync.test.ts` passes (12/12)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build:ext` succeeds
- [ ] No other extension files modified

## Notes
- Tests call `setFocusSyncBrowserInstance(fakeBrowser)` before any sync operation, so the dynamic import branch is not exercised in tests.
- This piece is Tiny: only one file is modified.
