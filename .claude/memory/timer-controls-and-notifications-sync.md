# Timer Controls ↔ Extension Notification System — Current Wiring

> This document describes the current separation between the web-app timer controls and the extension notification system, including actual code pieces. It is intended as input for brainstorming how to keep the two blocks in sync.

---

## 1. High-level separation

| Block | File | Responsibility |
|---|---|---|
| Web-app timer controls | `hooks/useTimer.ts` | Owns the visible timer, React state, RAF loop, Zustand updates, `localStorage` fallback. |
| Extension command router | `extension/lib/messageHandler.ts` | Receives commands from the web app and routes them to the timing engine. |
| Extension timing engine | `extension/lib/timerEngine.ts` | Owns the authoritative `StoredSession`, active elapsed time, trackers, and stage alarms. |
| Notification schedule | `extension/lib/stageScheduler.ts` + `extension/lib/notificationEngine.ts` | Computes milestone / almost / complete times from `targetTimeSeconds`. |
| Notification renderer | `extension/lib/notifications.ts` | Actually creates native OS notifications from prepared payloads. |

The notification system is **downstream** of the timer controls. It receives duration and active-state changes via commands; it does not push commands back to the UI.

---

## 2. Web-app timer controls (`hooks/useTimer.ts`)

### State refs used for control logic

```ts
const projectElapsedBaselineRef = useRef(init.projectElapsedBaseline);
const subPieceRemainingBaselineRef = useRef(init.subPieceRemainingBaseline);
const wasStartedRef = useRef(init.isRunning);
const startedAtRef = useRef(Date.now());
const resumedAtRef = useRef(Date.now());
```

`wasStartedRef` is the key switch that decides whether the Start button starts fresh or resumes.

### `start()` — handles both start and resume

```ts
const start = useCallback(() => {
  if (!projectId) return;
  if (subPieceId && subPieceRemainingRef.current <= 0) return;

  const isResume = wasStartedRef.current;

  if (!isResume) {
    projectElapsedBaselineRef.current = projectElapsedRef.current;
    subPieceRemainingBaselineRef.current = subPieceRemainingRef.current;
    startedAtRef.current = Date.now();
    wasStartedRef.current = true;
  }

  resumedAtRef.current = Date.now();
  setIsRunning(true);
  void sendExtensionCommand(isResume ? "RESUME_SESSION" : "START_SESSION");
}, [projectId, subPieceId]);
```

What it does:
- If `wasStartedRef.current === false` → treats click as a **fresh start**.
- If `wasStartedRef.current === true` → treats click as a **resume**.
- Updates local `isRunning`.
- Sends either `START_SESSION` or `RESUME_SESSION` to the extension.

### `pause()`

```ts
const pause = useCallback(() => {
  setIsRunning(false);
  lastTickRef.current = null;
  if (rafRef.current !== null) {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }
  persistSession(false, projectElapsedRef.current, subPieceRemainingRef.current);
  void sendExtensionCommand("PAUSE_SESSION");
}, [persistSession]);
```

What it does:
- Stops the RAF loop.
- Persists current values to `localStorage` under `ff_active_session`.
- Sends `PAUSE_SESSION` to the extension.

### `reset()`

```ts
const reset = useCallback(() => {
  setIsRunning(false);
  lastTickRef.current = null;
  accumulatedRef.current = 0;
  lastPersistRef.current = 0;
  projectTargetShownRef.current = false;
  setTargetReached(false);
  targetReachedRef.current = false;
  if (rafRef.current !== null) {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  if (!projectId) return;

  const projectDelta = projectElapsedRef.current - projectElapsedBaselineRef.current;
  const subPieceDelta = subPieceRemainingBaselineRef.current - subPieceRemainingRef.current;

  if (projectDelta > 0) {
    useFocusStore.getState().decrementProjectTime(projectId, projectDelta);
  }
  if (subPieceId && subPieceDelta > 0) {
    useFocusStore.getState().decrementSubPieceTime(projectId, subPieceId, subPieceDelta);
  }

  const baselineProjectElapsed = projectElapsedBaselineRef.current;
  const baselineSubPieceRemaining = subPieceRemainingBaselineRef.current;

  projectElapsedRef.current = baselineProjectElapsed;
  subPieceRemainingRef.current = baselineSubPieceRemaining;
  setProjectElapsed(baselineProjectElapsed);
  setSubPieceRemaining(baselineSubPieceRemaining);

  wasStartedRef.current = false;

  localStorage.removeItem(SESSION_KEY);
  void sendExtensionCommand("RESET_SESSION");
}, [projectId, subPieceId]);
```

What it does:
- Stops the timer.
- Reverts elapsed time in the Zustand store.
- Restores display to the session baseline.
- Clears `wasStartedRef` so the next Start is a fresh start.
- Sends `RESET_SESSION` to the extension.

### `sendExtensionCommand()`

```ts
async function sendExtensionCommand(
  type: "START_SESSION" | "RESUME_SESSION" | "PAUSE_SESSION" | "RESET_SESSION",
  isRunning = type === "START_SESSION" || type === "RESUME_SESSION"
) {
  if (typeof window === "undefined") return;
  const token = buildActiveSessionToken(isRunning);

  if (typeof window.browser !== "undefined") {
    try {
      await window.browser?.runtime?.sendMessage({ type, token });
      return;
    } catch {
      // fall through to event bridge
    }
  }

  window.dispatchEvent(
    new CustomEvent("ff:command", {
      detail: { type, token },
      bubbles: true,
    })
  );
}
```

What it does:
- Builds the current `ActiveSessionToken`.
- Tries direct `runtime.sendMessage` if `window.browser` exists.
- Falls back to `ff:command` event bridge so the content script can forward it.

### `buildActiveSessionToken()`

```ts
function buildActiveSessionToken(isRunning: boolean): ActiveSessionToken {
  const mode = subPieceId ? "sub-piece" : "project";
  const targetTimeSeconds =
    mode === "sub-piece"
      ? (subPiece?.allocatedMinutes ?? 0) * 60
      : (project?.targetTimeSeconds ?? 0);

  return {
    projectId: projectId!,
    subPieceId,
    projectName: project?.name,
    subPieceName: subPiece?.name,
    mode,
    targetTimeSeconds,
    projectElapsedBaseline: projectElapsedBaselineRef.current,
    ...(subPieceId && {
      subPieceRemainingBaseline: subPieceRemainingBaselineRef.current,
    }),
    isRunning,
    startedAt: startedAtRef.current,
    resumedAt: resumedAtRef.current,
    elapsedActiveSeconds: projectElapsedRef.current - projectElapsedBaselineRef.current,
  };
}
```

This token carries:
- `targetTimeSeconds` — the duration the notification schedule uses.
- `startedAt` / `resumedAt` — timestamps used for alarm scheduling.
- `elapsedActiveSeconds` — active focus time already accumulated.
- `projectElapsedBaseline` / `subPieceRemainingBaseline` — store baselines.

---

## 3. Extension command router (`extension/lib/messageHandler.ts`)

```ts
export type TimerMessage =
  | { type: "SET_ACTIVE_SESSION"; token: ActiveSessionToken }
  | { type: "START_SESSION"; token?: ActiveSessionToken }
  | { type: "RESUME_SESSION" }
  | { type: "PAUSE_SESSION" }
  | { type: "RESET_SESSION" }
  | { type: "UPDATE_SESSION"; token: ActiveSessionToken }
  | { type: "GET_ACTIVE_SESSION" };

export async function handleMessage(message: TimerMessage): Promise<unknown> {
  console.log("[messageHandler] type:", message.type);
  try {
    switch (message.type) {
      case "SET_ACTIVE_SESSION":
      case "UPDATE_SESSION": { /* ... */ }
      case "START_SESSION": {
        if (message.token && !isValidToken(message.token)) {
          return { ok: false, error: "Invalid session token" };
        }
        await startSession(message.token);
        return { ok: true };
      }
      case "RESUME_SESSION": {
        await resumeSession();
        return { ok: true };
      }
      case "PAUSE_SESSION": {
        await pauseSession();
        return { ok: true };
      }
      case "RESET_SESSION": {
        await resetSession();
        return { ok: true };
      }
      case "GET_ACTIVE_SESSION": { /* ... */ }
    }
  } catch (err) { /* ... */ }
}
```

The handler does exactly one thing: validate the token and call the matching `timerEngine` function.

---

## 4. Extension timing engine (`extension/lib/timerEngine.ts`)

### Stored session shape

```ts
export interface SessionTrackers {
  startFired: boolean;
  milestoneTimesFired: number[];
  almostDoneFired: boolean;
  completeFired: boolean;
}

export interface StoredSession {
  token: ActiveSessionToken;
  trackers: SessionTrackers;
}
```

### `startSession()`

```ts
export async function startSession(input?: ActiveSessionToken | ExtensionTimerState): Promise<void> {
  if (!input) return;
  const now = Date.now(), token = "mode" in input ? input : toToken(input);
  const session: StoredSession = {
    token: { ...token, isRunning: true, startedAt: now, resumedAt: now, elapsedActiveSeconds: 0 },
    trackers: defaultTrackers()
  };
  await setStoredSession(session);
  await fireStartNotification(session);
  await createStageAlarms(session);
}
```

- Resets trackers.
- Sets `startedAt` and `resumedAt` to now.
- Fires the Start notification immediately.
- Creates stage alarms.

### `resumeSession()`

```ts
export async function resumeSession(): Promise<void> {
  const session = await getStoredSession();
  if (!session || session.token.isRunning) return;
  session.token.isRunning = true;
  session.token.resumedAt = Date.now();
  await setStoredSession(session);
  await createStageAlarms(session);
}
```

- Sets `isRunning = true`.
- Updates `resumedAt`.
- Recreates stage alarms.

### `pauseSession()`

```ts
export async function pauseSession(): Promise<void> {
  const session = await getStoredSession();
  if (!session || !session.token.isRunning) return;
  session.token.elapsedActiveSeconds += (Date.now() - session.token.resumedAt) / 1000;
  session.token.isRunning = false;
  await setStoredSession(session);
  await clearStageAlarms();
}
```

- Adds active time since `resumedAt` to `elapsedActiveSeconds`.
- Sets `isRunning = false`.
- Clears all pending stage alarms.

### `resetSession()`

```ts
export async function resetSession(): Promise<void> {
  await clearStageAlarms();
  await clearStoredSession();
}
```

- Clears alarms and storage.

### Alarm scheduling (`createStageAlarms()`)

```ts
async function createStageAlarms(session: StoredSession): Promise<void> {
  const token = session.token, elapsed = await getSessionElapsed(), schedule = buildNotificationSchedule(token), b = getBrowser();
  for (let i = 0; i < schedule.milestoneTimes.length; i++) {
    const t = schedule.milestoneTimes[i];
    if (t > elapsed && !session.trackers.milestoneTimesFired.includes(t))
      await b.alarms.create(`focus-milestone-${i}`, { when: token.startedAt + t * 1000 });
  }
  if (schedule.almostTime > elapsed && !session.trackers.almostDoneFired)
    await b.alarms.create("focus-almost", { when: token.startedAt + schedule.almostTime * 1000 });
  if (schedule.completeTime > elapsed && !session.trackers.completeFired)
    await b.alarms.create("focus-complete", { when: token.startedAt + schedule.completeTime * 1000 });
}
```

This is the current alarm-scheduling logic. It uses:

```ts
when: token.startedAt + stageTime * 1000
```

which is **wall-clock time from the original start**. It does not account for paused time.

### Alarm handler (`onStageAlarm()`)

```ts
export async function onStageAlarm(alarmName: string): Promise<void> {
  const session = await getStoredSession();
  if (!session) return;
  const token = session.token, schedule = buildNotificationSchedule(token), b = getBrowser();
  if (alarmName.startsWith("focus-milestone-")) {
    const idx = Number(alarmName.replace("focus-milestone-", "")), t = schedule.milestoneTimes[idx];
    if (t === undefined || session.trackers.milestoneTimesFired.includes(t)) return;
    const payload = prepareMilestonePayload(token, t);
    await notifyFromPayload(b, payload);
    session.trackers.milestoneTimesFired.push(t);
  } else if (alarmName === "focus-almost") { /* ... */ }
    else if (alarmName === "focus-complete") { /* ... */ }
  await setStoredSession(session);
}
```

When an alarm fires, it:
- Looks up the stage.
- Checks the tracker to avoid duplicates.
- Builds a payload and calls `notifyFromPayload()`.
- Marks the tracker as fired.

---

## 5. Notification schedule math (`stageScheduler.ts` + `notificationEngine.ts`)

### `buildStageSchedule()`

```ts
const BASE_DURATION_SECONDS = 60;
const ALPHA = 0.75;
const MAX_MILESTONES = 20;

export function getMilestoneCount(totalDurationSeconds: number): number {
  if (!Number.isFinite(totalDurationSeconds) || totalDurationSeconds <= 0) return 0;
  const ratio = totalDurationSeconds / BASE_DURATION_SECONDS + 1;
  const n = Math.floor(ALPHA * (Math.log(ratio) / Math.log(2))) + 1;
  return Math.min(MAX_MILESTONES, Math.max(1, n));
}

export function buildStageSchedule(totalDurationSeconds: number): StageSchedule {
  // ...
  const milestoneCount = getMilestoneCount(totalDurationSeconds);
  const gap = 50 / (milestoneCount + 1);
  const milestoneTimes: number[] = [];
  for (let i = 1; i <= milestoneCount; i++) {
    const position = 25 + gap * i;
    const milestoneTime = totalDurationSeconds * (position / 100);
    milestoneTimes.push(round(milestoneTime));
  }
  const almostTime = round(totalDurationSeconds * 0.825);
  const completeTime = totalDurationSeconds;
  // ...
}
```

Given `T = targetTimeSeconds`:
- Milestone count `N = max(1, floor(0.75 × log2(T/60 + 1)) + 1)`, capped at 20.
- Milestones are evenly distributed between 25 % and 75 %.
- Almost fires at 82.5 %.
- Complete fires at 100 %.

### `buildNotificationSchedule()`

```ts
export function buildNotificationSchedule(token: ActiveSessionToken): NotificationSchedule {
  const schedule = buildStageSchedule(token.targetTimeSeconds);
  return {
    startTime: schedule.startTime,
    milestoneTimes: schedule.milestoneTimes,
    almostTime: schedule.almostTime,
    completeTime: schedule.completeTime,
  };
}
```

The schedule is purely a function of `token.targetTimeSeconds`.

---

## 6. Actual notifications (`extension/lib/notifications.ts`)

### `notifyFromPayload()` — the single firing path

```ts
export async function notifyFromPayload(
  browser: Browser,
  payload: NotificationPayload,
): Promise<void> {
  const persistent =
    payload.id.startsWith("focus-almost-") || payload.id.startsWith("focus-complete-");
  const iconUrl = getIconUrl(browser);

  await withPermission(browser, async () => {
    await browser.notifications.create(payload.id, {
      type: "basic",
      iconUrl: iconUrl ?? browser.runtime.getURL("/icon/128.png"),
      title: payload.title,
      message: suffix(payload.message, persistent),
      priority: payload.priority ?? 2,
      requireInteraction: persistent,
    });
    if (!persistent) {
      await scheduleNotificationClear(browser, payload.id, 3000);
    }
  });
}
```

- Start and milestone notifications are non-persistent (auto-clear after 3 s).
- Almost and complete notifications are persistent (`requireInteraction: true`).

### Payload preparation (`notificationEngine.ts`)

```ts
export function prepareStartPayload(token: ActiveSessionToken): NotificationPayload { /* ... */ }
export function prepareMilestonePayload(token: ActiveSessionToken, milestoneTime: number): NotificationPayload { /* ... */ }
export function prepareAlmostPayload(token: ActiveSessionToken): NotificationPayload { /* ... */ }
export function prepareCompletePayload(token: ActiveSessionToken, targetReached: boolean): NotificationPayload { /* ... */ }
```

These produce `NotificationPayload` objects with Burmese titles, English messages, and unique IDs.

---

## 7. Data-flow diagram

```
User clicks button
      │
      ▼
┌─────────────────┐
│ hooks/useTimer  │  updates local React state, RAF loop, Zustand store
│  start/pause/reset│  persists to localStorage (ff_active_session)
└────────┬────────┘
         │ sends { type, token } via window.browser.runtime.sendMessage
         │ or ff:command event bridge
         ▼
┌──────────────────────┐
│ control.content.ts   │  forwards command to extension runtime
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ messageHandler.ts    │  validates token, calls timerEngine function
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│   timerEngine.ts     │  owns ff_active_session_v2, trackers, elapsed time
│ start/resume/pause/  │  schedules / clears stage alarms
│    resetSession      │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ notificationEngine.ts│  builds schedule from targetTimeSeconds
│  + stageScheduler.ts │  prepares payloads
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│   notifications.ts   │  creates native OS notifications
│   notifyFromPayload  │
└──────────────────────┘
```

---

## 8. Current behavior matrix

| User action | Web app | Extension | Notifications |
|---|---|---|---|
| **Start** | Starts RAF, sets baselines, sends `START_SESSION` | Saves fresh token, fires Start notif, creates alarms | Start fires immediately; milestone/almost/complete alarms scheduled |
| **Pause** | Stops RAF, persists to localStorage, sends `PAUSE_SESSION` | Adds active elapsed, clears all stage alarms | No notification; pending alarms removed |
| **Resume** | Restarts RAF, sends `RESUME_SESSION` | Updates `resumedAt`, recreates only future alarms | Alarms recreated using original `startedAt` (wall-clock) — **bug** |
| **Reset** | Stops RAF, reverts store, clears localStorage, sends `RESET_SESSION` | Clears session and alarms | No notification |
| **Complete** | Web app auto-pauses when target/sub-piece hits zero | Complete alarm fires, sets `isRunning = false` | Complete notification fires |

---

## 9. Known sync issues

### Issue 1: Resume schedules alarms by original wall-clock time

`createStageAlarms()` uses:

```ts
when: token.startedAt + t * 1000
```

After a pause, the active elapsed time is less than wall-clock elapsed time. If the alarm timestamp is already in the past, Chrome fires it immediately, so notifications can arrive before the corresponding active focus time is reached.

### Issue 2: Complete is handled independently by web app and extension

The web app auto-pauses when the sub-piece reaches zero or the project target is reached. The extension fires the Complete notification when its `focus-complete` alarm fires. In a continuous run these are close, but after pauses they can drift apart.

### Issue 3: No single source of truth for "active elapsed"

- Web app computes `projectElapsed` from store + RAF delta.
- Extension computes `elapsedActiveSeconds` from stored value + `(Date.now() - resumedAt)`.
- They are only loosely coupled by the command messages; there is no periodic sync of elapsed time.

### Issue 4: Reset vs. fresh start boundary

`reset()` in the web app sets `wasStartedRef.current = false`, so the next Start sends `START_SESSION` and creates a fresh token. This is correct.

---

## 10. Open questions for brainstorming

1. Should notifications be based on **active focus time** or **wall-clock time from original start**?
2. When resuming, should the extension recompute alarm times as `Date.now() + (stageTime - elapsedActiveSeconds) * 1000`?
3. Should the web app periodically send elapsed time to the extension, or should the extension be the single source of elapsed time?
4. When the web app auto-completes (sub-piece hits zero / target reached), should it explicitly tell the extension to fire Complete instead of relying on the alarm?
5. Should `RESET_SESSION` also reset `startedAt` and `resumedAt` in any stored token, or is clearing storage enough?
6. How should the two blocks recover if a notification alarm fires while the web app is paused?
