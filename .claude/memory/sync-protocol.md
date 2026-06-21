# Sync Protocol — Web App ↔ Extension

## Active Session Key
- Web app writes running timer state to `localStorage` key `ff_active_session` every 5 seconds.
- Shape matches `ExtensionTimerState`:
  - `projectId: string`
  - `subPieceId?: string`
  - `projectElapsed: number`
  - `subPieceRemaining: number`
  - `isRunning: boolean`
  - `savedAt: number`

## Extension Sync Mechanism
- A content script (`focusSync.content.ts`) runs on `http://localhost:3000/*`.
- It polls `window.localStorage.getItem('ff_active_session')` every 5 seconds.
- It forwards the state to the background via `browser.runtime.sendMessage({ action: 'UPDATE_TIMER_STATE', payload: state })`.
- The existing background `handleMessage` stores the state in `browser.storage.local` (`ff_extension_timer`) and starts/stops the focus alarm.

## Why Content Script Polling
- No extension ID is required from the web app.
- Works with the existing internal `runtime.onMessage` listener.
- Avoids brittle `externally_connectable` web-page messaging.
- Production domain can be added later by extending `matches` in `focusSync.content.ts`.

## Limitations
- Sync stops if the FocusFlow tab is closed or navigates away.
- Background continues from the last received state, so notifications may be slightly delayed by up to the polling interval.
- Firefox web-page direct messaging is not used; content script approach is Chromium-compatible and relies on standard MV3 APIs.

## Future Improvements
- Listen to `window.addEventListener('storage', ...)` where possible.
- Send immediate sync on start/pause/complete events.
- Add production URL match pattern once domain is known.
