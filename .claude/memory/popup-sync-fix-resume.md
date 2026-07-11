# Popup Display Sync Fix — Resume Point

## Status: COMPLETE (2026-07-11). All 3 problems fixed, tests pass, build succeeds.

## What We Agreed

Fix all 3 popup sync problems in one piece using the plan from `.claude/memory/notification_algorithms/POPUP_DISPLAY_SYNC_FIX_PLAN.md`.

## Problems to Fix

1. **Problem 1:** Popup always shows Project timer even when Sub-piece timer is active
2. **Problem 2:** Popup drifts after pause/resume (polling lag up to ~10s)
3. **Problem 3:** Popup doesn't show "Completed" when timer finishes

## Implementation Plan (4 files to modify, 2 test files)

### 1. `extension/lib/types.ts` — Add `isCompleted` to DisplayState

```ts
export interface DisplayState {
  projectName?: string;
  subPieceName?: string;
  usedSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  isCompleted?: boolean;  // ADD THIS
}
```

### 2. `extension/lib/focusSync.ts` — Mode-aware `buildDisplayState()`

Replace current `buildDisplayState` (line 75-83) with:

```ts
export function buildDisplayState(session: WebAppSession): DisplayState {
  const isSubPieceSession = session.subPieceId !== undefined;
  const allocatedSeconds = (session.allocatedMinutes ?? 0) * 60;

  return {
    projectName: session.projectName,
    subPieceName: session.subPieceName,
    usedSeconds: isSubPieceSession
      ? allocatedSeconds - (session.subPieceRemaining ?? allocatedSeconds)
      : session.projectElapsed ?? 0,
    totalSeconds: isSubPieceSession
      ? allocatedSeconds
      : session.targetTimeSeconds ?? 0,
    isRunning: session.isRunning ?? false,
    isCompleted: !session.isRunning && (
      (isSubPieceSession && (session.subPieceRemaining ?? 1) === 0) ||
      (!isSubPieceSession && (session.targetTimeSeconds ?? 0) > 0 &&
        (session.projectElapsed ?? 0) >= session.targetTimeSeconds)
    ),
  };
}
```

Also update `displayStateChanged` (line 91-99) to include `isCompleted` in comparison.

### 3. `hooks/useTimer.ts` — Send DisplayState on state transitions (event-driven sync)

Add `sendDisplayStateUpdate()` function inside the hook that:
- Builds DisplayState from current refs/props (inline, can't import from extension)
- Sends via `window.browser.runtime.sendMessage` or `ff:command` event bridge
- Sub-piece mode: `usedSeconds = allocatedMinutes*60 - subPieceRemainingRef.current`
- Project mode: `usedSeconds = projectElapsedRef.current`

Call it after:
- `start()` — after `setIsRunning(true)` (line 580-581)
- `pause()` — after `persistSession` (line 591-592)
- `reset()` — after `localStorage.removeItem` (line 633-634)
- Sub-piece auto-complete — after `completeSubPiece` (line 518-519)
- Project target reached — after `completeProject` (line 536-537)

### 4. `extension/lib/popup.ts` — Render "Completed" state

In `renderPopup`, change the status logic to:
```ts
if (state.isCompleted) {
  statusDot.className = "status-dot completed";
  statusLabel.textContent = "ပြီးဆုံးပါပြီ (Completed)";
} else if (state.isRunning) {
  // existing running code
} else {
  // existing paused code
}
```

### 5. Tests

- `extension/lib/__tests__/focusSync.test.ts` — Add sub-piece mode, project mode, completion detection tests
- `extension/lib/__tests__/popup.test.ts` — Add "Completed" rendering test

### 6. Verification

- `npx tsc --noEmit`
- `npx vitest run extension/lib/__tests__/focusSync.test.ts`
- `npx vitest run extension/lib/__tests__/popup.test.ts`
- `npm run build:ext`

## Skill File

Updated at `.claude/skills/extension-notifications/SKILL.md` — search for "Piece 3" for full spec.

## Key Context

- Web app sends PAUSE/RESUME/START commands via `ff:command` events — piggyback SYNC_DISPLAY_STATE on same path
- Popup is a pure passive renderer — no timer logic
- `buildDisplayState` is currently always-project (the root cause of Problem 1)
- `ff_active_session` is removed on completion before content script can forward final state — `isCompleted` flag solves this
