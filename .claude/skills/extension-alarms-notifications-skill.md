# Skill: Background Alarms + Off-Screen Notifications Build

## Purpose
Make the extension background keep the timer alive off-screen and send a desktop notification when the sub-piece completes.

## Scope
- **Create**
  - `extension/lib/timerAlarm.ts`
  - `extension/lib/__tests__/timerAlarm.test.ts`
- **Modify**
  - `extension/entrypoints/background.ts`
- **Size**: Small — 3 files, ~150 lines

## References
- `.claude/memory/extension-architecture.md`
- `extension/lib/storage.ts`
- `extension/lib/types.ts`
- `lib/notifications.ts`
- Context7 `/wxt-dev/wxt` — background entrypoints
- Context7 `/websites/developer_mozilla_en-us_mozilla_add-ons_webextensions` — alarms, notifications

## Steps
1. Read `.claude/CLAUDE.md`, `.claude/memory/extension-architecture.md`, `.claude/memory/progress.md`.
2. Read `extension/lib/storage.ts`, `extension/lib/types.ts`, `lib/notifications.ts`, and `extension/entrypoints/background.ts`.
3. Create `extension/lib/timerAlarm.ts`.
   - `startFocusAlarm()` — create `browser.alarms.create("focus-timer", { periodInMinutes: 1 })`.
   - `stopFocusAlarm()` — clear the alarm.
   - `onAlarmTick()` — called when the alarm fires:
     - Read stored `ExtensionTimerState`.
     - If not running, do nothing.
     - Calculate elapsed seconds since `savedAt`.
     - Update `projectElapsed` and `subPieceRemaining`.
     - If `subPieceRemaining <= 0`, call `browser.notifications.create` with session-complete notification (Burmese-first), then clear alarm and set `isRunning = false`.
     - Save updated state.
4. Update `extension/entrypoints/background.ts`.
   - On startup, add `browser.alarms.onAlarm.addListener` for `"focus-timer"`.
   - When `UPDATE_TIMER_STATE` receives `isRunning: true`, call `startFocusAlarm()`.
   - When `isRunning: false`, call `stopFocusAlarm()`.
5. Create `extension/lib/__tests__/timerAlarm.test.ts`.
   - Mock `browser.alarms` and `browser.notifications` via `@webext-core/fake-browser`.
   - Test that `startFocusAlarm` creates the alarm.
   - Test that alarm tick updates state and sends notification when sub-piece completes.
   - Test that `stopFocusAlarm` clears the alarm.
6. Run `npx tsc --noEmit` and `npx vitest run extension/lib/__tests__/timerAlarm.test.ts`.
7. Run `npm run build:ext` to verify WXT still builds.
8. Update `.claude/memory/progress.md`.

## Rules
- Use `browser.*` APIs.
- Background must not replace web app timer; it only wakes for notifications.
- Storage key stays `ff_extension_timer`.
- Use `lib/notifications.ts` for notification title/body.
- Tests must mock all browser APIs.

## Agent
- **Extension Engineer**

## Verification
- TypeScript compiles.
- Timer alarm tests pass.
- `npm run build:ext` succeeds.
- Notification fires when stored sub-piece remaining reaches 0.
