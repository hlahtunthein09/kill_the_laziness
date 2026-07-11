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
- Popup Web-App Sync Piece 1 — Backend sync path (`ff_display_state` from web-app `ff_active_session`)
- Popup Web-App Sync Piece 2 — Popup UI (reads `ff_display_state`, renders used/total card)

## Current Focus: Popup Web-App Sync — Piece 3 (Bugfix)

Fix 3 problems: popup always shows Project timer (should branch by mode), drifts after pause/resume (needs event-driven sync), and doesn't show "Completed".

See `.claude/memory/notification_algorithms/POPUP_DISPLAY_SYNC_FIX_PLAN.md` and `.claude/memory/notification_algorithms/popup_sync_root_cause_analysis.md`.

### Architecture
- Web app owns authoritative live state in `localStorage` key `ff_active_session`.
- Content script (`focusSync.content.ts`) polls web-app `localStorage` and sends `SYNC_DISPLAY_STATE` to the service worker.
- Service worker stores display-only state under `ff_display_state`.
- Popup reads `ff_display_state` and renders a simple used/total card.
- `ff_display_state` must remain completely separate from `ff_active_session_v2` (notification/timer engine).
- **NEW:** Event-driven sync — web app pushes DisplayState on every state transition (start/pause/resume/complete), not just via polling.

## Current Piece: Piece 3 — Mode-Aware Display + Event-Driven Sync + Completion

### Goal
Fix `buildDisplayState()` to branch by mode (sub-piece vs project), add `isCompleted` to `DisplayState`, and push DisplayState on state transitions for instant sync.

### Files to modify
1. **`extension/lib/types.ts`**:
   - Add `isCompleted?: boolean` to `DisplayState` interface.

2. **`extension/lib/focusSync.ts`**:
   - Rewrite `buildDisplayState()` to be mode-aware:
     - If `session.subPieceId` exists → sub-piece mode: `usedSeconds = allocatedMinutes*60 - subPieceRemaining`, `totalSeconds = allocatedMinutes*60`
     - Otherwise → project mode: `usedSeconds = projectElapsed`, `totalSeconds = targetTimeSeconds`
   - Add `isCompleted: !session.isRunning && session.subPieceRemaining === 0` (or similar completion detection).
   - Export `buildDisplayState` so web app can use it.

3. **`hooks/useTimer.ts`**:
   - On every state transition (start/pause/resume/complete), build DisplayState from current session and send `SYNC_DISPLAY_STATE` to the extension via the existing `ff:command` / `browser.runtime.sendMessage` path.
   - This provides instant sync; the 5s polling remains as fallback.

4. **`extension/lib/popup.ts`**:
   - Render "Completed" (Burmese: "ပြီးဆုံးပါပြီ") when `isCompleted` is true.
   - Keep existing rendering for running/paused states.

5. **`extension/lib/__tests__/focusSync.test.ts`**:
   - Test mode-aware `buildDisplayState()`:
     - Sub-piece session → correct usedSeconds/totalSeconds from sub-piece fields
     - Project session → correct usedSeconds/totalSeconds from project fields
     - Completion detection → isCompleted true when timer finished
   - Test that `SYNC_DISPLAY_STATE` is sent with correct payload.

6. **`extension/lib/__tests__/popup.test.ts`**:
   - Test "Completed" rendering when `isCompleted` is true.
   - Test mode-aware display (sub-piece vs project values).

### Implementation notes
- Do NOT add timer countdown or elapsed calculation inside the popup. Popup is a pure passive renderer.
- The web app already sends `PAUSE_SESSION`/`RESUME_SESSION` commands. Piggyback `SYNC_DISPLAY_STATE` onto the same message path.
- `buildDisplayState()` must be exported from `focusSync.ts` for use by `useTimer.ts`.
- `isCompleted` detection: session is not running AND remaining time is 0 (or session was removed).

### Test strategy
- `npx tsc --noEmit`
- `npx vitest run extension/lib/__tests__/focusSync.test.ts`
- `npx vitest run extension/lib/__tests__/popup.test.ts`
- `npm run build:ext`

## Next Pieces
After Piece 3, verify popup in live browser and merge to main.

