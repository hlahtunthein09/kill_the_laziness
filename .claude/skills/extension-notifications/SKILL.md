# Master Skill: Browser Extension & Native Notifications

## Purpose
Build and maintain the WXT Manifest V3 browser extension for off-screen focus enforcement, timer state ownership, and native OS notifications.

## Scope
- WXT project setup, build, and manifest
- Background service worker (`background.ts`)
- Timer engine (`extension/lib/timerEngine.ts`)
- Message handler (`extension/lib/messageHandler.ts`)
- Content scripts: `control.content.ts`, `focusSync.content.ts`, `warn.content.ts`
- Popup UI (`popup.html`, `popup.ts`)
- Native notifications (`extension/lib/notifications.ts`)
- Anti-distraction: tab monitoring, redirect, warn overlay
- Storage/sync helpers for extension state

## Key Files
- `wxt.config.ts`
- `extension/entrypoints/background.ts`
- `extension/entrypoints/control.content.ts`
- `extension/entrypoints/focusSync.content.ts`
- `extension/entrypoints/warn.content.ts`
- `extension/entrypoints/popup.html`
- `extension/lib/popup.ts`
- `extension/lib/timerEngine.ts`
- `extension/lib/messageHandler.ts`
- `extension/lib/notifications.ts`
- `extension/lib/storage.ts`
- `extension/lib/sessionStorage.ts`
- `extension/lib/focusSync.ts`
- `extension/lib/redirect.ts`
- `extension/lib/urlChecker.ts`
- `extension/lib/warnOverlay.ts`
- `extension/lib/types.ts`
- `extension/lib/notificationEngine.ts`

## Architecture Conventions

### WXT & Manifest
- Use WXT file-based entrypoints under `extension/entrypoints/`.
- Permissions in `wxt.config.ts`: `storage`, `tabs`, `alarms`, `notifications`, `scripting`, `declarativeNetRequest`, `activeTab`.
- Use dynamic `import("wxt/browser")` in content scripts; do not use `require()`.

### Off-Screen Notification Architecture
- The extension service worker is the **source of truth** for the active focus session when the extension is installed.
- Web app sends commands via `window.browser.runtime.sendMessage`.
- `messageHandler.ts` routes commands to the timing engine.
- Engine owns state in `chrome.storage.local`, schedules per-stage `chrome.alarms`, and fires notifications.
- Engine broadcasts `STATE_UPDATED` after every mutation; `control.content.ts` forwards it as `ff:state` CustomEvent.
- Web app listens to `ff:state` and seeds display from `GET_ACTIVE_SESSION`.

### Native Notifications
- All notifications go through `extension/lib/notifications.ts`.
- Check `browser.notifications.getPermissionLevel()` before creating.
- Use unique IDs (`nextId(prefix)`), `type: "basic"`, app icon URL, Burmese title, English message.
- Notification types: `notifyStart`, `notifyMilestone`, `notifyAlmostDone`, `notifySessionComplete`, `notifyScheduleDue`, `notifyDistractionBlocked`.
- Use `requireInteraction: true` so notifications persist in Action Center.

### Anti-Distraction
- Default forbidden URL fragments: YouTube Shorts, Instagram Reels, TikTok, Facebook Reels, Twitter, Reddit, Netflix.
- Strict mode: redirect to `extension/blocked.html`.
- Warn mode: inject calming overlay via `warn.content.ts`.
- Always log the attempt and notify.

## Implementation Checklist

1. Read `.claude/memory/extension-architecture.md`, `.claude/memory/sync-protocol.md`, `.claude/memory/notification-engine-refactor-plan.md`, `.claude/memory/extension-notification-dividing-pattern.md`.
2. Use `@webext-core/fake-browser` for extension tests.
3. Store durations in seconds; prefix storage keys with `ff_`.
4. Keep service worker listener registration synchronous in `defineBackground` main.
5. Recreate stage alarms on startup if a running session exists.
6. Keep a `ff-keep-alive` alarm while session is running.
7. Cap drift at `MAX_DRIFT_SECONDS` (60 minutes).

## Testing Strategy
- Extension tests use Vitest + `@webext-core/fake-browser`.
- Reset `fakeBrowser` state before each test.
- Test alarm lifecycle, state transitions, drift cap, notification permission handling, and message routing.
- Test content scripts by dispatching the events/messages they listen for.
- Build the extension after changes: `npm run build:ext`.
- Run targeted tests: `npx vitest run extension/lib/__tests__`.
- Run `npx tsc --noEmit`.

## Completed Pieces
- B1 — Stage Scheduler Module
- B2 — Integrate Stage Scheduler into timerEngine
- B3 — Save State Before Notification + Duplicate Tests
- B4 — Strict Pattern Adherence Fix
- Start notification fires once per session only
- Notification Fix Plan Piece 1 — Remove TimerToast
- Notification Fix Plan Piece 2a — Web app sync schedule inputs to extension
- Notification Fix Plan Piece 2b — Extension handle schedule input updates
- Notification Fix Plan Piece 3 — Pause extension on web-app completion
- Rebuild Piece 1 — Types: baseline + tracker fields
- Rebuild Piece 2 — useTimer baselines
- Rebuild Piece 3 — stageScheduler percentages
- Rebuild Piece 4a/4b — timerEngine trackers + baselines
- Rebuild Piece 5 — focusSync + messageHandler baselines
- Rebuild Piece 6 — TimerPanel completed status
- Refactor Phase 1 — Active Session Token + sessionStorage.ts
- Refactor Phase 2 — Pure Notification Engine
- Refactor Phase 3a — Timing Engine core
- Refactor Phase 3b — Timing Engine alarms + notification firing
- Refactor Phase 4a — Message Handler commands
- Refactor Phase 4b — Background alarm routing
- Refactor Phase 5a — useTimer sends new extension commands
- Refactor Phase 5b — TimerPanel wiring
- Refactor Phase 5c — Popup + focusSync cleanup
- Refactor Phase 6 — Remove old sync remnants
- Refactor Phase 7 — Integration tests
- Synchronization v2 Piece 1 — Session ID plumbing
- Synchronization v2 Piece 2 — Alarm scheduler ownership + re-focus duration fix
- Synchronization v2 Piece 3 — Resume recalculation hardening
- Synchronization v2 Piece 4 — Alarm validation + no-fire rules

## Current Focus: Notification Engine Synchronization v2

Implement `.claude/memory/notification_algorithms/Notification_Synchronization_Specification_v2.md`:
- Timer Engine owns time; Notification Engine owns scheduling.
- Every alarm carries `sessionId`, `notificationType`, `targetElapsedTime`.
- Resume recalculates alarms with `Date.now() + remaining`.
- Validate `sessionId` and timer state before every notification.
- Complete fires only when `elapsedActiveTime >= totalDuration`.
- Fix re-focus duration calculation so notifications schedule against remaining session time.

## Current Piece: Piece 4 — Alarm Validation + No-Fire Rules

### Goal
Implement the alarm handler that parses alarm names, validates `sessionId` and timer state, and fires notifications only when allowed. Route `focus-*` alarms from the background to this handler.

### Files to modify
1. `extension/lib/notificationEngine.ts` — add `onFocusAlarm(browser: Browser, alarmName: string): Promise<void>`:
   - Parse alarm name: `focus-{sessionId}-{type}-{targetElapsed}` (milestones include index before targetElapsed).
   - Read current stored session.
   - If no session or `session.token.sessionId !== alarm.sessionId`, discard alarm silently.
   - If `session.token.isRunning === false`, discard alarm silently.
   - If `type === "milestone"`, fire milestone notification for that targetElapsed (if not already fired) and update tracker.
   - If `type === "almost"`, fire almost notification (if not already fired) and update tracker.
   - If `type === "complete"`, fire complete notification (if not already fired) and update tracker; set `session.token.isRunning = false`.
   - Persist updated trackers after firing.
   - Keep `notifyFromPayload` calls going through `notifications.ts`.
2. `extension/entrypoints/background.ts` — route `focus-*` alarms to `onFocusAlarm` instead of `onStageAlarm`.
3. `extension/lib/timerEngine.ts` — remove or deprecate `onStageAlarm` export (it is replaced by `onFocusAlarm`). If other tests still reference it, keep a stub that does nothing.
4. `extension/lib/__tests__/notificationEngine.test.ts` — add tests:
   - Valid milestone alarm fires notification and updates tracker.
   - Valid almost alarm fires once.
   - Valid complete alarm fires once and pauses session.
   - Old `sessionId` alarm is ignored.
   - Alarm received while paused is ignored.
   - Duplicate alarm is ignored (tracker already fired).
5. `extension/lib/__tests__/background.test.ts` — update to assert `focus-*` alarms route to `onFocusAlarm`.

### Implementation notes
- Alarm name parsing must handle milestone index: `focus-{sessionId}-milestone-{idx}-{targetElapsed}`.
- For complete, do not validate `elapsed >= duration` yet (that is Piece 5); just check tracker and running state.
- The handler should be stateless: it reads current session and acts only if valid.

### Test strategy
- `npx tsc --noEmit`
- `npx vitest run extension/lib/__tests__/notificationEngine.test.ts`
- `npx vitest run extension/lib/__tests__/background.test.ts`
- `npx vitest run extension/lib/__tests__/timerEngine.test.ts`

## Next Pieces
5. Complete at 100% + restore on startup
6. Acceptance scenario + re-focus tests

