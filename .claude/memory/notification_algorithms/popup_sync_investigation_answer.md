# Popup / Timer Synchronization — Root-Cause Investigation

**Scope:** FocusFlow AI extension popup ↔ web-app timer state sync.  
**Investigated branch:** `fix/popup-web-app-sync` (current working tree).  
**Date:** 2026-07-10.  
**Constraint:** No code was modified; only existing source files were read.

---

## 1. Architecture Diagram — Complete Path from Timer Engine to Popup UI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Web App (Next.js dashboard, http://localhost:3000)                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  hooks/useTimer.ts  (the real timer engine)                         │   │
│  │  - requestAnimationFrame loop increments projectElapsed /           │   │
│  │    decrements subPieceRemaining every whole second                  │   │
│  │  - persists ff_active_session to localStorage every 5 s             │   │
│  │  - sends START/RESUME/PAUSE/RESET via ff:command events            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼ localStorage.setItem("ff_active_session", …) │
│                              │                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Content Script: extension/entrypoints/focusSync.content.ts         │   │
│  │  - runs on http://localhost:3000/*                                 │   │
│  │  - calls startFocusSyncPolling() every 5 s                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼ window CustomEvent "ff:command" / runtime  │
│                              │   sendMessage({ type: "SYNC_DISPLAY_STATE" })│
└──────────────────────────────┬────────────────────────────────────────────┘
                               │
                               ▼ browser.runtime.sendMessage
┌─────────────────────────────────────────────────────────────────────────────┐
│  Service Worker (extension/entrypoints/background.ts)                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  extension/lib/messageHandler.ts                                    │   │
│  │  case "SYNC_DISPLAY_STATE": stores payload as ff_display_state      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼ browser.storage.local.set({ ff_display_state })│
│                              │                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Popup: extension/entrypoints/popup.html + extension/lib/popup.ts   │   │
│  │  - initPopup() reads ff_display_state on load                       │   │
│  │  - storage.local.onChanged listener re-renders                    │   │
│  │  - renderPopup() writes text to DOM elements                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Important parallel path:** the same content script also runs `extension/entrypoints/control.content.ts`, which listens for `ff:command` / `ff:request` DOM events and forwards them to `browser.runtime.sendMessage`, and which listens for `STATE_UPDATED` messages from the service worker and re-broadcasts them as `ff:state` DOM events for the web app. This is the **command/notification bridge**, separate from the **display-state sync bridge**.

---

## 2. Complete Data Flow — Step by Step with File:Line References

| Step | File | Line(s) | What happens |
|------|------|---------|--------------|
| 1 | `hooks/useTimer.ts` | 453-562 | RAF `tick` runs while `isRunning`. Each whole second increments `projectElapsedRef` and decrements `subPieceRemainingRef`. |
| 2 | `hooks/useTimer.ts` | 495-498 | Every 5 seconds of **project elapsed time**, `persistSession` writes `ff_active_session` to `localStorage`. |
| 3 | `hooks/useTimer.ts` | 260-280 | `persistSession` serializes: `projectElapsed`, `subPieceRemaining`, `projectElapsedBaseline`, `subPieceRemainingBaseline`, `isRunning`, `targetTimeSeconds`, `allocatedMinutes`, `savedAt`. |
| 4 | `extension/entrypoints/focusSync.content.ts` | 11-17 | Content script starts and calls `startFocusSyncPolling()`. |
| 5 | `extension/lib/focusSync.ts` | 121-128 | `startFocusSyncPolling` runs `syncDisplayState()` immediately, then every 5 s via `setInterval`. |
| 6 | `extension/lib/focusSync.ts` | 102-119 | `syncDisplayState` reads `ff_active_session` from `localStorage`, builds `DisplayState`, and only sends `SYNC_DISPLAY_STATE` if the display state changed. |
| 7 | `extension/lib/focusSync.ts` | 75-83 | `buildDisplayState` derives `usedSeconds` from `session.projectElapsed` and `totalSeconds` from `session.targetTimeSeconds`. |
| 8 | `extension/lib/messageHandler.ts` | 98-106 | `handleMessage` receives `SYNC_DISPLAY_STATE`, validates payload, writes `ff_display_state` to `browser.storage.local`. |
| 9 | `extension/entrypoints/background.ts` | 31-33 | Service worker registers `runtime.onMessage` listener that delegates to `handleMessage`. |
| 10 | `extension/lib/popup.ts` | 147-154 | `initPopup` reads `ff_display_state` and calls `renderPopup`. |
| 11 | `extension/lib/popup.ts` | 137-145 | `setupStorageListener` registers `storage.local.onChanged` listener; on `ff_display_state` change it re-renders. |
| 12 | `extension/lib/popup.ts` | 41-82 | `renderPopup` writes `projectName`, `subPieceName`, `isRunning`, and `formatUsedTotal(usedSeconds, totalSeconds)` into the DOM. |

**Result:** The popup is always at least one or two polling intervals behind the web app, and the metric it shows is the **project elapsed / project target**, not the sub-piece elapsed / allocated.

---

## 3. Investigation 1: `usedSeconds` origin

`usedSeconds` is the value shown in the popup as the “used” part of the used/total card.

| File | Line | Action |
|------|------|--------|
| `extension/lib/types.ts` | 38 | `DisplayState.usedSeconds: number` declared. |
| `extension/lib/focusSync.ts` | 79 | `usedSeconds: session.projectElapsed ?? 0` — **always project elapsed time**. |
| `extension/lib/focusSync.ts` | 61-73 | `readWebAppSession()` reads `localStorage.getItem("ff_active_session")` and parses it as `WebAppSession`. |
| `hooks/useTimer.ts` | 268 | `persistSession` writes `projectElapsed: projElapsed`. |
| `hooks/useTimer.ts` | 190, 220, 225, 486-487 | `projectElapsed` is a React state variable backed by `projectElapsedRef`; the RAF loop updates it every second. |
| `hooks/useTimer.ts` | 165 | `initialProjectTime = project?.totalTimeSeconds ?? 0`. |
| `extension/lib/messageHandler.ts` | 51-54 | `isValidDisplayState` only validates that `usedSeconds` is a number. |
| `extension/lib/popup.ts` | 81 | `usedTotalEl.textContent = formatUsedTotal(state.usedSeconds, state.totalSeconds)`. |
| `extension/lib/popup.ts` | 17-20 | `formatUsedTotal` floors both values to minutes and renders `"used / total min"`. |

**Conclusion:** `usedSeconds` is always derived from the web-app's persisted `projectElapsed`, never from a sub-piece's elapsed/allocated time. For a sub-piece session the popup therefore shows the wrong numerator.

---

## 4. Investigation 2: `totalSeconds` origin

| File | Line | Action |
|------|------|--------|
| `extension/lib/types.ts` | 39 | `DisplayState.totalSeconds: number` declared. |
| `extension/lib/focusSync.ts` | 80 | `totalSeconds: session.targetTimeSeconds ?? 0` — **always project target time**. |
| `hooks/useTimer.ts` | 274 | `persistSession` writes `targetTimeSeconds: project?.targetTimeSeconds ?? 0`. |
| `hooks/useTimer.ts` | 166 | `targetTimeSeconds = project?.targetTimeSeconds ?? 0`. |
| `extension/lib/messageHandler.ts` | 51-54 | Validates `totalSeconds` is a number. |
| `extension/lib/popup.ts` | 81 | Used in `formatUsedTotal`. |

**Conclusion:** `totalSeconds` is always the project target. For a sub-piece session the popup therefore shows the wrong denominator.

---

## 5. Investigation 3: Project vs Sub-piece Decision

The decision about whether the user is in a **project-only** or **sub-piece** session is made in the web-app timer engine, but that decision is **not** propagated into the display-state sync path.

| File | Line | Action |
|------|------|--------|
| `hooks/useTimer.ts` | 356 | `const mode = subPieceId ? "sub-piece" : "project";` — decision made here. |
| `hooks/useTimer.ts` | 357-360 | `targetTimeSeconds` is chosen based on `mode`. |
| `hooks/useTimer.ts` | 363-379 | `buildActiveSessionToken` sends `mode`, `targetTimeSeconds`, `subPieceRemainingBaseline`, etc., to the extension as an `ActiveSessionToken`. |
| `extension/lib/messageHandler.ts` | 75-80 | `START_SESSION` handler receives the token and forwards it to `timerEngine.startSession`. |
| `extension/lib/timerEngine.ts` | 51-58 | `startSession` stores the token in `ff_active_session_v2` and schedules notifications. |
| `extension/lib/focusSync.ts` | 75-83 | `buildDisplayState` **ignores** `mode` / `subPieceId` / `allocatedMinutes` and always uses project fields. |

**Code path:**

```
hooks/useTimer.ts:356 mode = subPieceId ? "sub-piece" : "project"
  └─> hooks/useTimer.ts:289-314 sendExtensionCommand(START_SESSION / RESUME_SESSION)
        └─> window.browser.runtime.sendMessage OR window.dispatchEvent("ff:command")
              └─> extension/entrypoints/control.content.ts:43-49 forwards to runtime.sendMessage
                    └─> extension/entrypoints/background.ts:31-33 handleMessage
                          └─> extension/lib/messageHandler.ts:75-80 START_SESSION → timerEngine.startSession
                                └─> extension/lib/timerEngine.ts:51-58 stores in ff_active_session_v2
```

The display-state path, in contrast, is:

```
hooks/useTimer.ts:260-280 persistSession writes ff_active_session
  └─> extension/lib/focusSync.ts:102-119 syncDisplayState reads it
        └─> extension/lib/focusSync.ts:75-83 buildDisplayState (always project metrics)
              └─> SYNC_DISPLAY_STATE → ff_display_state
```

**Conclusion:** The project/sub-piece decision is made in the web-app timer engine (`useTimer.ts`), but `buildDisplayState` in `extension/lib/focusSync.ts` overrides that decision by always showing project metrics.

---

## 6. Investigation 4: Every Elapsed-Time Calculation

The following search-pattern results were found across the whole project. The table below lists the **production-relevant** occurrences that actually participate in the timer or popup sync.

| Pattern | File | Line | Purpose |
|---------|------|------|---------|
| `setInterval` | `extension/lib/focusSync.ts` | 124 | Content script polls localStorage every 5 s. |
| `setInterval` | `hooks/useScheduleWatcher.ts` | 37 | Unrelated schedule watcher. |
| `setTimeout` | `hooks/useTimer.ts` | 348 | 1 s fallback timeout for `GET_ACTIVE_SESSION` via `ff:request`/`ff:response`. |
| `setTimeout` | `lib/sound.ts` | 23 | Unrelated audio cleanup. |
| `Date.now()` | `hooks/useTimer.ts` | 104 | Drift calculation on restore: `Math.floor((Date.now() - session.savedAt) / 1000)`. |
| `Date.now()` | `hooks/useTimer.ts` | 203 | `startedAtRef` initialized at mount. |
| `Date.now()` | `hooks/useTimer.ts` | 204 | `resumedAtRef` initialized at mount. |
| `Date.now()` | `hooks/useTimer.ts` | 272 | `savedAt` written in `persistSession`. |
| `Date.now()` | `hooks/useTimer.ts` | 331 | Unique request id for `ff:request`. |
| `Date.now()` | `hooks/useTimer.ts` | 413 | `seedFromExtension` drift: `(Date.now() - token.resumedAt) / 1000`. |
| `Date.now()` | `hooks/useTimer.ts` | 575 | `startedAtRef.current = Date.now()` on first start. |
| `Date.now()` | `hooks/useTimer.ts` | 579 | `resumedAtRef.current = Date.now()` on every start/resume. |
| `Date.now()` | `hooks/useTimer.ts` | 721 | `restart()` resets both timestamps. |
| `Date.now()` | `extension/lib/timerEngine.ts` | 33 | `toToken()` initializes `startedAt`/`resumedAt`. |
| `Date.now()` | `extension/lib/timerEngine.ts` | 53 | `startSession()` initializes timestamps. |
| `Date.now()` | `extension/lib/timerEngine.ts` | 64 | `resumeSession()` updates `resumedAt`. |
| `Date.now()` | `extension/lib/timerEngine.ts` | 73 | `pauseSession()` adds active time since `resumedAt` to `elapsedActiveSeconds`. |
| `Date.now()` | `extension/lib/timerEngine.ts` | 96 | `getSessionElapsed()` adds active time since `resumedAt`. |
| `Date.now()` | `extension/lib/timerEngine.ts` | 111-116 | `restoreOnStartup()` adds drift to `elapsedActiveSeconds` and resets `resumedAt`. |
| `Date.now()` | `extension/lib/notificationEngine.ts` | 85 | `onFocusAlarm` computes `elapsedActiveTime` for complete guard. |
| `Date.now()` | `extension/lib/notificationEngine.ts` | 126, 133, 139 | Alarm scheduling: `Date.now() + remaining * 1000`. |
| `requestAnimationFrame` | `hooks/useTimer.ts` | 550, 554 | RAF loop for the live timer. |
| `elapsed =` | `extension/lib/timerEngine.ts` | 113 | `const elapsed = session.token.elapsedActiveSeconds + drift;` in `restoreOnStartup`. |
| `elapsedActiveSeconds` | `hooks/useTimer.ts` | 377 | `elapsedActiveSeconds: projectElapsedRef.current - projectElapsedBaselineRef.current` in token. |
| `elapsedActiveSeconds` | `extension/lib/timerEngine.ts` | 73, 97, 113, 115 | Extension's own accumulated active-time value. |
| `elapsedActiveSeconds` | `extension/lib/notificationEngine.ts` | 85 | Guard for complete alarm. |
| `projectElapsed` | `hooks/useTimer.ts` | dozens | Live web-app timer value (see section 3). |
| `projectElapsed` | `extension/lib/types.ts` | 24 | `ExtensionTimerState.projectElapsed` field (not directly used by popup). |
| `subPieceRemaining` | `hooks/useTimer.ts` | dozens | Live web-app countdown value (see section 3). |
| `subPieceRemaining` | `extension/lib/types.ts` | 25 | `ExtensionTimerState.subPieceRemaining` field. |

**Observations:**
- The **only** live timer loop is in `hooks/useTimer.ts` via `requestAnimationFrame`.
- The extension service worker **does not** have a live timer loop; it computes elapsed time only when asked (`getSessionElapsed`) or on restore.
- The popup **does not** compute any elapsed time; it only renders stored values.

---

## 7. Investigation 5: Does the popup own its own timer?

**NO.**

Evidence:
- `extension/lib/popup.ts` has no `setInterval`, no `setTimeout`, no `requestAnimationFrame`, no `Date.now()` calculations, and no elapsed-time arithmetic.
- `extension/lib/popup.ts:23-31` `getDisplayState()` only reads `browser.storage.local.get("ff_display_state")`.
- `extension/lib/popup.ts:137-145` only listens to `storage.local.onChanged` for `ff_display_state`.
- `extension/lib/popup.ts:41-82` `renderPopup` only writes values into DOM elements; it never mutates or computes time.
- `extension/entrypoints/popup.html` is a static markup file with no script logic except importing `popup.ts`.

The popup is a **pure display consumer** of `ff_display_state`.

---

## 8. Investigation 6: Does the Service Worker own time?

**NO.**

Evidence:
- `extension/entrypoints/background.ts` registers message and alarm listeners but does not run a timer loop.
- `extension/lib/timerEngine.ts:134` exports `tick()` as an **empty async function**: `export async function tick(): Promise<void> {}`.
- `extension/lib/timerEngine.ts:93-98` `getSessionElapsed()` computes elapsed time on demand: `elapsedActiveSeconds + (Date.now() - resumedAt) / 1000`.
- `extension/lib/timerEngine.ts:105-131` `restoreOnStartup()` computes drift once when the service worker starts.
- `extension/lib/notificationEngine.ts:62-94` `onFocusAlarm` handles focus alarms but only for notification firing; it does not drive the live timer.
- The service worker stores the session in `ff_active_session_v2` and schedules **alarms** for notifications, but it does not actively tick every second or own the live display value.

The service worker owns **notification scheduling** and **session storage**, not the live timer.

---

## 9. Investigation 7: Does the Content Script own time?

**NO.**

Evidence:
- `extension/entrypoints/focusSync.content.ts:11-17` only calls `startFocusSyncPolling()`.
- `extension/lib/focusSync.ts:121-128` uses `setInterval(..., 5000)` to poll `localStorage` and forward state; it does not compute elapsed time.
- `extension/entrypoints/control.content.ts:29-49` only forwards DOM events to runtime messages and re-broadcasts `STATE_UPDATED`.

The content script is a **passive bridge**.

---

## 10. Investigation 8: True Owner of `elapsedActiveTime`

There are three separate places that track or compute elapsed time. The authoritative one is the web-app timer engine.

### A. Web-app `useTimer.ts` — authoritative live timer

| Action | File | Line | Notes |
|--------|------|------|-------|
| Created | `hooks/useTimer.ts` | 165 | `initialProjectTime = project?.totalTimeSeconds`. |
| Created | `hooks/useTimer.ts` | 167-169 | `initialSubPieceRemaining` derived from `subPiece.allocatedMinutes * 60 - subPiece.elapsedSeconds`. |
| Updated | `hooks/useTimer.ts` | 471-507 | RAF loop adds whole seconds to `projectElapsed` and subtracts from `subPieceRemaining`. |
| Updated | `hooks/useTimer.ts` | 251-254 | Auto-complete on restore adds drift to store via `incrementProjectTime` / `incrementSubPieceTime`. |
| Updated | `hooks/useTimer.ts` | 503-506 | Each tick calls `incrementProjectTime` and `incrementSubPieceTime` on the Zustand store. |
| Consumed | `hooks/useTimer.ts` | 758-760 | Returned as `projectElapsed` and `subPieceRemaining` from the hook. |
| Consumed | `components/timer/TimerPanel.tsx` | 79-101 | Displays progress, XP, and controls. |
| Consumed | `hooks/useTimer.ts` | 260-280 | Persisted to `ff_active_session` every 5 s. |

### B. Extension `timerEngine.ts` — notification-oriented elapsed time

| Action | File | Line | Notes |
|--------|------|------|-------|
| Created | `extension/lib/timerEngine.ts` | 51-58 | `startSession` initializes `elapsedActiveSeconds: 0`. |
| Updated | `extension/lib/timerEngine.ts` | 73 | `pauseSession()` adds `(Date.now() - resumedAt) / 1000` to `elapsedActiveSeconds`. |
| Updated | `extension/lib/timerEngine.ts` | 115 | `restoreOnStartup()` adds drift to `elapsedActiveSeconds`. |
| Updated | `extension/lib/notificationEngine.ts` | 85 | `onFocusAlarm` computes `elapsedActiveTime` on complete alarm but does **not** persist it back to `elapsedActiveSeconds`. |
| Consumed | `extension/lib/timerEngine.ts` | 96-98 | `getSessionElapsed()` returns it for `GET_ACTIVE_SESSION`. |
| Consumed | `extension/lib/notificationEngine.ts` | 126, 133, 139 | Alarm scheduling uses it as `elapsed` offset. |

### C. Extension `popup.ts` — none

The popup does not own or compute elapsed time.

**Conclusion:** The true owner of elapsed active time is `hooks/useTimer.ts`. The extension's `timerEngine.ts` keeps a parallel but stale/incomplete elapsed value that is only updated on pause, resume, and startup restore.

---

## 11. Investigation 9: Trace Pause

User clicks Pause in the web app.

| # | File | Line | Action |
|---|------|------|--------|
| 1 | `hooks/useTimer.ts` | 584-593 | `pause()` sets `isRunning(false)`, cancels RAF, persists `ff_active_session` with `isRunning: false`, and sends `sendExtensionCommand("PAUSE_SESSION")`. |
| 2 | `hooks/useTimer.ts` | 289-314 | `sendExtensionCommand` dispatches `CustomEvent("ff:command", { type: "PAUSE_SESSION", token })`. |
| 3 | `extension/entrypoints/control.content.ts` | 43-49 | Listens for `ff:command`, forwards to `browser.runtime.sendMessage`. |
| 4 | `extension/entrypoints/background.ts` | 31-33 | `runtime.onMessage` listener calls `handleMessage`. |
| 5 | `extension/lib/messageHandler.ts` | 86-88 | `PAUSE_SESSION` case calls `pauseSession()`. |
| 6 | `extension/lib/timerEngine.ts` | 70-77 | `pauseSession` reads stored session, adds `(Date.now() - resumedAt) / 1000` to `elapsedActiveSeconds`, sets `isRunning: false`, stores session, and cancels notifications. |
| 7 | `extension/lib/timerEngine.ts` | 76 | `cancelNotifications(getBrowser())` clears all `focus-*` alarms. |
| 8 | `hooks/useTimer.ts` | 591 | `persistSession(false, ...)` writes `ff_active_session` with final `projectElapsed` and `subPieceRemaining`. |
| 9 | `extension/lib/focusSync.ts` | 102-119 | Within up to 5 s, next poll sends `SYNC_DISPLAY_STATE` with `isRunning: false`. |
| 10 | `extension/lib/messageHandler.ts` | 98-106 | Stores `ff_display_state` with `isRunning: false`. |
| 11 | `extension/lib/popup.ts` | 137-145 | If popup is open, `storage.local.onChanged` re-renders; otherwise next open sees paused state. |

---

## 12. Investigation 10: Trace Resume

User clicks Start/Resume in the web app.

| # | File | Line | Action |
|---|------|------|--------|
| 1 | `hooks/useTimer.ts` | 564-582 | `start()` sets `isRunning(true)`, updates `resumedAtRef.current = Date.now()`, and sends `sendExtensionCommand(isResume ? "RESUME_SESSION" : "START_SESSION")`. |
| 2 | `hooks/useTimer.ts` | 289-314 | Dispatches `ff:command` event. |
| 3 | `extension/entrypoints/control.content.ts` | 43-49 | Forwards to runtime message. |
| 4 | `extension/entrypoints/background.ts` | 31-33 | `handleMessage` invoked. |
| 5 | `extension/lib/messageHandler.ts` | 75-84 | `START_SESSION` or `RESUME_SESSION` forwarded to `timerEngine`. |
| 6 | `extension/lib/timerEngine.ts` | 60-68 | `resumeSession()` sets `isRunning: true`, `resumedAt = Date.now()`, stores session, cancels old alarms, and reschedules with `await getSessionElapsed()`. |
| 7 | `extension/lib/notificationEngine.ts` | 113-142 | `scheduleNotifications` creates new `focus-*` alarms at `Date.now() + (targetElapsed - elapsed) * 1000`. |
| 8 | `hooks/useTimer.ts` | 580 | RAF loop resumes, `tick` starts incrementing live time again. |
| 9 | `hooks/useTimer.ts` | 495-498 | Every 5 s of project elapsed time, `ff_active_session` is rewritten. |
| 10 | `extension/lib/focusSync.ts` | 102-119 | Within up to 5 s, next poll forwards `SYNC_DISPLAY_STATE` with `isRunning: true`. |
| 11 | `extension/lib/messageHandler.ts` | 98-106 | Updates `ff_display_state`. |
| 12 | `extension/lib/popup.ts` | 71-74 | Renders status as running. |

---

## 13. Investigation 11: Trace Complete

### Sub-piece complete

| # | File | Line | Action |
|---|------|------|--------|
| 1 | `hooks/useTimer.ts` | 510-523 | RAF `tick` detects `prevSubPieceRemaining > 0 && nextSubPieceRemaining === 0`. |
| 2 | `hooks/useTimer.ts` | 511-518 | Sets `isRunningRef.current = false`, cancels RAF, calls `state.completeSubPiece(projectId, subPieceId)`. |
| 3 | `hooks/useTimer.ts` | 519 | Sends `sendExtensionCommand("PAUSE_SESSION")`. |
| 4 | `hooks/useTimer.ts` | 520 | `localStorage.removeItem("ff_active_session")`. |
| 5 | `hooks/useTimer.ts` | 521 | Calls `onCompleteRef.current?.()`. |
| 6 | `extension/lib/messageHandler.ts` | 86-88 | `PAUSE_SESSION` case calls `pauseSession`. |
| 7 | `extension/lib/timerEngine.ts` | 70-77 | Adds active drift since `resumedAt` to `elapsedActiveSeconds`, sets `isRunning: false`. |
| 8 | `extension/lib/timerEngine.ts` | 76 | `cancelNotifications` clears all focus alarms. |
| 9 | `extension/lib/focusSync.ts` | 102-119 | Next poll reads `ff_active_session`; if it was removed, `readWebAppSession()` returns `null` and no `SYNC_DISPLAY_STATE` is sent. |
| 10 | `extension/lib/popup.ts` | 62-66 | If `ff_display_state` still exists, popup shows stale state; if not, shows empty state. |

### Project target complete

| # | File | Line | Action |
|---|------|------|--------|
| 1 | `hooks/useTimer.ts` | 526-546 | RAF `tick` detects `targetTimeSeconds > 0 && prevProjectElapsed < targetTimeSeconds && nextProjectElapsed >= targetTimeSeconds`. |
| 2 | `hooks/useTimer.ts` | 531-537 | Sets `isRunning = false`, `targetReached = true`, cancels RAF, calls `state.completeProject(projectId)`. |
| 3 | `hooks/useTimer.ts` | 542 | Sends `sendExtensionCommand("PAUSE_SESSION")`. |
| 4 | `hooks/useTimer.ts` | 543 | `localStorage.removeItem("ff_active_session")`. |
| 5 | `extension/lib/timerEngine.ts` | 70-77 | Same pause path as above. |
| 6 | `extension/lib/focusSync.ts` | 102-119 | Same as above: next poll sees null `ff_active_session`, no final display-state update. |

**Critical observation:** The web app removes `ff_active_session` **before** the content script has a chance to poll and forward the final completed state. The popup therefore either shows the last pre-complete state or falls into the empty state, never showing a completed card.

---

## 14. Investigation 12: Why Popup Falls Behind — Exact Sequence

Scenario: 5-minute sub-piece; web app timer reaches zero while popup is open.

Timeline (simplified, worst case with out-of-phase polling):

| Wall time | Web app state | `ff_active_session` (localStorage) | Content script poll | `ff_display_state` (storage.local) | Popup render |
|-----------|---------------|--------------------------------------|----------------------|-----------------------------------|--------------|
| T+0s | running, 4:55 remaining | saved at T+0 (5 s interval) | — | synced from T+0 | 4:55 remaining |
| T+4s | running, 4:51 remaining | stale (next save in 1 s) | poll at T+4: sees stale T+0 | unchanged | 4:55 (stale) |
| T+5s | running, 4:50 remaining | updated to T+5 | — | — | 4:55 (stale) |
| T+8s | running, 4:47 remaining | stale | poll at T+8: sees T+5 | synced to T+5 | 4:50 (stale) |
| T+10s | running, 4:45 remaining | updated to T+10 | — | — | 4:50 (stale) |
| T+295s | running, 5 s remaining | updated at T+295 | — | synced to T+295 | 0:05 remaining |
| T+300s | **finished** (0 remaining) | web app removes `ff_active_session` immediately | pending poll at T+300 | **no update sent** because `ff_active_session` is null | **still shows 0:05** |
| T+300s+ | paused/complete | null | content script reads null, no SYNC | unchanged | **still shows 0:05 or empty** |

**Code that causes the final stale popup:**

- `hooks/useTimer.ts:520` removes `ff_active_session` immediately on sub-piece completion, before any final sync.
- `hooks/useTimer.ts:543` removes `ff_active_session` immediately on project completion.
- `extension/lib/focusSync.ts:103-104` `syncDisplayState` reads `ff_active_session`; if null, it returns early and never sends a final `SYNC_DISPLAY_STATE`.
- `extension/lib/popup.ts:62-66` only falls back to empty state when `state` is null; if a stale `ff_display_state` exists, it renders it.

**Result:** The popup shows “still 8 seconds remaining” (or similar) because the web app erased its sync source before the content script could forward the final completed snapshot.

---

## 15. Components That Own Timer State

Ranked by authority (most authoritative first):

1. **`hooks/useTimer.ts`** — owns the live timer loop, React state, baseline refs, and `ff_active_session` persistence. It is the true source of truth for the user's current focus session.
2. **`lib/store/useFocusStore` (Zustand)** — owns cumulative project/sub-piece time (`totalTimeSeconds`, `elapsedSeconds`, `status`). The timer engine reads baselines from it and writes deltas back to it.
3. **`extension/lib/timerEngine.ts`** — owns the extension's copy of the session (`ff_active_session_v2`) and notification scheduling. It stores `elapsedActiveSeconds`, `isRunning`, `startedAt`, `resumedAt`. It is authoritative for notifications but not for the live UI.
4. **`extension/lib/sessionStorage.ts`** — owns the low-level read/write of `ff_active_session_v2`.
5. **`extension/lib/focusSync.ts`** — reads `ff_active_session` (web app localStorage) and derives `DisplayState`. It is a **derived/secondary** owner.
6. **`extension/lib/popup.ts`** — owns **none** of the timer state; it is a pure consumer of `ff_display_state`.

---

## 16. Components That Calculate Elapsed Time

Ranked by how actively they compute time:

1. **`hooks/useTimer.ts`** — continuous RAF-based calculation every frame; computes `projectElapsed`, `subPieceRemaining`, drift on restore, and `elapsedActiveSeconds` for the extension token.
2. **`extension/lib/timerEngine.ts`** — computes elapsed time on demand (`getSessionElapsed`) and on service-worker startup (`restoreOnStartup`).
3. **`extension/lib/notificationEngine.ts`** — computes `elapsedActiveTime` inside the complete alarm handler to guard against premature firing.
4. **`extension/lib/focusSync.ts`** — does **not** calculate elapsed time; it copies `projectElapsed` into `usedSeconds`.
5. **`extension/lib/popup.ts`** — does **not** calculate elapsed time; it formats stored values.

---

## 17. Synchronization Points

Every place where state is shared between layers:

| Sync point | From | To | File:Line | Mechanism | Frequency |
|------------|------|----|-----------|-----------|-----------|
| 1 | Web app | localStorage | `hooks/useTimer.ts:260-280` | `localStorage.setItem("ff_active_session", ...)` | Every 5 s of project elapsed time |
| 2 | localStorage | Content script | `extension/lib/focusSync.ts:61-73, 102-119` | `localStorage.getItem("ff_active_session")` | Every 5 s |
| 3 | Content script | Service worker | `extension/lib/focusSync.ts:111-114` | `browser.runtime.sendMessage({ type: "SYNC_DISPLAY_STATE", payload })` | Only when changed |
| 4 | Service worker | `browser.storage.local` | `extension/lib/messageHandler.ts:102-104` | `browser.storage.local.set({ ff_display_state: ... })` | On each `SYNC_DISPLAY_STATE` |
| 5 | `storage.local` | Popup | `extension/lib/popup.ts:137-145` | `browser.storage.local.onChanged` listener | On `ff_display_state` change |
| 6 | Web app | Service worker | `hooks/useTimer.ts:289-314` | `window.browser.runtime.sendMessage` or `ff:command` custom event | On start/pause/resume/reset/complete |
| 7 | Content script | Web app | `extension/entrypoints/control.content.ts:29-38` | `ff:state` custom event for `STATE_UPDATED` | When service worker broadcasts state |
| 8 | Web app ↔ Service worker | Web app | `hooks/useTimer.ts:316-353` | `ff:request`/`ff:response` for `GET_ACTIVE_SESSION` | On mount (1 s timeout) |
| 9 | Service worker | `browser.storage.local` | `extension/lib/sessionStorage.ts:38-45` | `ff_active_session_v2` | On start/resume/pause/restore |
| 10 | Service worker | Web app | `extension/entrypoints/control.content.ts:29-38` | `STATE_UPDATED` → `ff:state` | Currently not actively sent by the service worker for timer changes |

**Note:** The service worker does **not** push `STATE_UPDATED` messages when the timer changes; the only push path is the web app sending commands. The display-state path is entirely pull-based (polling).

---

## 18. Root Causes — Ranked Most Likely to Least Likely

### 1. Polling-based display sync (highest impact)

- `hooks/useTimer.ts:495-498` persists only every 5 s.
- `extension/lib/focusSync.ts:124` polls only every 5 s.
- The two intervals are independent and can be up to ~10 s out of phase.
- **Evidence:** Worst-case delay is ~10 s; the popup cannot be called “real-time.”

### 2. `buildDisplayState` is not mode-aware

- `extension/lib/focusSync.ts:79-80` always uses `projectElapsed` / `targetTimeSeconds`.
- For a sub-piece session, the popup should show `allocatedSeconds - subPieceRemaining` / `allocatedSeconds`, but it shows project values instead.
- **Evidence:** The existing memory file `popup-sync-issue-analysis.md:146-156` explicitly documents this bug.

### 3. Web app erases sync source before final completed state is forwarded

- `hooks/useTimer.ts:520` and `543` remove `ff_active_session` immediately on completion.
- `extension/lib/focusSync.ts:103-104` returns early when `ff_active_session` is null, so no final `SYNC_DISPLAY_STATE` is sent.
- **Result:** Popup shows stale pre-complete state or empty state, never a completed card.

### 4. `DisplayState` has no completed flag

- `extension/lib/types.ts:35-41` defines `DisplayState` with only `isRunning`.
- The popup cannot distinguish “paused” from “completed”.
- **Evidence:** `extension/lib/popup.ts:71-77` only renders `running` vs `paused`.

### 5. Extension `elapsedActiveSeconds` is not updated on complete alarm

- `extension/lib/notificationEngine.ts:82-91` fires the complete alarm and sets `session.token.isRunning = false`, but it does **not** update `elapsedActiveSeconds` to the final value.
- **Evidence:** `popup-web-app-sync-resume.md:11` documents this: “the extension's `elapsedActiveSeconds` is only updated on pause/resume, not when the complete alarm fires.”
- This matters if any future popup code tries to read `ff_active_session_v2` directly to compute live drift.

### 6. Multiple sources of truth for elapsed time

- Web app: `projectElapsed` (live RAF + store).
- Extension: `elapsedActiveSeconds` (updated only on pause/resume/restore).
- Popup: `ff_display_state.usedSeconds` (derived from web-app localStorage snapshot).
- These three can diverge after pause/resume or during fast user actions.

---

## 19. Single Source of Truth Violation?

**YES.** The web-app timer engine (`hooks/useTimer.ts`) is the intended single source of truth, but the system maintains at least three separate elapsed-time values that can diverge:

### Source A: Web-app live state

- `hooks/useTimer.ts:190` `projectElapsed` state.
- `hooks/useTimer.ts:192` `subPieceRemaining` state.
- Updated every second by the RAF loop.
- Persisted to `ff_active_session` every 5 s.

### Source B: Extension service-worker state

- `extension/lib/sessionStorage.ts:5` key `ff_active_session_v2`.
- `extension/lib/timerEngine.ts:73` `elapsedActiveSeconds` updated only on pause/resume/restore.
- `extension/lib/timerEngine.ts:85` `toToken()` can even overwrite the token with a fresh `sessionId` and `elapsedActiveSeconds: 0` when an `ExtensionTimerState` is passed in.

### Source C: Popup display state

- `extension/lib/messageHandler.ts:102-104` `ff_display_state`.
- Derived from `ff_active_session` via `extension/lib/focusSync.ts:75-83`.
- Can be up to ~10 s stale and uses project metrics even for sub-piece sessions.

### Evidence of violation

| Code | File | Line | What it shows |
|------|------|------|---------------|
| `hooks/useTimer.ts` | 260-280 | Writes `ff_active_session` independently of `ff_active_session_v2`. |
| `extension/lib/timerEngine.ts` | 51-58 | Writes `ff_active_session_v2` independently of `ff_active_session`. |
| `extension/lib/focusSync.ts` | 102-119 | Reads `ff_active_session`, not `ff_active_session_v2`, to populate the popup. |
| `extension/lib/popup.ts` | 23-31 | Reads `ff_display_state`, which is a derivative of `ff_active_session`, not the live web-app state. |
| `extension/lib/timerEngine.ts` | 134 | `tick()` is a no-op, so the extension never reconciles its own elapsed time with the web app. |

**Conclusion:** There is no single source of truth. The web-app `useTimer.ts` is the de facto authority for the user-visible timer, but the popup is fed through a slow, derived, project-only path, while the extension service worker maintains a separate, partially-updated elapsed value for notifications. This multiplicity is the root cause of the popup falling behind and showing incorrect data.

---

## References

All line numbers are based on the working-tree state at the time of this investigation.

- `hooks/useTimer.ts`
- `extension/lib/focusSync.ts`
- `extension/entrypoints/focusSync.content.ts`
- `extension/entrypoints/control.content.ts`
- `extension/lib/messageHandler.ts`
- `extension/lib/timerEngine.ts`
- `extension/lib/notificationEngine.ts`
- `extension/lib/popup.ts`
- `extension/entrypoints/popup.html`
- `extension/lib/types.ts`
- `extension/lib/sessionStorage.ts`
- `extension/entrypoints/background.ts`
- `.claude/memory/popup-sync-issue-analysis.md`
- `.claude/memory/popup-web-app-sync-resume.md`
