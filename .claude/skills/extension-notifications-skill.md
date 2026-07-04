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
- `extension/lib/focusSync.ts`
- `extension/lib/redirect.ts`
- `extension/lib/urlChecker.ts`
- `extension/lib/warnOverlay.ts`
- `extension/lib/types.ts`

## Architecture Conventions

### WXT & Manifest
- Use WXT file-based entrypoints under `extension/entrypoints/`.
- Permissions in `wxt.config.ts`: `storage`, `tabs`, `alarms`, `notifications`, `scripting`, `declarativeNetRequest`, `activeTab`.
- Use dynamic `import("wxt/browser")` in content scripts; do not use `require()`.

### Off-Screen Notification Architecture
- The extension service worker is the **source of truth** for the active focus session when the extension is installed.
- Web app sends commands (`START_TIMER`, `PAUSE_TIMER`, `RESET_TIMER`) via `window.browser.runtime.sendMessage`.
- `messageHandler.ts` routes commands to `timerEngine.ts`.
- `timerEngine.ts` owns state in `chrome.storage.local` (`ff_extension_timer`), schedules `chrome.alarms`, calculates drift, and fires notifications.
- Engine broadcasts `STATE_UPDATED` after every mutation; `control.content.ts` forwards it as `ff:state` CustomEvent.
- Web app listens to `ff:state` and seeds display from `GET_TIMER_STATE`.

### Native Notifications
- All notifications go through `extension/lib/notifications.ts`.
- Check `browser.notifications.getPermissionLevel()` before creating.
- Use unique IDs (`nextId(prefix)`), `type: "basic"`, app icon URL, Burmese title, English message.
- Notification types: `notifyStart`, `notifyMilestone`, `notifySessionComplete`, `notifyScheduleDue`, `notifyDistractionBlocked`.
- Use `requireInteraction: true` so notifications persist in Action Center.

### Anti-Distraction
- Default forbidden URL fragments: YouTube Shorts, Instagram Reels, TikTok, Facebook Reels, Twitter, Reddit, Netflix.
- Strict mode: redirect to `extension/blocked.html`.
- Warn mode: inject calming overlay via `warn.content.ts`.
- Always log the attempt and notify.

## Implementation Checklist

1. Read `.claude/memory/extension-architecture.md`, `.claude/memory/sync-protocol.md`, `.claude/memory/notification-spec.md`.
2. Use `@webext-core/fake-browser` for extension tests.
3. Store durations in seconds; prefix storage keys with `ff_`.
4. Keep service worker listener registration synchronous in `defineBackground` main.
5. Recreate `focus-timer` alarm on startup if a running session exists.
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

## Agent Notes
- Do not use `window` browser APIs directly in the service worker; always go through `wxt/browser`.
- Do not call `notifications.create()` without permission check.
- When updating `timerEngine.ts`, maintain invariants:
  - `isRunning === true` ⟹ both alarms exist and timer not complete/target not reached.
  - `savedAt` is updated on every state mutation.
  - `subPieceRemaining >= 0`, `projectElapsed >= 0`.
- When adding a new command, update `TimerMessage` union and both web-app and extension handlers.
- Use `try/catch` around `runtime.sendMessage` broadcasts; missing listeners must not crash the engine.
- Manual verification is required for native banner behavior; use the popup test-notification button to isolate issues.
