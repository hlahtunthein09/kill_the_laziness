# Skill: Focus Sync Content Script (Piece 12)

## Purpose
Bridge the web app timer state to the extension background so off-screen desktop notifications can fire even after the FocusFlow tab loses focus or is closed.

## Background
- Piece 10b already built the background alarm + desktop notification trigger.
- The trigger depends on `ff_extension_timer` state being kept up-to-date.
- Currently the web app only writes to `localStorage` (`ff_active_session`); it never sends state to the extension.
- A content script polling `localStorage` and forwarding it to the background is the smallest, most robust approach (no extension ID needed, reuses existing `runtime.onMessage` listener).

## Scope
- **Create**
  - `extension/lib/focusSync.ts` — core sync logic with swappable `browser` instance for tests
  - `extension/entrypoints/focusSync.content.ts` — WXT content script entrypoint
  - `extension/lib/__tests__/focusSync.test.ts` — unit tests
- **Modify**: none (matches live in the content script entrypoint)
- **Size**: Small — 3 files, ~140 lines

## References
- `.claude/memory/extension-architecture.md`
- `.claude/memory/sync-protocol.md`
- `extension/lib/messageHandler.ts`
- `extension/lib/types.ts`
- `hooks/useTimer.ts` (defines `ff_active_session` shape)
- Existing content script pattern: `extension/entrypoints/warn.content.ts`

## Steps
1. Read `.claude/CLAUDE.md`, `.claude/memory/extension-architecture.md`, `.claude/memory/progress.md`, `.claude/memory/sync-protocol.md`.
2. Read `extension/lib/messageHandler.ts`, `extension/lib/types.ts`, `hooks/useTimer.ts`.
3. Create `extension/lib/focusSync.ts`.
   - `SESSION_KEY = "ff_active_session"`
   - `setFocusSyncBrowserInstance(browser: Browser)` and `getBrowser()` helper (same pattern as `storage.ts`).
   - `readFocusSession(): ExtensionTimerState | null` — read and parse `localStorage.getItem(SESSION_KEY)`; return `null` if missing or invalid.
   - `syncFocusSession(): Promise<void>` — read session, skip if unchanged since last send (dedup by raw string), send `browser.runtime.sendMessage({ action: "UPDATE_TIMER_STATE", payload: state })`, catch errors silently.
   - `startFocusSyncPolling(intervalMs = 5000): void` — call `syncFocusSession()` immediately, then `setInterval`.
4. Create `extension/entrypoints/focusSync.content.ts`.
   - `defineContentScript({ matches: ["http://localhost:3000/*"] })`.
   - In `main()` call `startFocusSyncPolling()`.
   - Add a comment noting where to add the production domain later.
5. Create `extension/lib/__tests__/focusSync.test.ts`.
   - Use `fakeBrowser` from `@webext-core/fake-browser`.
   - Set browser instance via `setFocusSyncBrowserInstance`.
   - Test: no message sent when `ff_active_session` is absent.
   - Test: `UPDATE_TIMER_STATE` is sent with parsed payload when session exists.
   - Test: identical raw session is not sent twice (dedup).
   - Test: invalid JSON is ignored without throwing.
   - Test: sendMessage failure is caught and does not throw.
6. Run `npx tsc --noEmit` and `npx vitest run extension/lib/__tests__/focusSync.test.ts`.
7. Run `npm run build:ext` and verify `content-scripts/focusSync.js` exists in `.output/chrome-mv3/` and the manifest contains the content script entry.
8. Update `.claude/memory/progress.md` with a one-line status after implementation.

## Rules
- Keep the content script small; logic lives in `extension/lib/focusSync.ts` for testability.
- Do not modify the web app code in this piece.
- Reuse the existing `UPDATE_TIMER_STATE` action and payload shape.
- Guard against missing/invalid `localStorage` data and missing extension context.
- Use `browser.*` APIs via `wxt/browser`.

## Agent
- **Extension Engineer**

## Verification
- TypeScript compiles (`npx tsc --noEmit`).
- `npx vitest run extension/lib/__tests__/focusSync.test.ts` passes.
- `npm run build:ext` succeeds and includes the `focusSync` content script.
- Manifest includes the new content script with `http://localhost:3000/*` match.
