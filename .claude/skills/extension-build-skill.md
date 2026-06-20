# Skill: Extension Build

## Purpose
Build or update the Manifest V3 browser extension.

## When to Use
Adding extension features: tab monitoring, notifications, popup, sync.

## References
- Context7: `/wxt-dev/wxt`
- Context7: `/mozilla/webextension-polyfill`
- Context7: `/websites/developer_mozilla_en-us_mozilla_add-ons_webextensions`
- GitHub: `dominhduy09/pomodoro-extension`, `sg172003/shorts-detox-web-extension`

## Steps
1. Read `.claude/memory/extension-architecture.md`.
2. Work inside `extension/` folder.
3. Use `browser.*` APIs everywhere.
4. Update WXT config or manifest as needed.
5. Run `cd extension && npm run build`.
6. Update `.claude/memory/progress.md`.

## Rules
- Cross-browser support (Chrome, Edge, Brave, Firefox).
- Use `chrome.alarms` for background timers.
- Use `chrome.notifications` for off-screen alerts.
- Storage keys match web app (`ff_` prefix).

## Verification
- Extension builds without errors.
- Loads unpacked in Chrome.
- Blocks/warns on forbidden URLs.
- Syncs with web app state.
