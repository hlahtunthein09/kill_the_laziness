---
name: notification-engine-rewrite-resume
description: Resume point for rewriting the extension notification engine to follow the Universal Dynamic Notification System Algorithm.md exactly.
metadata:
  node_type: memory
  type: project
---

# Notification Engine Rewrite — Resume Point

**Date:** 2026-07-09
**Status:** User provided `Universal_Dynamic_Notification_System_Algorithm.md` and requested a full engine rewrite following it exactly. Context limit reached; work continues in next chat.

## Source of truth algorithm file

`d:\vibe_code_tour\kill_the_laziness\.claude\memory\notification_algorithms\Universal_Dynamic_Notification_System_Algorithm.md`

Key rules:
- Start fires immediately at `0%`.
- Milestones are inside `25% → 75%` only.
- Milestone count is dynamic: `N = max(1, floor(0.75 × log2(T / 60 + 1)) + 1)`, capped at `20`.
- Milestone positions: `gap = 50 / (N + 1)`, `position(i) = 25 + gap × i`, `milestoneTime(i) = T × position(i) / 100`.
- Almost fires once at `82.5%`: `almostTime = T × 0.825`.
- Complete fires only when timer actually finishes: `completeTime = T`.
- No hardcoded tables.

## Files already analyzed

1. `extension/lib/stageScheduler.ts` — hard-coded milestone count table is the main violation.
2. `extension/lib/notificationEngine.ts` — schedule shape matches the MD file; payload text is hard-coded but user said templates are not the focus.
3. `extension/lib/notifications.ts` — legacy hard-coded `notifyStart`/`notifyMilestone`/`notifyAlmostDone`/`notifySessionComplete` functions still exist alongside the new payload system.
4. `extension/lib/timerEngine.ts` — drives notifications through `notificationEngine` + `notifyFromPayload`; pause/resume alarm scheduling bug exists but user wants engine rewrite first, then syncing.
5. `extension/lib/sessionStorage.ts` — stores `StoredSession` under `ff_active_session_v2`.
6. `extension/lib/types.ts` — `ActiveSessionToken` and `ExtensionTimerState`.
7. `extension/lib/messageHandler.ts` — routes commands to `timerEngine`.
8. `extension/entrypoints/background.ts` — wires alarms and messages.
9. `hooks/useTimer.ts` — builds `ActiveSessionToken` and sends commands.
10. `lib/notifications.ts` — web-app templates, not extension engine.

## Status

Pieces A–E complete (2026-07-09):
- A: `extension/lib/stageScheduler.ts` uses the logarithmic milestone-count formula and exact MD milestone-position math.
- B: legacy `notifyMilestone` removed.
- C: legacy `notifyStart` removed.
- D: legacy `notifyAlmostDone` removed.
- E: legacy `notifySessionComplete` removed.

The extension notification engine now follows the Universal Dynamic Notification System Algorithm with no hard-coded milestone tables and no legacy hard-coded notification paths. `notifyFromPayload` is the single focus-session firing path.

## Verification

- `npx tsc --noEmit` ✅
- `npx vitest run extension/lib/__tests__/stageScheduler.test.ts extension/lib/__tests__/notificationEngine.test.ts extension/lib/__tests__/notifications.test.ts extension/lib/__tests__/timerEngine.test.ts extension/lib/__tests__/integration.test.ts` — 53/53 ✅

## Next step

None for this rewrite. Out-of-scope items (pause/resume/reset syncing, `timerEngine.ts:createStageAlarms` alarm bug, UI/toast changes) remain deferred.

## Explicitly out of scope for this piece

- Pause/resume/reset syncing errors.
- Alarm scheduling bug in `timerEngine.ts:createStageAlarms`.
- UI/toast changes.

## Related memories

- [[extension-notification-dividing-pattern]]
- [[notification-engine-rebuild-spec]]
