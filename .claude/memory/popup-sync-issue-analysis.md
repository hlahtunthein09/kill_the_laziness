# Popup Web-App Sync — Issue Analysis & Solution Pattern

## Goal

Make the extension popup a **real-time mirror** of the web-app timer state.

- Project-only focus → popup shows `projectElapsed / targetTimeSeconds`
- Sub-piece focus → popup shows `subPieceElapsed / subPieceAllocated`
- When the timer hits its target, the popup must know **immediately** and render a completed state.

---

## Current Architecture

```
Web app (useTimer.ts)
  ├─ every 5s → writes ff_active_session to localStorage
  ├─ on start/pause/reset → sends START/PAUSE/RESET via ff:command bridge
  └─ on complete → sends PAUSE_SESSION, then removes ff_active_session

Content script (focusSync.content.ts)
  └─ every 5s → reads ff_active_session → sends SYNC_DISPLAY_STATE

Service worker (messageHandler.ts)
  └─ receives SYNC_DISPLAY_STATE → stores ff_display_state

Popup (popup.ts)
  ├─ on load → reads ff_display_state
  └─ on storage.local.onChanged → re-renders
```

---

## Current Code Examples

### 1. Web app persists session every 5 seconds

`hooks/useTimer.ts`

```ts
const persistSession = useCallback(
  (running: boolean, projElapsed: number, spRemaining: number) => {
    if (!projectId) return;
    const sessionData: SessionData = {
      projectId,
      subPieceId,
      projectName: project?.name,
      subPieceName: subPiece?.name,
      projectElapsed: projElapsed,
      subPieceRemaining: spRemaining,
      projectElapsedBaseline: projectElapsedBaselineRef.current,
      subPieceRemainingBaseline: subPieceRemainingBaselineRef.current,
      savedAt: Date.now(),
      isRunning: running,
      targetTimeSeconds: project?.targetTimeSeconds ?? 0,
      allocatedMinutes: subPiece?.allocatedMinutes,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  },
  [...]
);
```

### 2. Content script only polls

`extension/entrypoints/focusSync.content.ts`

```ts
export default defineContentScript({
  matches: ["http://localhost:3000/*"],
  main() {
    startFocusSyncPolling(); // 5 second interval
  },
});
```

### 3. focusSync polls localStorage every 5 seconds

`extension/lib/focusSync.ts`

```ts
export function startFocusSyncPolling(intervalMs = 5000): void {
  syncExtensionSettings();
  syncDisplayState();
  setInterval(() => {
    syncExtensionSettings();
    syncDisplayState();
  }, intervalMs);
}

export function buildDisplayState(session: WebAppSession): DisplayState {
  return {
    projectName: session.projectName,
    subPieceName: session.subPieceName,
    usedSeconds: session.projectElapsed ?? 0,        // BUG: always project time
    totalSeconds: session.targetTimeSeconds ?? 0,    // BUG: always project target
    isRunning: session.isRunning ?? false,
  };
}
```

### 4. Service worker stores display state

`extension/lib/messageHandler.ts`

```ts
case "SYNC_DISPLAY_STATE": {
  if (!isValidDisplayState(message.payload)) {
    return { ok: false, error: "Invalid display state" };
  }
  await getBrowser().storage.local.set({
    ff_display_state: message.payload,
  });
  return { ok: true };
}
```

### 5. Popup reads storage and renders

`extension/lib/popup.ts`

```ts
async function getDisplayState(): Promise<DisplayState | null> {
  const result = await getBrowser().storage.local.get(DISPLAY_STATE_KEY);
  const state = result[DISPLAY_STATE_KEY] as DisplayState | undefined;
  return state ?? null;
}

export function renderPopup(state: DisplayState | null): void {
  // ...
  usedTotalEl.textContent = formatUsedTotal(state.usedSeconds, state.totalSeconds);
}

export async function initPopup(): Promise<void> {
  const displayState = await getDisplayState();
  renderPopup(displayState);
  setupStorageListener();
  // ...
}
```

---

## Issues Found

### Issue 1 — Wrong metric in popup (project vs sub-piece)

`buildDisplayState` always uses `projectElapsed / targetTimeSeconds`, regardless of whether the user is focusing on a sub-piece or a project.

**Example with current code:**
- User focuses on sub-piece "2 minutes test" (allocated 2 min) under project "project testing" (target 50 min).
- Web app shows sub-piece elapsed 46s / allocated 2m.
- Popup shows `45 / 50 min` (project elapsed / project target).

This is incorrect. Popup should show `46 / 2 min` (or `0:46 / 2:00`) for the sub-piece.

### Issue 2 — Polling delay makes "mirror" not real-time

The web app persists `ff_active_session` every 5 seconds. The content script polls `localStorage` every 5 seconds. These two intervals are independent and can be out of phase.

**Worst-case delay:** ~10 seconds between a timer state change in the web app and the popup reflecting it.

When the timer hits its target, the web app immediately sends `PAUSE_SESSION` to the extension and removes `ff_active_session`. But the popup only learns about this after the next content-script poll (up to 5 seconds later), or it may briefly show stale state.

### Issue 3 — No completed state in popup

The `DisplayState` interface has no `isCompleted` flag. The popup can only distinguish `isRunning: true` (Focusing) from `isRunning: false` (Paused). There is no UI for "Completed".

### Issue 4 — Web app does not push display-state changes

The web app already uses the `ff:command` / `ff:request` bridge (`control.content.ts`) to send timer commands to the extension immediately. But it does **not** push display-state changes over the same bridge. Display state is left to the slow polling path.

---

## Desired Solution Pattern

### Pattern: Event-driven display sync with mode-aware rendering

The web app should **push** display-state changes to the extension whenever the timer state changes, instead of relying on polling. The polling interval should remain only as a fallback.

### Step 1 — Extend DisplayState with a completion flag

`extension/lib/types.ts`

```ts
export interface DisplayState {
  projectName?: string;
  subPieceName?: string;
  usedSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  isCompleted: boolean;
}
```

### Step 2 — Make buildDisplayState mode-aware

`extension/lib/focusSync.ts`

```ts
export function buildDisplayState(session: WebAppSession): DisplayState {
  const isSubPiece =
    !!session.subPieceId && (session.allocatedMinutes ?? 0) > 0;
  const allocatedSeconds = (session.allocatedMinutes ?? 0) * 60;

  const usedSeconds = isSubPiece
    ? Math.max(0, allocatedSeconds - (session.subPieceRemaining ?? 0))
    : (session.projectElapsed ?? 0);

  const totalSeconds = isSubPiece
    ? allocatedSeconds
    : (session.targetTimeSeconds ?? 0);

  const isCompleted =
    !session.isRunning && totalSeconds > 0 && usedSeconds >= totalSeconds;

  return {
    projectName: session.projectName,
    subPieceName: session.subPieceName,
    usedSeconds,
    totalSeconds,
    isRunning: session.isRunning ?? false,
    isCompleted,
  };
}
```

### Step 3 — Web app pushes display-sync events

`hooks/useTimer.ts`

Add a helper:

```ts
function notifyDisplaySyncNeeded() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("ff:display-sync", { bubbles: true })
  );
}
```

Call it after every `persistSession`:

```ts
const persistSession = useCallback(
  (running: boolean, projElapsed: number, spRemaining: number) => {
    // ... existing localStorage.setItem ...
    notifyDisplaySyncNeeded();
  },
  [...]
);
```

Call it on completion **before** removing `ff_active_session`, so the content script can read the final completed state:

```ts
// Auto-complete sub-piece when it hits zero
if (subPieceId && prevSubPieceRemaining > 0 && nextSubPieceRemaining === 0) {
  // ... stop timer, complete sub-piece, persist final state ...
  persistSessionRef.current(false, nextProjectElapsed, 0);
  notifyDisplaySyncNeeded();
  void sendExtensionCommand("PAUSE_SESSION");
  localStorage.removeItem(SESSION_KEY);
  onCompleteRef.current?.();
  return;
}
```

Do the same for project-target completion.

### Step 4 — Content script listens for ff:display-sync

`extension/lib/focusSync.ts`

```ts
export function startFocusSyncPolling(intervalMs = 5000): void {
  syncExtensionSettings();
  syncDisplayState();

  window.addEventListener("ff:display-sync", () => {
    void syncDisplayState();
  });

  setInterval(() => {
    syncExtensionSettings();
    syncDisplayState();
  }, intervalMs);
}
```

This makes the popup update within milliseconds of a timer change, while keeping the 5-second poll as a safety net.

### Step 5 — Popup renders completed state

`extension/lib/popup.ts`

```ts
if (state.isCompleted) {
  statusDot.className = "status-dot completed";
  statusLabel.textContent = "အပြီးသတ်ပါပြီ (Completed)";
} else if (state.isRunning) {
  statusDot.className = "status-dot running";
  statusLabel.textContent = "အာရုံစိုက်နေသည် (Focusing)";
} else {
  statusDot.className = "status-dot paused";
  statusLabel.textContent = "ခဏရပ်ထားသည် (Paused)";
}
```

Add a CSS class for completed state in `popup.html`:

```css
.status-dot.completed {
  background-color: #34d399; /* emerald-400 */
}
```

---

## Files Involved

1. `extension/lib/types.ts` — add `isCompleted` to `DisplayState`
2. `extension/lib/focusSync.ts` — mode-aware `buildDisplayState`, listen for `ff:display-sync`
3. `extension/entrypoints/focusSync.content.ts` — no change needed if `startFocusSyncPolling` handles the event
4. `hooks/useTimer.ts` — dispatch `ff:display-sync` after persist and on completion
5. `extension/lib/popup.ts` — render `isCompleted` state
6. `extension/entrypoints/popup.html` — completed status dot style
7. `extension/lib/__tests__/focusSync.test.ts` — update `buildDisplayState` tests
8. `extension/lib/__tests__/popup.test.ts` — add completed-state test

---

## Acceptance Criteria

- [ ] Sub-piece focus: popup shows sub-piece elapsed / allocated.
- [ ] Project-only focus: popup shows project elapsed / target.
- [ ] Web-app timer change is reflected in popup within ~1 second, not 5–10 seconds.
- [ ] When sub-piece or project target is reached, popup shows completed state immediately.
- [ ] All existing tests still pass.
- [ ] `npx tsc --noEmit` is clean.
- [ ] `npm run build:ext` succeeds.
