---
name: notification-diagnosis-resume
description: Resume point for desktop notification root-cause fix; popup + target auto-pause done, diagnosis complete, next is logging + requireInteraction fix.
metadata:
  type: project
---

**Conversation ended due to context limit (2026-07-04).**

## What was just completed

- `extension/entrypoints/popup.html` + `extension/lib/popup.ts` redesigned with clear notification on/off status, separated Start/Open App buttons, and Start-button feedback.
- `hooks/useTimer.ts` + `components/timer/TimerPanel.tsx` fixed so the project timer auto-pauses and shows a target-reached card when `projectElapsed >= targetTimeSeconds`.
- Tests passing: popup 19/19 + regression 13/13; timer hooks + TimerPanel 62/62.
- `tsc --noEmit` clean; `npm run build` and `npm run build:ext` succeed.
- `progress.md` updated with both completion lines.

## Current task

Diagnose and fix why FocusFlow native desktop notifications do not appear as banners on the desktop (they only show in Windows Action Center/side panel).

## Diagnostic fixes applied in this session

1. Added `requireInteraction: true` to every `browser.notifications.create()` call in `extension/lib/notifications.ts`.
2. Added temporary `console.log` at every key step of the notification chain (`control.content.ts`, `background.ts`, `messageHandler.ts`, `timerEngine.ts`, `notifications.ts`).
3. Replaced `require("wxt/browser")` with dynamic `await import("wxt/browser")` in `extension/entrypoints/control.content.ts`; `setupControlListener()` is now async and the test awaits it.
4. Added TypeScript module augmentation for `Notifications.CreateNotificationOptions` so `requireInteraction` is type-safe.
5. Added `requireInteraction` assertions to `notifications.test.ts` and updated `control.content.test.ts`.
6. Verified `npx tsc --noEmit`, targeted tests, and `npm run build:ext`.

**Status:** Code changes done; live browser verification is pending because the user switched to fixing the completed-project restart flow first.

## Root-cause analysis conclusion

Execution path for timer notifications:

1. `useTimer.ts:start()` → dispatches `ff:command` CustomEvent.
2. `extension/entrypoints/control.content.ts` → catches event, calls `browser.runtime.sendMessage`.
3. `extension/entrypoints/background.ts` → `runtime.onMessage` → `handleMessage()`.
4. `extension/lib/messageHandler.ts` → `START_TIMER` → `timerEngine.startSession()`.
5. `extension/lib/timerEngine.ts` → creates `focus-timer` alarm.
6. `chrome.alarms` fires `focus-timer` → `timerEngine.tick()`.
7. On sub-piece complete / target reached / milestone → calls `notifySessionComplete` / `notifyMilestone`.
8. `extension/lib/notifications.ts` → checks `getPermissionLevel()`, then `browser.notifications.create()` with `priority: 2`.

**Most likely failure point:** notifications are created successfully but Windows/Chrome routes them to the Action Center instead of showing desktop banners. Supporting evidence: user saw a notification inside the side panel, so `create()` executed; `priority: 2` is already maxed.

**Secondary risks:**
- `control.content.ts` uses `require("wxt/browser")` while all other extension files use dynamic `import()` — potential runtime content-script failure.
- `notifications.ts:withPermission()` silently returns on denial with no user-facing error.
- Content script only matches `http://localhost:3000/*`; other origins break the bridge.

## Next steps (do in new chat)

1. Add temporary `console.log` at every step of the notification chain so the user can watch the service worker console and confirm execution.
2. Add `requireInteraction: true` to every `browser.notifications.create()` call in `extension/lib/notifications.ts` so notifications persist on screen.
3. Replace `require("wxt/browser")` with dynamic `import("wxt/browser")` in `extension/entrypoints/control.content.ts`.
4. Rebuild extension and run live browser verification with the user watching the service worker console.
5. If banners still do not appear, guide the user through Windows Settings → Notifications → Google Chrome priority / Focus Assist.

## User expectations to clarify next chat

The user mentioned wanting "speech noti" / "speech toasts." Clarify whether they mean:
- Audio beep on completion (wire existing `soundEnabled` setting),
- Text-to-speech voice announcement, or
- Sonner web-app toasts (only work while tab is open).

## Files involved

- `extension/lib/notifications.ts`
- `extension/lib/timerEngine.ts`
- `extension/entrypoints/control.content.ts`
- `extension/entrypoints/background.ts`
- `extension/lib/messageHandler.ts`
- `hooks/useTimer.ts`

## Uncommitted changes

All popup + target-fix changes are in the working tree on branch `feature/offscreen-notification-system`. Do not commit until desktop notification banners are verified.
