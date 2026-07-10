---
name: notification-engine-refactor-plan
description: Complete refactor plan for FocusFlow AI notification engine using lego-block architecture with per-stage absolute alarms.
metadata:
  node_type: memory
  type: project
  originSessionId: 94140101-7468-43f4-8f59-1c2488518ba4
---

# Notification Engine Refactor Plan

**Date:** 2026-07-08
**Status:** Plan agreed. Implementation pending.
**Related:** [[notification-engine-rebuild-spec]], [[extension-notification-dividing-pattern]], [[notification-fix-plan]], [[offscreen-notification-redesign]]

---

## 1. Why we are refactoring

Live testing showed the notification engine fires the wrong pattern:

- Start re-fires on every resume.
- Milestones repeat at the end of sessions.
- Multiple Almost messages fire.
- Complete often never fires.
- Milestone count and spacing are wrong in practice even though the schedule formula is correct.

Root cause: the engine evaluates the correct percentage-based formula against **corrupted state**. Timing, sync, schedule evaluation, and notification firing are all mixed together, and there is no single source of truth for the active session.

---

## 2. Root causes

| # | Root cause | Evidence |
|---|-----------|----------|
| 1 | `timerEngine.startSession(state)` treats every `START_TIMER` as a new session, resetting trackers and baselines. | `useTimer.ts` sends `START_TIMER` on resume too. |
| 2 | `UPDATE_TIMER_STATE` from `focusSync.ts` overwrites engine trackers every 5 seconds. | `ff_active_session` does not contain `startFired`, `lastMilestone`, `almostDoneFired`, `completeFired`. |
| 3 | Completion only fires on transition `subPieceRemaining > 0 → 0`. | If web app already synced `remaining = 0`, transition is missed. |
| 4 | Short periodic alarms (15s/30s) are throttled/coalesced by Chrome MV3. | Notifications land late and collide. |
| 5 | Timing, sync, schedule, and notification firing are mixed in `timerEngine.ts`. | No clean separation of concerns. |

---

## 3. Target architecture (lego blocks)

```
Active Session Token
        │
        ├──▶ Notification Engine  → schedule + prepared payloads
        │                              ↓
        │                         Notifier Service → OS notification
        │
        ├──▶ Timing / Sync Engine   → per-stage alarms + trackers
        │                              ↓
        │                         Service Worker   → alarm orchestration
        │
        └──▶ Web App UI           → display + command sender
```

### 3.1 Active Session Token

Single source of truth. Stored in extension storage and mirrored in web app `localStorage`.

```ts
interface ActiveSessionToken {
  projectId: string;
  subPieceId?: string;
  projectName?: string;
  subPieceName?: string;
  mode: "sub-piece" | "project";
  targetTimeSeconds: number;
  projectElapsedBaseline: number;
  subPieceRemainingBaseline?: number;
  isRunning: boolean;
  startedAt: number;              // absolute session start timestamp
  resumedAt: number;              // last resume timestamp
  elapsedActiveSeconds: number;   // accumulated active time
}
```

### 3.2 Notification Engine

Pure, side-effect-free builder.

```ts
function buildNotificationSchedule(token: ActiveSessionToken): NotificationSchedule
function prepareStartPayload(token: ActiveSessionToken): NotificationPayload
function prepareMilestonePayload(token: ActiveSessionToken, milestoneTime: number): NotificationPayload
function prepareAlmostPayload(token: ActiveSessionToken): NotificationPayload
function prepareCompletePayload(token: ActiveSessionToken, targetReached: boolean): NotificationPayload
```

Uses existing `stageScheduler.ts` for percentage math.

### 3.3 Timing / Sync Engine

Owns:
- Alarm lifecycle
- Tracker state (`startFired`, `milestoneTimesFired: Set<number>`, `almostDoneFired`, `completeFired`)
- `sessionElapsed` calculation
- Decision to fire notifications

Commands:
- `startSession(token)` — new session, reset trackers, create stage alarms
- `resumeSession()` — resume current session, preserve trackers, recreate remaining alarms
- `pauseSession()` — clear pending alarms, flush elapsed
- `resetSession()` — clear session and trackers
- `updateSession(token)` — update target/baselines without resetting trackers if same session
- `onStageAlarm(alarmName)` — fire the matching notification

### 3.4 Notifier Service

Keep existing `extension/lib/notifications.ts`:
- `notifyStart`
- `notifyMilestone`
- `notifyAlmostDone`
- `notifySessionComplete`

### 3.5 Service Worker

`background.ts`:
- Listen for commands from web app and popup.
- Store token.
- Create/clear per-stage alarms.
- On alarm, call Timing Engine.

### 3.6 Web App UI

`useTimer.ts` + `TimerPanel.tsx`:
- Build token and send commands.
- Keep RAF loop for smooth UI display only.
- Read authoritative state from extension periodically or via broadcasts.

---

## 4. Alarm strategy

**Do not use short periodic alarms.** Chrome MV3 throttles `chrome.alarms` to roughly once per minute; 15s/30s alarms are coalesced or delayed.

**Use per-stage absolute alarms instead.** Create one alarm per future stage at its exact absolute timestamp.

| Stage | Alarm name | Fires at |
|---|---|---|
| Start | immediate | On session start |
| Milestone i | `focus-milestone-{i}` | `startedAt + milestoneTime * 1000` |
| Almost | `focus-almost` | `startedAt + almostTime * 1000` |
| Complete | `focus-complete` | `startedAt + targetTimeSeconds * 1000` |

### Pause / resume

- On pause, clear all pending stage alarms.
- On resume, recompute remaining stages from `sessionElapsed` and recreate their absolute alarms.
- This avoids throttling and keeps notifications precise.

---

## 5. Implementation phases

### Phase 1 — Active Session Token + storage

- Add `ActiveSessionToken` to `extension/lib/types.ts`.
- Create `extension/lib/sessionStorage.ts`:
  - `getActiveSession()`
  - `setActiveSession(token)`
  - `clearActiveSession()`
  - Key: `ff_active_session_v2`
- Tests: `extension/lib/__tests__/sessionStorage.test.ts`

### Phase 2 — Notification Engine

- New `extension/lib/notificationEngine.ts`.
- Wrap `buildStageSchedule` and prepare payloads.
- Tests: `extension/lib/__tests__/notificationEngine.test.ts`

### Phase 3 — Timing Engine rewrite

- Rewrite `extension/lib/timerEngine.ts`:
  - Owns trackers in extension storage only.
  - Creates per-stage absolute alarms.
  - Handles pause/resume without losing trackers.
  - Fires completion when elapsed reaches target or remaining is 0.
- Tests: rewrite `extension/lib/__tests__/timerEngine.test.ts`

### Phase 4 — Service Worker commands

- Update `extension/lib/messageHandler.ts`:
  - `SET_ACTIVE_SESSION`
  - `START_SESSION`
  - `RESUME_SESSION`
  - `PAUSE_SESSION`
  - `RESET_SESSION`
  - `UPDATE_SESSION`
  - `GET_ACTIVE_SESSION`
  - Remove blind `UPDATE_TIMER_STATE` overwrite.
- Update `extension/entrypoints/background.ts` alarm routing.
- Update command tests.

### Phase 5 — Web app integration

- Update `hooks/useTimer.ts`:
  - Build token on project/sub-piece selection.
  - Send `START_SESSION` / `RESUME_SESSION` / `PAUSE_SESSION` / `RESET_SESSION`.
  - Keep RAF for UI only.
  - Read authoritative state from extension.
- Update `components/timer/TimerPanel.tsx` wiring.
- Update hook/component tests.

### Phase 6 — Remove old sync

- Retire or simplify `extension/lib/focusSync.ts`.
- Remove old `ff_active_session` shape.
- Web app pushes token changes explicitly.

### Phase 7 — Integration tests

- Simulate 1-min, 2-min, 5-min sessions.
- Include pause/resume cycles.
- Assert exact notification sequence, counts, and timing.

### Phase 8 — Live browser verification

- Build extension.
- Test real 1-min, 2-min, 5-min sub-piece sessions.
- Test project-level focus.
- Verify Start/Milestone/Almost/Complete pattern.

---

## 6. Critical invariants

- Start fires exactly once per real session.
- Each milestone fires exactly once.
- Almost fires exactly once at 82.5%.
- Complete fires exactly once at 100%.
- Pause freezes `sessionElapsed`; resume continues from frozen point.
- Reset clears everything; next start is fresh.
- Re-focus creates a new session.
- Notification Engine is pure; Timing Engine owns side effects and state.

---

## 7. Files to change

### New files
- `extension/lib/sessionStorage.ts`
- `extension/lib/notificationEngine.ts`
- `extension/lib/__tests__/sessionStorage.test.ts`
- `extension/lib/__tests__/notificationEngine.test.ts`

### Modified files
- `extension/lib/types.ts`
- `extension/lib/timerEngine.ts`
- `extension/lib/messageHandler.ts`
- `extension/entrypoints/background.ts`
- `extension/lib/notifications.ts` (minor, if payload shape changes)
- `hooks/useTimer.ts`
- `components/timer/TimerPanel.tsx`
- Related test files

### Removed or simplified
- `extension/lib/focusSync.ts` polling logic
- Old `ff_active_session` shape

---

## 8. Risk mitigation

| Risk | Mitigation |
|------|-----------|
| Web app display drifts from extension | Web app reads `GET_ACTIVE_SESSION` or listens to `STATE_UPDATED` broadcasts |
| Service worker restart mid-session | Token + trackers in `chrome.storage.local`; restore on startup |
| Extension not installed | Web app falls back to local timer; notifications skipped silently |
| Pause/resume from popup | Popup uses same commands as web app |
| Too many alarms | Maximum 1 + 12 + 1 + 1 = 15 alarms per session; Chrome alarms are cheap |

---

## 9. Next action

Begin **Phase 1: Active Session Token + storage wrapper**. It is isolated, testable, and unblocks all later phases.
