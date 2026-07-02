# Skill: Fix Extension Notification Icon URL + Error Handling (Piece B)

## Goal
Make desktop notifications actually show by resolving the icon URL correctly and handling permission/missing-icon errors gracefully.

## Scope
- Modify ONLY `extension/lib/timerAlarm.ts` and `extension/lib/scheduleAlarm.ts`.
- Modify their test files: `extension/lib/__tests__/timerAlarm.test.ts` and `extension/lib/__tests__/scheduleAlarm.test.ts`.
- Do NOT touch icon files or `wxt.config.ts` (Piece A handled that).

## Root cause
`browser.notifications.create` was called with `iconUrl: "/icon/128.png"`. In MV3, relative paths are allowed, but the safest cross-browser pattern is `browser.runtime.getURL("/icon/128.png")`. Also, the call was not awaited/catched, so missing/invalid icons rejected as uncaught promises.

## Implementation

### `extension/lib/timerAlarm.ts`
1. At the top, import or compute the resolved icon URL once:
   ```ts
   const NOTIFICATION_ICON_URL = typeof browser !== "undefined" && browser.runtime?.getURL
     ? browser.runtime.getURL("/icon/128.png")
     : "/icon/128.png";
   ```
   However, `browser` is loaded dynamically. Better: compute inside `getBrowser()` result or pass the resolved URL when creating notifications.
2. Inside `onAlarmTick`, after `const browser = await getBrowser();`, resolve the icon URL:
   ```ts
   const iconUrl = browser.runtime.getURL("/icon/128.png");
   ```
3. Replace both `browser.notifications.create(...)` calls to use `iconUrl` and wrap in try/catch:
   - Session-complete notification:
     ```ts
     try {
       await browser.notifications.create("session-complete", {
         type: "basic",
         iconUrl,
         title: notif.title.my,
         message: notif.body.my,
       });
     } catch (err) {
       console.error("[timerAlarm] Failed to show session-complete notification:", err);
     }
     ```
   - Milestone notification:
     ```ts
     try {
       await browser.notifications.create("focus-milestone", {
         type: "basic",
         iconUrl,
         title: "FocusFlow AI — ရှေ့ဆက်နေတယ်",
         message: `${motivation.my} (${motivation.en})`,
       });
     } catch (err) {
       console.error("[timerAlarm] Failed to show milestone notification:", err);
     }
     ```

### `extension/lib/scheduleAlarm.ts`
1. After `const browser = await getBrowser();`, compute:
   ```ts
   const iconUrl = browser.runtime.getURL("/icon/128.png");
   ```
2. Wrap `browser.notifications.create`:
   ```ts
   try {
     await browser.notifications.create("schedule-due", {
       type: "basic",
       iconUrl,
       title: "FocusFlow AI — စီစဉ်ထားသော focus အချိန် ရောက်ပါပြီ",
       message: `${state.projectName ?? "ပရောဂျက်"} · ${state.subPieceName ?? "အထွေထွေ focus"} · ${due.startTime}`,
     });
   } catch (err) {
     console.error("[scheduleAlarm] Failed to show schedule notification:", err);
   }
   ```

## Tests
Update existing tests to verify:
- `browser.notifications.create` receives `iconUrl` that starts with `chrome-extension://` or `moz-extension://` (or just `runtime.getURL` mocked return value).
- The call is awaited and errors are caught (can test by rejecting the mock and ensuring no throw).
- Existing behavior (session complete stops alarm, milestone dedup, schedule dedup) still passes.

Use the existing fake-browser mocks. The mocked `runtime.getURL` should return `"chrome-extension://test/icon/128.png"`.

## Verify (piece NOT done until all pass)
- `npx tsc --noEmit`
- `npx vitest run extension/lib/__tests__/timerAlarm.test.ts extension/lib/__tests__/scheduleAlarm.test.ts`
- `npm run build:ext`

## Done criteria
Notifications resolve icon URL via `runtime.getURL`, errors are caught, tests pass, build succeeds.
