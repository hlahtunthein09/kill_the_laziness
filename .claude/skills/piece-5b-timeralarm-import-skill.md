# Skill: Piece 5b — Fix `require()` in `extension/lib/timerAlarm.ts`

## Goal
Replace the `require("wxt/browser")` call in `extension/lib/timerAlarm.ts` with a dynamic ES module import, consistent with Piece 5a.

## Files to Read
1. `extension/lib/timerAlarm.ts`
2. `extension/lib/__tests__/timerAlarm.test.ts`
3. `extension/lib/messageHandler.ts`

## Implementation Steps
1. Change `getBrowser()` in `timerAlarm.ts` from sync to async (`Promise<Browser>`).
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
3. Update `startFocusAlarm` and `stopFocusAlarm` to be `async` and `await getBrowser()`.
4. Update `onAlarmTick` to `await getBrowser()` for the notification call.
5. Update `messageHandler.ts` to `await startFocusAlarm()` and `await stopFocusAlarm()`.
6. Do NOT modify `background.ts` (it already calls `onAlarmTick()` without await, which is fine for an async function).

## Test Strategy
- Run `npx vitest run extension/lib/__tests__/timerAlarm.test.ts` — all 7 existing tests must pass.
- Run `npx tsc --noEmit` — TypeScript must be clean.
- Run `npm run build:ext` — WXT build must succeed.

## Verification Checklist
- [ ] `require("wxt/browser")` no longer appears in `extension/lib/timerAlarm.ts`
- [ ] `timerAlarm.test.ts` passes (7/7)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build:ext` succeeds
- [ ] `messageHandler.ts` awaits alarm start/stop calls

## Notes
- Tests call `setAlarmBrowserInstance(fakeBrowser)` before any alarm operation, so the dynamic import branch is not exercised in tests.
- This piece touches 2 files (timerAlarm.ts + messageHandler.ts), which is Small, not Tiny, because timerAlarm.ts has sync public functions that must become async.
