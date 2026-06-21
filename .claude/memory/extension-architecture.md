# Extension Architecture

## Manifest V3 Configuration

| Field | Value |
|---|---|
| Name | FocusFlow AI |
| Description | Anti-distraction focus companion for FocusFlow AI |
| Manifest Version | 3 (MV3) |

## Permissions

| Permission | Purpose |
|---|---|
| `storage` | Persist settings, blocked-site list, and session logs |
| `tabs` | Monitor active tab URLs for distraction detection |
| `alarms` | Schedule periodic checks and notification reminders |
| `notifications` | Show native OS notifications for blocks and milestones |
| `scripting` | Inject content scripts (warn overlay) into distraction pages |
| `declarativeNetRequest` | Block/redirect requests in strict mode |

## Host Permissions

Forbidden URL patterns covered:

- `*://*.youtube.com/*` (specifically `/shorts` paths)
- `*://*.instagram.com/*` (specifically `/reels` paths)
- `*://*.tiktok.com/*`
- `*://*.facebook.com/*` (specifically `/reels` paths)
- `*://*.twitter.com/*`
- `*://*.reddit.com/*`
- `*://*.netflix.com/*`

## Entrypoints

| Entrypoint | File | Purpose |
|---|---|---|
| Background | `extension/entrypoints/background.ts` | Service worker — session sync, alarm handling, tab monitoring |
| Popup | `extension/entrypoints/popup.html` | Extension popup UI — quick status, start/pause focus session |
| Content Script | `extension/entrypoints/content.ts` (planned) | Injected into distraction pages for warn-mode overlay |
| Blocked Page | `extension/blocked.html` (planned) | Redirect destination in strict mode |

## Planned Messaging

### Background ↔ Popup
- `GET_SESSION_STATE` — popup requests current focus session status
- `START_SESSION` / `PAUSE_SESSION` / `STOP_SESSION` — control commands
- `SESSION_UPDATED` — broadcast from background when session changes

### Background ↔ Content Script
- `CHECK_DISTRACTION` — content script asks background if current URL is blocked
- `BLOCK_PAGE` / `WARN_PAGE` — background tells content script how to respond
- `LOG_ATTEMPT` — content script reports a distraction attempt

### Background ↔ Web App (future)
- `ff_sync_channel` — shared `chrome.storage.local` key for cross-context sync
- Web app writes `ff_active_session`; extension reads it to know if a session is active

## Storage Keys

All keys prefixed with `ff_` per project convention:

- `ff_extension_settings` — extension-specific settings (strict mode, etc.)
- `ff_distraction_logs` — blocked/warned attempt logs
- `ff_active_session` — shared with web app; indicates running focus session

## Build Output

WXT produces browser-specific bundles under `.output/`:

- `.output/chrome-mv3/` — Chrome, Edge, Brave
- `.output/firefox-mv3/` — Firefox

## Cross-Browser Notes

- Chrome/Edge/Brave: full MV3 support, all APIs available
- Firefox: MV3 compatible but some APIs differ; test `declarativeNetRequest` fallback
