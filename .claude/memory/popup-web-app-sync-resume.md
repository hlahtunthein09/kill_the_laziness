# Popup Web-App Sync — Resume Point

## Status

- Branch: `fix/popup-web-app-sync` (created from `main` after commit `433c338`).
- **Piece 1 (backend sync path) complete.** `ff_display_state` is now populated from web-app `ff_active_session` via `SYNC_DISPLAY_STATE`.
- **Piece 2 (popup UI) complete.** Popup reads `ff_display_state` and renders a used/total card.

## Root cause identified

The popup reads the extension's stored session (`ff_active_session_v2`) and adds live drift. After a **pause → resume → complete** cycle, the extension's `elapsedActiveSeconds` is only updated on pause/resume, not when the complete alarm fires. So the popup shows stale elapsed/remaining and does not recognize completion.

The web app already has the authoritative live state in `localStorage` key `ff_active_session`. The popup should read that state directly.

## Split into two tiny pieces

### Piece 1 — Backend sync path

**Files:**
- `extension/lib/focusSync.ts` — read `ff_active_session` from web-app `localStorage`, send `SYNC_DISPLAY_STATE`.
- `extension/lib/messageHandler.ts` — add `SYNC_DISPLAY_STATE` handler, store under `ff_display_state`.
- `extension/lib/__tests__/focusSync.test.ts` — test display-state sync.
- `extension/lib/__tests__/controlMessage.test.ts` — test `SYNC_DISPLAY_STATE` handler.

**Verdict:** Tiny (~60 lines)

### Piece 2 — Popup UI

**Files:**
- `extension/lib/popup.ts` — read `ff_display_state`, render one **used / total** box.
- `extension/entrypoints/popup.html` — one used/total card.
- `extension/lib/__tests__/popup.test.ts` — update rendering tests.

**Verdict:** Tiny (~60 lines)

## Safety rule

`ff_display_state` must remain completely separate from `ff_active_session_v2`. The notification/timer engine and web-app controls must not be affected.

## Safety rule

`ff_display_state` must remain completely separate from `ff_active_session_v2`. The notification/timer engine and web-app controls must not be affected.

## Verification

- `npx tsc --noEmit`
- Piece 1: `npx vitest run extension/lib/__tests__/focusSync.test.ts extension/lib/__tests__/controlMessage.test.ts`
- Piece 2: `npx vitest run extension/lib/__tests__/popup.test.ts`
- Final: `npm run build:ext`

## Blocker

None.

## Next action

Both pieces complete. Verify popup in a live browser and merge `fix/popup-web-app-sync` to `main`.
