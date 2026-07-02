---
name: offscreen-notification-redesign
description: Off-browser native notification failure analysis and planned extension-owned timer architecture for FocusFlow AI.
metadata:
  type: project
---

# Off-Browser Native Notification Redesign

**Status:** Analysis complete. Implementation queued for next chat.  
**Branch:** `fix/session-2026-06-26` (uncommitted changes include 60s milestone interval and TimerToast dedup fix).  
**Core gap:** The browser extension does not reliably produce native OS notifications because the service worker passively mirrors web-app timer state instead of owning the session.

## Why the current system fails

The notification chain is too fragile for an off-browser feature:

1. **Web app owns the timer.** `hooks/useTimer.ts` writes `ff_active_session` to `localStorage` every 5 seconds while running (`useTimer.ts:291-294`).
2. **Content script forwards state.** `extension/entrypoints/focusSync.content.ts` polls every 5s. `extension/lib/focusSync.ts` sends `UPDATE_TIMER_STATE` only when the raw JSON changes (`focusSync.ts:88-90`).
3. **Background only arms on message.** `extension/lib/messageHandler.ts:46-47` calls `startFocusAlarm()` only when an `UPDATE_TIMER_STATE` message arrives with `isRunning: true`.
4. **No startup recovery.** `extension/entrypoints/background.ts` starts `startScheduleAlarm()` on startup but never checks stored `ff_extension_timer` to restart the focus alarm after a service-worker restart.
5. **No keep-alive alarm.** MV3 service workers are stopped after ~5 minutes of inactivity. Without a periodic alarm, the worker can die and never wake to notify.
6. **No permission diagnostics.** `extension/lib/timerAlarm.ts` calls `browser.notifications.create` inside `try/catch` but never checks `getPermissionLevel()` first or surfaces the result.
7. **No popup test button.** The popup (`extension/lib/popup.ts`, `extension/entrypoints/popup.html`) cannot trigger a test notification, making debugging slow.
8. **TimerToast dedup bug (fixed).** `components/timer/TimerToast.tsx` used `lastTriggerRef` to skip duplicate trigger strings, which suppressed recurring milestone toasts. Fixed by resetting the ref when `trigger` clears.
9. **Milestone interval lowered for testing.** `MILESTONE_INTERVAL_SECONDS = 60` added to `lib/constants.ts`; `TimerPanel.tsx` and `extension/lib/timerAlarm.ts` use it. Tests updated.

Result: native notifications depend on a chain of five components all staying alive. If any link breaks, the user gets no off-browser notification.

## Research findings

### Real-world reference implementation
- **Repo:** [dominhduy09/pomodoro-extension](https://github.com/dominhduy09/pomodoro-extension)
- **Files examined:** `service_worker.js`, `manifest.json`
- **Key pattern:** The service worker owns timer state in `chrome.storage.local`. It schedules `chrome.alarms` from the worker itself, updates badges, and calls `chrome.notifications.create` on session end. The popup only sends commands and reads state.
- **Notification snippet:**
  ```javascript
  async function notify(title, message) {
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title,
      message,
      priority: 2
    });
  }
  ```

### Chrome notifications API requirements
- Source: [developer.chrome.com/docs/extensions/reference/api/notifications](https://developer.chrome.com/docs/extensions/reference/api/notifications)
- `notifications` permission required (already in manifest).
- `notifications.create` requires `type`, `iconUrl`, `title`, `message`.
- Should check `chrome.notifications.getPermissionLevel()` before creating.
- Service-worker listeners must be registered synchronously at top level (we do this).

### Service-worker lifecycle
- Source: Web search summary of 2024 MV3 debugging guides
- MV3 service workers are event-driven and stop after inactivity.
- `chrome.alarms` is the reliable way to wake the worker.
- A keep-alive alarm every ~4.5 minutes prevents idle termination while a session is running.

## Planned architecture change

Make the **extension service worker the source of truth for the active focus session**. The web app becomes a client that sends commands and reads state.

### New/updated responsibilities

| Component | Current | Target |
|---|---|---|
| `useTimer.ts` | Owns RAF loop, writes `ff_active_session` | Reads extension state, displays time, sends commands |
| `TimerPanel.tsx` | Drives `useTimer` | Displays extension-owned session, sends start/pause/reset |
| `extension/lib/timerEngine.ts` | Does not exist | Owns session state, `chrome.alarms`, drift calc |
| `extension/lib/timerAlarm.ts` | Calculates drift on alarm tick | Merged into or called by `timerEngine`; fires notifications |
| `extension/lib/messageHandler.ts` | Stores state, starts/stops alarm | Routes commands to `timerEngine` |
| `extension/entrypoints/background.ts` | Listens for messages/alarms | Initializes `timerEngine` on startup, registers listeners |
| `extension/lib/popup.ts` | Reads stored state | Adds test-notification button and permission status |

### Proposed message flow

```
Web app: START_TIMER ──► background messageHandler ──► timerEngine.start()
                                              │
                                              ▼
                              chrome.alarms (focus-timer + keep-alive)
                                              │
                                              ▼
                              every minute: timerEngine.tick()
                                              │
                              ├─► milestone? ──► browser.notifications.create
                              ├─► completed? ──► browser.notifications.create
                              └─► update chrome.storage.local
                                              │
                              Web app polls storage or listens for broadcast
```

### Suggested split for next chat

| Piece | Scope | Files | Est. lines |
|---|---|---|---|
| A | Extension timer engine (state + alarms + drift) | new `extension/lib/timerEngine.ts` + test; modify `background.ts` | ~80 |
| B | Web app → extension command bridge | modify `messageHandler.ts`, `TimerPanel.tsx`, `useTimer.ts` | ~70 |
| C | Extension → web app state sync | modify `useTimer.ts`, `TimerPanel.tsx`, storage listeners | ~60 |
| D | Native notifications + diagnostics | modify `timerAlarm.ts`/`timerEngine.ts`, `popup.ts`, `popup.html`; permission check; test button | ~70 |

Total ~280 lines across 4 pieces. Implement one piece at a time with tests and live browser verification.

## Immediate changes already on branch

- `lib/constants.ts`: `MILESTONE_INTERVAL_SECONDS = 60`.
- `components/timer/TimerPanel.tsx`: uses `MILESTONE_INTERVAL_SECONDS` for milestone toast.
- `extension/lib/timerAlarm.ts`: uses local `MILESTONE_INTERVAL_SECONDS = 60` because extension build cannot resolve web-app `@/lib/constants` alias.
- `extension/lib/__tests__/timerAlarm.test.ts`: milestone tests updated to 60s intervals.
- `components/timer/TimerToast.tsx`: resets `lastTriggerRef` when `trigger` clears so recurring milestones fire.
- `components/timer/__tests__/TimerToast.test.tsx`: regression test for recurring same-trigger toasts.

Verification at end of this chat:
- `npx tsc --noEmit` clean.
- 45 targeted tests passing (TimerToast, TimerPanel, TimerPanel.session-summary, timerAlarm).
- `npm run build:ext` succeeds.
- Full suite remains 564/566 (2 pre-existing `globals.test.ts` dark-mode CSS failures).

## Next chat starting point

Begin **Piece A: Extension Timer Engine**. Read this memory file first, then implement `extension/lib/timerEngine.ts` with:
- `startSession(state)` / `pauseSession()` / `resetSession()`
- `tick()` called by `chrome.alarms.onAlarm`
- Keep-alive alarm while session is running
- Store session in `chrome.storage.local`
- Tests using `@webext-core/fake-browser`

Then verify `npx tsc --noEmit`, `npx vitest run extension/lib/__tests__/timerEngine.test.ts`, and `npm run build:ext`.

**Why:** This is the only architecture that guarantees native OS notifications fire even if the web app tab is closed or the service worker restarts, which is the core value proposition of FocusFlow AI.
