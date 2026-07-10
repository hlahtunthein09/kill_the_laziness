---
name: notification-sync-solution-plan
description: Solution plan for synchronizing the extension Timer Engine and Notification Engine per Notification_Synchronization_Specification_v2.md.
metadata:
  type: project
---

# Notification Synchronization Implementation Plan

**Source spec:** `.claude/memory/notification_algorithms/Notification_Synchronization_Specification_v2.md`

**Status:** Spec analyzed; implementation not started. Next chat resumes from this plan.

## Core design from spec

- **Timer Engine owns time.** Extension notification code must never calculate timing from `startedAt` or wall-clock elapsed.
- **Notification Engine owns scheduling only.** It reacts to Timer Engine state transitions: Start, Pause, Resume, Reset, Complete.
- **Every fresh Start creates a new session** with a unique `sessionId`.
- **Alarms are disposable:** cancel all on Pause; create brand-new ones on Resume.
- **Resume formula:**
  ```text
  remaining = targetElapsedTime - elapsedActiveTime
  if remaining <= 0 → skip
  alarmTime = Date.now() + remaining
  ```
- **Alarm validation:** every alarm carries `sessionId`, `notificationType`, `targetElapsedTime`. On fire, discard if `alarm.sessionId != currentSession.sessionId` or timer is not Running.
- **Notifications fire only while Running.**
- **Reset destroys everything:** alarms, session, trackers.
- **Complete fires only when `elapsedActiveTime >= totalDuration`.**

## Current-code conflicts

1. `timerEngine.ts:createStageAlarms` uses `token.startedAt + t * 1000` (wall-clock), not remaining active time.
2. `resumeSession()` recreates alarms from original `startedAt`.
3. No `sessionId` in `ActiveSessionToken`, `StoredSession`, or alarm names.
4. `onStageAlarm` does not validate `sessionId` or Running state.
5. `useTimer.ts` auto-pauses on complete without telling the extension to fire Complete.
6. `restoreOnStartup()` is empty; extension restart loses alarms.
7. `SET_ACTIVE_SESSION` calls `startSession()` and resets elapsed time, destroying restored session state.

## Implementation steps

### Step 1 — Add sessionId
- Add `sessionId: string` to `ActiveSessionToken` (`extension/lib/types.ts`).
- Add `sessionId` to `StoredSession` via token.
- Web app generates `sessionId` on fresh start in `hooks/useTimer.ts`, persists it in `ff_active_session`, and sends it with every command.
- `timerEngine.ts` `startSession` uses supplied `sessionId` or generates one.

### Step 2 — Rewrite alarm scheduling
- Change `createStageAlarms` in `timerEngine.ts` to:
  ```ts
  const elapsed = await getSessionElapsed();
  const when = Date.now() + Math.max(0, (targetElapsedTime - elapsed) * 1000);
  ```
- Alarm names include sessionId, type, and targetElapsedTime, e.g. `focus-${sessionId}-milestone-${targetElapsedTime}`.

### Step 3 — Validate every alarm
- In `onStageAlarm`, parse alarm name.
- If `sessionId` ≠ current session → discard.
- If `token.isRunning === false` → discard.
- For Complete, also verify `getSessionElapsed() >= token.targetTimeSeconds`.

### Step 4 — Add COMPLETE_SESSION command
- Add `COMPLETE_SESSION` to `TimerMessage` in `messageHandler.ts`.
- Route to `timerEngine.completeSession()`.
- `completeSession()` fires Complete notification once, cancels remaining alarms, marks `completeFired`, sets `isRunning = false`.
- Web app calls this in `useTimer.ts` when sub-piece reaches 0 or project target is reached (instead of only `PAUSE_SESSION`).

### Step 5 — Implement restoreOnStartup
- Read stored session.
- If present, Running, and not complete, recalculate remaining alarms using `getSessionElapsed()`.

### Step 6 — Fix SET_ACTIVE_SESSION
- Treat `SET_ACTIVE_SESSION` as `updateSession` when `sessionId` matches; otherwise call `startSession`.

### Step 7 — Update tests
- `extension/lib/__tests__/timerEngine.test.ts` — new alarm timestamps, sessionId validation, resume recalculation.
- `extension/lib/__tests__/integration.test.ts` — pause/resume acceptance scenarios.
- `extension/lib/__tests__/notificationEngine.test.ts` — include `sessionId` in tokens if payload IDs change.
- `hooks/__tests__/useTimer.test.tsx` — assert `sessionId` sent and `COMPLETE_SESSION` dispatched.

## Verification targets

- `npx tsc --noEmit`
- `npx vitest run extension/lib/__tests__/stageScheduler.test.ts extension/lib/__tests__/notificationEngine.test.ts extension/lib/__tests__/notifications.test.ts extension/lib/__tests__/timerEngine.test.ts extension/lib/__tests__/integration.test.ts hooks/__tests__/useTimer.test.tsx`
- Manual browser test: start a short sub-piece, pause, wait, resume, verify notifications continue from remaining active time.

## Out-of-scope (remains deferred)

- Web-app milestone/toast changes.
- Content-script polling redesign.

## Related memories

- [[notification-engine-rewrite-resume]]
- [[extension-notification-dividing-pattern]]
- [[timer-controls-and-notifications-sync]]
