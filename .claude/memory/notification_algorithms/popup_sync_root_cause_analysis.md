# Popup Sync Root Cause Analysis

## Summary

The extension popup is not the source of truth for time. It is supposed to mirror the web app Timer Engine state exactly.

Current state:
- The web app writes active session data to `localStorage` under `ff_active_session`.
- The extension content script polls that snapshot and sends a simplified display payload to the background.
- The background stores that payload in `browser.storage.local` as `ff_display_state`.
- The popup reads `ff_display_state` and renders the UI.

However, the current sync path builds the popup display from the wrong session fields.
That causes the popup to show project-level timing instead of sub-piece timing, and it introduces visible desynchronization after pause/resume.

## Full trace from Timer Engine to popup

### 1. Timer Engine writes the session snapshot

In `hooks/useTimer.ts`, the web app persists a session snapshot at `ff_active_session`:

```ts
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
```

This snapshot contains both:
- project-level fields: `projectElapsed`, `targetTimeSeconds`
- sub-piece-specific fields: `subPieceRemaining`, `allocatedMinutes`

### 2. Content script polls web app localStorage

File: `extension/entrypoints/focusSync.content.ts`

```ts
export default defineContentScript({
  matches: ["http://localhost:3000/*"],
  main() {
    startFocusSyncPolling();
  },
});
```

That calls `startFocusSyncPolling()` in `extension/lib/focusSync.ts`.

### 3. `extension/lib/focusSync.ts` reads the session

The content script reads the raw session with:

```ts
export function readWebAppSession(): WebAppSession | null {
  const raw = localStorage.getItem(WEB_APP_SESSION_KEY);
  return parsed as WebAppSession;
}
```

`WebAppSession` is defined as:

```ts
export interface WebAppSession {
  projectId?: string;
  projectName?: string;
  subPieceId?: string;
  subPieceName?: string;
  projectElapsed?: number;
  subPieceRemaining?: number;
  targetTimeSeconds?: number;
  allocatedMinutes?: number;
  isRunning?: boolean;
  savedAt?: number;
}
```

### 4. `buildDisplayState()` transforms it for the popup

Current implementation in `extension/lib/focusSync.ts`:

```ts
export function buildDisplayState(session: WebAppSession): DisplayState {
  return {
    projectName: session.projectName,
    subPieceName: session.subPieceName,
    usedSeconds: session.projectElapsed ?? 0,
    totalSeconds: session.targetTimeSeconds ?? 0,
    isRunning: session.isRunning ?? false,
  };
}
```

This is the critical bug.

### 5. The background stores the display payload

`extension/lib/messageHandler.ts` receives the content script message:

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

So the extension stores exactly the display payload built from `buildDisplayState()`.

### 6. The popup renders that stored state

In `extension/lib/popup.ts`:

```ts
async function getDisplayState(): Promise<DisplayState | null> {
  const result = await getBrowser().storage.local.get(DISPLAY_STATE_KEY);
  return result[DISPLAY_STATE_KEY] as DisplayState | null;
}

export function renderPopup(state: DisplayState | null): void {
  usedTotalEl.textContent = formatUsedTotal(state.usedSeconds, state.totalSeconds);
}
```

The popup also listens for live storage changes:

```ts
browserInstance.storage.local.onChanged.addListener((changes) => {
  if (changes[DISPLAY_STATE_KEY]) {
    renderPopup(changes[DISPLAY_STATE_KEY].newValue as DisplayState);
  }
});
```

## Why this is wrong

### A. The popup shows project values even for sub-piece mode

The web app session contains both project timing and sub-piece timing.
For a sub-piece session, the popup should not display `projectElapsed / targetTimeSeconds`.
Instead, the popup should display the active sub-piece progress.

The current code ignores:
- `session.subPieceRemaining`
- `session.allocatedMinutes`

Those fields are available but unused.

### B. The current popup formatter hides second-level accuracy

The popup formats display values as whole minutes:

```ts
function formatUsedTotal(usedSeconds: number, totalSeconds: number): string {
  const used = Math.floor(usedSeconds / 60);
  const total = Math.floor(totalSeconds / 60);
  return `${used} / ${total} min`;
}
```

This means even if the underlying values are correct, the popup only shows minute resolution and will appear stale during short sub-piece sessions.

## Why pause/resume desynchronization happens

### 1. Polling interval creates lag

`startFocusSyncPolling()` does this:

```ts
syncDisplayState();
setInterval(() => {
  syncExtensionSettings();
  syncDisplayState();
}, intervalMs);
```

The default interval is `5000` ms. That means if the web app state changes, the popup may not see it for up to 5 seconds.

### 2. Wrong source values magnify the lag

When the active timer is a sub-piece timer, the popup is already reading the wrong metric.
So even after the next poll, it may still show the wrong numeric relationship.

If the user pauses and resumes repeatedly, the popup can show stale `projectElapsed` values while the web app is actually progressing the sub-piece.

### 3. Completed state can be missed

The popup only knows completion when `ff_display_state` changes to a value representing completion.
Because the display payload is built from project fields only, a completed sub-piece session may still appear as if the project timer is running or paused unexpectedly.

## Exact root cause

The exact root cause is this line in `extension/lib/focusSync.ts`:

```ts
usedSeconds: session.projectElapsed ?? 0,
```

and this line:

```ts
totalSeconds: session.targetTimeSeconds ?? 0,
```

Those two fields are correct only for project mode.
They are incorrect for sub-piece mode.

## Actual wrong output example

Given a sub-piece session where:
- `projectElapsed = 120`
- `targetTimeSeconds = 300`
- `subPieceRemaining = 30`
- `allocatedMinutes = 2`

The popup currently displays:

```
12 / 5 min
```

Because it interprets `usedSeconds = 120` and `totalSeconds = 300`.

The correct sub-piece display should be:

```
1 / 2 min
```

or in seconds-based terms, sub-piece used 90 / 120 sec.

## Fully detailed fix

The display state builder must branch by sub-piece mode and calculate display values from sub-piece data when present.

Replace `buildDisplayState()` in `extension/lib/focusSync.ts` with code like this:

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
  };
}
```

### Why this fixes it

- For project sessions, popup still shows project elapsed vs target.
- For sub-piece sessions, popup shows sub-piece elapsed vs allocated minutes.
- It uses the actual fields the web app stores for the active sub-piece.

## Additional hard requirement

Do not add any timer countdown or elapsed calculation inside the popup.
The popup must remain a passive renderer of `ff_display_state`.

If you want the popup to show `Completed`, the web app must save completion state to `ff_active_session`, and the content script must sync that into `ff_display_state`.

## Verification checklist

After applying the fix, verify all of the following:

- `ff_active_session` in the web app contains the current `subPieceRemaining` and `allocatedMinutes` values for sub-piece sessions.
- `extension/lib/focusSync.ts` builds display state from sub-piece fields when `session.subPieceId` exists.
- The extension background receives `SYNC_DISPLAY_STATE` payloads with `usedSeconds` and `totalSeconds` matching sub-piece mode, not project mode.
- The popup renders the new `ff_display_state` immediately when the extension storage changes.
- Project timer sessions still render correctly as `projectElapsed / targetTimeSeconds`.
- Sub-piece timer sessions render correctly as `(allocatedMinutes*60 - subPieceRemaining) / (allocatedMinutes*60)`.
- Pause and resume operations update the popup within one polling interval and keep values consistent with the web app.
- Completion is displayed as done when the underlying web app session reaches the target or sub-piece completes.

## Conclusion

This is not a styling problem or a localization problem.
It is a data-model problem in the display-state sync.
The popup is not reading the right values for sub-piece sessions.

Fixing `buildDisplayState()` is the full solution for this bug.

The report is complete. No further suggestions are needed unless you ask for an implementation or test plan.
