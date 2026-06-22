.claude project structure, references, and Next.js shell created.

## Current Phase
Piece 4 split into 4a/4b/4c. Workflow and memory structure updated for token-efficient, memory-first development.

## Completed
- [x] Next.js app initialized at workspace root
- [x] shadcn/ui initialized
- [x] Dependencies installed
- [x] `.claude/` structure created
- [x] Initial data layer (3 separate stores)
- [x] Architecture research
- [x] Workflow + roadmap updated (Research → Virtual Sizing → Skill → Agent → **Test**)
- [x] Piece 1: Single Store Refactor — DONE
- [x] Piece 2a: App Shell + Layout Wrapper — DONE
- [x] Piece 2b: Sidebar + Burmese Navigation — DONE
- [x] Piece 2c: Header + Dashboard Placeholder — DONE
- [x] Piece 3: Research + Virtual Sizing — DONE
- [x] Piece 3a: Project Form Only — DONE
- [x] Piece 3b: Project Card + List + Page — DONE
- [x] **Backfill tests written and passing (38 tests, 4 files)**
  - `lib/store/__tests__/useFocusStore.test.ts` — 21 tests
  - `components/projects/__tests__/ProjectForm.test.tsx` — 6 tests
  - `components/projects/__tests__/ProjectCard.test.tsx` — 7 tests
  - `components/projects/__tests__/ProjectList.test.tsx` — 4 tests
- [x] **Workflow updated to include mandatory testing**
  - Updated `.claude/skills/main-workflow-skill.md`
  - Updated `.claude/memory/workflow.md`
  - Testing standards added
- [x] **Source-of-truth cleanup**
  - Removed root `CLAUDE.md` and `AGENTS.md`
  - `.claude/CLAUDE.md` now contains non-negotiable workflow rules + framework note
- [x] **Memory-first workflow established**
  - Created `.claude/memory/MEMORY.md` index
  - Created `.claude/memory/ui-conventions.md`
  - Created `.claude/memory/store-schema.md`
  - Updated `.claude/memory/workflow.md` to compact, memory-first steps

## Backfill Testing Plan

### Test Framework
- Vitest
- React Testing Library + jsdom
- @testing-library/jest-dom

### Tests to Write
1. **Piece 1 — Store tests**
   - `lib/store/__tests__/useFocusStore.test.ts`
   - Test project CRUD, sub-piece CRUD, settings, distraction logs

2. **Piece 3a — ProjectForm tests**
   - `components/projects/__tests__/ProjectForm.test.tsx`
   - Test rendering, input changes, submit adds project, validation

3. **Piece 3b — ProjectList/Card tests**
   - `components/projects/__tests__/ProjectCard.test.tsx`
   - `components/projects/__tests__/ProjectList.test.tsx`
   - Test rendering project info, empty state

### Note
Piece 2 (UI shell/layout) tests deferred for now due to lower value; will add once core features stabilize.

## Piece 4: Research + Virtual Sizing (in progress)

### Research Findings
- Store layer already supports sub-piece CRUD (`addSubPiece`, `updateSubPiece`, `deleteSubPiece`, `reorderSubPieces`, etc.) in `lib/store/slices/projectSlice.ts`.
- Existing `ProjectForm` uses manual `useState` + inline validation (no react-hook-form/Zod). Reusing this pattern keeps Piece 4 small and consistent.
- shadcn/ui Dialog/Form/Input/Select docs confirm the same primitives already used in `ProjectForm` are sufficient.
- Zustand selectors/actions pattern is already used in `ProjectList` (`useFocusStore((s) => s.projects)`).
- No new page or hook is strictly required if sub-pieces are displayed inside `ProjectCard`.

### Virtual Sizing — Original Piece 4
- New files: `SubPieceForm.tsx`, `SubPieceList.tsx`, `SubPieceCard.tsx`, `AddSubPieceButton.tsx`, plus 2-3 test files.
- Modified files: `ProjectCard.tsx`, `app/projects/page.tsx`.
- Estimated total: ~8 files, ~450 lines.
- **Verdict: ❌ Too Big** (>6 files, >400 lines).

### Proposed Split (keep each piece ≤200 lines / Small)
- **Piece 4a — SubPiece Form Only** ✅ Small
  - Create `SubPieceForm.tsx`, `SubPieceForm.test.tsx`.
  - Focus: dialog form to add a sub-piece (name + allocated minutes + projectId prop).
- **Piece 4b — Add SubPiece Button + ProjectCard Footer Integration** ✅ Small
  - Create `AddSubPieceButton.tsx`, `AddSubPieceButton.test.tsx`.
  - Modify `ProjectCard.tsx` footer to open the sub-piece form for that project.
  - Focus: trigger to add sub-pieces from a project card.
- **Piece 4c — SubPiece Card + List + ProjectCard Body Integration** ✅ Small
  - Create `SubPieceCard.tsx`, `SubPieceList.tsx`, `SubPieceList.test.tsx`.
  - Modify `ProjectCard.tsx` body to show the list of sub-pieces.
  - Focus: display sub-pieces under each project.

## Next Action
Piece 4a done. Proceed to Piece 4b after user review.

## Blockers
None.

## Decisions Pending
- Notification messages: Burmese-only or bilingual from start?
- Sub-piece form integration point: `ProjectCard` footer vs. separate project detail page? (tentatively ProjectCard footer for 4b)

## Latest Update
- Piece 4a complete: `SubPieceForm.tsx` + `SubPieceForm.test.tsx` created; 7 tests passing; TypeScript clean.
- Piece 4b complete: `AddSubPieceButton.tsx` + `AddSubPieceButton.test.tsx` created; `ProjectCard.tsx` footer updated; 2 tests passing; TypeScript clean.
- Piece 4c complete: `SubPieceCard.tsx`, `SubPieceList.tsx`, `SubPieceList.test.tsx` created; `ProjectCard.tsx` body renders sub-pieces below progress bar; 3 tests passing; TypeScript clean.

## Piece 5: Research + Virtual Sizing (in progress)

### Research Findings
- Timer must be a client hook (`"use client"`) using `useEffect` + `requestAnimationFrame`.
- `requestAnimationFrame` + `Date.now()` delta gives accurate timing even when tab is throttled; `setInterval` is not reliable.
- Zustand `persist` middleware can store transient timer state, but a dedicated `ff_active_session` localStorage key is simpler for an active session.
- On mount/rehydrate, compare `savedAt` timestamp to `Date.now()` to calculate drift and fast-forward elapsed time.
- Store actions `incrementProjectTime`, `incrementSubPieceTime`, and `completeSubPiece` already exist in `projectSlice`.
- No timer slice exists yet in `useFocusStore`; the hook can own the active session state and call existing actions.

### Virtual Sizing — Piece 5
| Metric | Estimate |
|---|---|
| New files | 2 (`hooks/useTimer.ts`, `hooks/__tests__/useTimer.test.ts`) |
| Modified files | 0 |
| Hooks | 1 |
| Pages | 0 |
| Est. lines | ~200-250 |
| Verdict | ⚠️ Small → Medium (borderline; timer logic is dense) |

### Proposed Approach
Build a single focused `useTimer` hook that:
- Accepts `projectId` and optional `subPieceId`.
- Counts project time up and sub-piece time down.
- Persists active session every 5 seconds to `ff_active_session`.
- Restores + drift-corrects on mount.
- Auto-pauses and marks sub-piece complete at zero.
- Returns `isRunning`, `start`, `pause`, `reset`, `projectElapsed`, `subPieceRemaining`.

- [x] **Piece 5: Timer Engine Hook** — DONE
  - `hooks/useTimer.ts` created (RAF-based, drift-corrected, localStorage persistence)
  - `hooks/__tests__/useTimer.test.tsx` created (18 tests, all passing)
  - TypeScript clean, 67/67 tests passing across all suites

## Piece 6: Research + Virtual Sizing (in progress)

### Research Findings
- Timer UI is a pure consumer of the existing `useTimer` hook.
- Display only needs `formatDuration` from `lib/time.ts` and shadcn/ui `Button`.
- Controls: Start, Pause, Reset buttons wired to `useTimer` actions.
- Sidebar already has `/timer` route but no page exists.
- No new primitives or Context7 research needed; memory-first approach applies.

### Virtual Sizing — Piece 6
| Metric | Estimate |
|---|---|
| New files | 3 (`components/timer/TimerPanel.tsx`, `components/timer/__tests__/TimerPanel.test.tsx`, `app/timer/page.tsx`) |
| Modified files | 0 |
| Hooks | 0 (reuses `useTimer`) |
| Pages | 1 (`/timer`) |
| Est. lines | ~180 |
| Verdict | ✅ Small |

### Proposed Split
- **Piece 6a — Timer Display + Controls (presentational)** ✅ Small
  - Create `components/timer/TimerDisplay.tsx`, `components/timer/TimerControls.tsx`, `components/timer/__tests__/TimerControls.test.tsx`.
  - Focus: pure UI for elapsed/remaining times and Start/Pause/Reset buttons.
- **Piece 6b — Timer Panel + `/timer` Page (wiring)** ✅ Small
  - Create `components/timer/TimerPanel.tsx`, `app/timer/page.tsx`, `components/timer/__tests__/TimerPanel.test.tsx`.
  - Focus: read active project, pick first incomplete sub-piece, wire `useTimer`, host on `/timer`.

- [x] **Piece 6a: Timer Display + Controls** — DONE
  - `components/timer/TimerDisplay.tsx` created (presentational, ~50 lines)
  - `components/timer/TimerControls.tsx` created (Start/Pause/Reset, ~40 lines)
  - `components/timer/__tests__/TimerControls.test.tsx` created (6 tests, all passing)
  - TypeScript clean, 73/73 tests passing across all suites

- [x] **Piece 6b: Timer Panel + `/timer` Page (wiring)** — DONE
  - `components/timer/TimerPanel.tsx` created (reads active project, finds first incomplete sub-piece, wires `useTimer`, empty states in Burmese)
  - `app/timer/page.tsx` created (server component with Burmese title + TimerPanel)
  - `components/timer/__tests__/TimerPanel.test.tsx` created (5 tests, all passing)
  - TypeScript clean, 78/78 tests passing across all suites

## Piece 7: Research + Virtual Sizing (in progress)

### Research Findings
- Piece 7 is content/logic only; no UI components or new libraries.
- FocusFlow AI needs encouraging, Burmese-first motivational messages.
- Messages should be tiered by user state: beginning, struggling, succeeding, completing.
- A helper function should pick a message based on context (elapsed %, remaining %, completed).
- No Context7 research needed; this is domain-specific content design.

### Virtual Sizing — Piece 7
| Metric | Estimate |
|---|---|
| New files | 3 (`lib/notifications.ts`, `lib/motivation.ts`, `lib/__tests__/motivation.test.ts`) |
| Modified files | 0 |
| Hooks | 0 |
| Pages | 0 |
| Est. lines | ~150 |
| Verdict | ✅ Small |

### Proposed Approach
- Create `lib/notifications.ts` with default notification title/body templates.
- Create `lib/motivation.ts` with tiered message arrays and a `getMotivation(context)` helper.
- Context object: `{ elapsedSeconds, totalElapsedSeconds, remainingSeconds, isRunning, completedToday }`.
- Tiers:
  - **beginning** — when timer just started
  - **struggling** — when little progress after a while
  - **succeeding** — when making good progress
  - **completing** — when sub-piece nearly done or just finished
- Create tests verifying each tier returns a Burmese string and helper picks correct tier.

## Piece 7: Motivation Message Bank — DONE
  - `.claude/memory/notification-spec.md` created with tier definitions and tone guidelines
  - `lib/motivation.ts` created with `MotivationTier`, `MotivationContext`, 4 tiered message arrays (4 msgs each), `getMotivation(context)` helper
  - `lib/notifications.ts` created with `sessionCompleteNotification`, `distractionBlockedNotification`, `milestoneNotification`
  - `lib/__tests__/motivation.test.ts` created (11 tests, all passing)
  - TypeScript clean, 89/89 tests passing across all suites

## Piece 8: Research + Virtual Sizing (in progress)

### Research Findings
- `sonner` is already installed and `components/ui/sonner.tsx` is configured.
- `<Toaster />` is already rendered in `app/layout.tsx`.
- Showing toasts: `import { toast } from "sonner"` then `toast.success/toast.info/etc`.
- TimerPanel is the natural place to trigger motivational toasts based on timer state changes.
- No new libraries needed.

### Virtual Sizing — Piece 8
| Metric | Estimate |
|---|---|
| New files | 2 (`components/timer/TimerToast.tsx`, `components/timer/__tests__/TimerToast.test.tsx`) |
| Modified files | 1 (`components/timer/TimerPanel.tsx`) |
| Hooks | 0 |
| Pages | 0 |
| Est. lines | ~120 |
| Verdict | ✅ Small |

### Proposed Approach
- Create `components/timer/TimerToast.tsx`.
  - Props: `context: MotivationContext`.
  - Uses `getMotivation(context)` from `lib/motivation.ts`.
  - Calls `toast.info()` with Burmese message (English subtitle).
- Modify `components/timer/TimerPanel.tsx`.
  - Trigger toast when timer starts.
  - Trigger toast periodically (e.g., every 5 min) or on state tier changes.
  - Trigger session-complete toast when sub-piece finishes.
- Test that TimerToast renders nothing (it only calls toast) and that the correct toast function is called for a given context.

## Piece 8: Toast Notification UI — DONE
  - `components/timer/TimerToast.tsx` created — `getMotivation`-based toast component with `start`/`milestone`/`complete` triggers, deduplication via ref, Burmese-first messages
  - `components/timer/__tests__/TimerToast.test.tsx` created — 6 tests, all passing
  - `components/timer/TimerPanel.tsx` modified — renders `TimerToast`, triggers `start` on pause→running, `milestone` every 5 min and on tier change, `complete` on sub-piece finish
  - TypeScript clean, 95/95 tests passing across all suites

## Phase 7 / Piece 9: Research + Virtual Sizing (in progress)

### Research Findings
- WXT is the chosen extension build tool (from project tech stack).
- WXT project can live inside `extension/` folder with root config pointing `srcDir` to it.
- Required MV3 permissions: `storage`, `tabs`, `alarms`, `notifications`, `scripting`, `declarativeNetRequest`, plus host permissions for forbidden URLs.
- Entrypoints: `background.ts`, `popup.html`, content scripts, options.
- No web-extension code needed yet; setup only.

### Virtual Sizing — Piece 9
| Metric | Estimate |
|---|---|
| New files | 5 (`wxt.config.ts`, `extension/entrypoints/background.ts`, `extension/entrypoints/popup.html`, `extension/README.md`, `.claude/memory/extension-architecture.md`) |
| Modified files | 1 (`package.json` — add WXT dependency + scripts) |
| Hooks | 0 |
| Pages | 0 |
| Est. lines | ~120 |
| Verdict | ✅ Small |

### Proposed Approach
- Install `wxt` as dev dependency.
- Create `wxt.config.ts` with `srcDir: "extension"`.
- Create `extension/entrypoints/background.ts` with a simple `defineBackground` placeholder.
- Create `extension/entrypoints/popup.html` placeholder.
- Add `dev:ext`, `build:ext`, `zip:ext` scripts to root `package.json`.
- Create `.claude/memory/extension-architecture.md` with manifest/permissions notes.
- Run `npm install` and `npm run build:ext` to verify WXT builds.

## Piece 9: Extension WXT Setup + Manifest — DONE
  - `wxt.config.ts` created with `srcDir: "extension"`, MV3 manifest, all 6 permissions, 7 host permissions
  - `extension/entrypoints/background.ts` created with `defineBackground` placeholder
  - `extension/entrypoints/popup.html` created as minimal placeholder with pastel theme
  - `extension/README.md` created with manual load instructions for Chrome/Edge/Firefox
  - `.claude/memory/extension-architecture.md` created with manifest/permissions/messaging plans
  - `extension/env.d.ts` added for WXT auto-import globals
  - `extension/__tests__/wxt.config.test.ts` added (4 tests, all passing)
  - `package.json` updated with `dev:ext`, `build:ext`, `zip:ext`, `postinstall` scripts; `wxt` moved to devDependencies
  - `npm run build:ext` succeeds — Chrome MV3 bundle produced at `.output/chrome-mv3/`
  - Manifest output verified: all permissions and host permissions present, service worker + action popup configured
  - TypeScript clean, 99/99 tests passing across all suites

## Piece 10: Research + Virtual Sizing (in progress)

### Research Findings
- MV3 background is a service worker; it cannot use `setInterval` reliably.
- Use `chrome.alarms` (via `browser.alarms`) to wake the service worker periodically.
- Use `chrome.storage.local` (via `browser.storage.local`) to persist timer state.
- Use `chrome.runtime.onMessage` to receive state updates from the web app.
- Web app → extension messaging requires `externally_connectable` in the manifest.
- `@webext-core/fake-browser` (already a WXT dependency) can mock browser APIs for tests.

### Virtual Sizing — Original Piece 10
- Original idea: background script + storage wrapper + alarms + notifications + tests.
- Estimated: ~5 files, ~350 lines.
- **Verdict: ⚠️ Medium with risk** — timer + notifications + tests in one piece is dense.

### Proposed Split
- **Piece 10a — Extension Storage + Timer State Listener** ✅ Small
  - Create `extension/lib/storage.ts` wrapper for `browser.storage.local`.
  - Update `extension/entrypoints/background.ts` to listen for `UPDATE_TIMER_STATE` messages and persist them.
  - Update `wxt.config.ts` to add `externally_connectable`.
  - Add tests using `@webext-core/fake-browser`.
- **Piece 10b — Background Alarms + Off-Screen Notifications** ✅ Small
  - Create `chrome.alarms` logic in background to wake service worker.
  - Send desktop notification when sub-piece remaining reaches 0.
  - Add tests for alarm handler and notification trigger.

## Next Action
Approve the split, then start Piece 10a.

## Blockers
None.

## Decisions Pending
- Extension popup framework: plain HTML or reuse Next.js static export? (proposed: plain HTML for now)
- Content script warn overlay design: minimal or themed with pastel nature palette?
- Web app origin for `externally_connectable`: localhost only for dev, or also production domain placeholder?

## Latest Update
- Piece 10a complete: `ExtensionTimerState` interface, `extension/lib/storage.ts` wrapper for `browser.storage.local`, `extension/lib/messageHandler.ts` with `handleMessage` exported for tests, `background.ts` wired with `onMessage` listener, `externally_connectable` added to manifest, 10 tests passing (5 storage + 5 background), TypeScript clean, WXT build succeeds.
- Piece 10b complete: `extension/lib/timerAlarm.ts` with `startFocusAlarm`, `stopFocusAlarm`, `onAlarmTick` (reads stored state, calculates drift, sends Burmese notification when sub-piece completes, clears alarm), `background.ts` wired with `browser.alarms.onAlarm` listener, `messageHandler.ts` starts/stops alarm on `UPDATE_TIMER_STATE`, 7 tests passing in `timerAlarm.test.ts`, all 17 extension tests passing, TypeScript clean, WXT build succeeds.
- Piece 9 complete: WXT extension scaffold built and verified.
- Piece 11a complete: `extension/lib/urlChecker.ts` (forbidden URL matcher + default patterns), `extension/entrypoints/blocked.html` (pastel theme, Burmese-first message), `extension/lib/redirect.ts` (tab update handler, strict mode check, settings reader), `extension/entrypoints/background.ts` updated with `tabs.onUpdated` listener, `wxt.config.ts` updated with `web_accessible_resources`, 7 urlChecker tests + 11 redirect tests all passing, TypeScript clean, WXT build succeeds with `blocked.html` in output, manifest includes `web_accessible_resources`.

## Piece 11: Research + Virtual Sizing (in progress)

### Research Findings
- MV3 extensions can block/redirect URLs via `declarativeNetRequest` (fast, no content script) or background `tabs.onUpdated` + `tabs.update`.
- Warn mode requires a content script to inject an overlay on the distracting page.
- A blocked page can be an extension page (`blocked.html`) declared in `web_accessible_resources`.
- Settings store has `strictMode` and `forbiddenUrls` already.
- Background can read settings from `browser.storage.local` (synced later) or wait for web app messaging.

### Virtual Sizing — Original Piece 11
- Strict redirect + blocked page + warn overlay + tests.
- Estimated: ~6 files, ~350 lines.
- **Verdict: ⚠️ Medium** — blocking and overlay are two distinct concerns.

### Proposed Split
- **Piece 11a — Background Tab Monitoring + Strict Mode Redirect** ✅ Small
  - Create `extension/lib/urlChecker.ts` to match URLs against forbidden fragments.
  - Create `extension/entrypoints/blocked.html` page with motivational message.
  - Update `extension/entrypoints/background.ts` to listen to `tabs.onUpdated` and redirect if strict mode.
  - Update `wxt.config.ts` to add `web_accessible_resources`.
  - Add tests for URL checker and redirect logic using fake-browser.
- **Piece 11b — Warn Mode Content Script Overlay** ✅ Small
  - Create `extension/entrypoints/warn.content.ts` content script for forbidden URLs.
  - Inject a calming overlay with motivational message instead of redirecting.
  - Add tests for overlay creation.

## Next Action
Piece 11 complete. Proceed to Piece 12 after user review.

## Blockers
None.

## Latest Update
- Piece 10a complete: `ExtensionTimerState` interface, `extension/lib/storage.ts` wrapper for `browser.storage.local`, `extension/lib/messageHandler.ts` with `handleMessage` exported for tests, `background.ts` wired with `onMessage` listener, `externally_connectable` added to manifest, 10 tests passing (5 storage + 5 background), TypeScript clean, WXT build succeeds.
- Piece 10b complete: `extension/lib/timerAlarm.ts` with `startFocusAlarm`, `stopFocusAlarm`, `onAlarmTick` (reads stored state, calculates drift, sends Burmese notification when sub-piece completes, clears alarm), `background.ts` wired with `browser.alarms.onAlarm` listener, `messageHandler.ts` starts/stops alarm on `UPDATE_TIMER_STATE`, 7 tests passing in `timerAlarm.test.ts`, all 17 extension tests passing, TypeScript clean, WXT build succeeds.
- Piece 9 complete: WXT extension scaffold built and verified.
- Piece 11a complete: `extension/lib/urlChecker.ts` (forbidden URL matcher + default patterns), `extension/entrypoints/blocked.html` (pastel theme, Burmese-first message), `extension/lib/redirect.ts` (tab update handler, strict mode check, settings reader), `extension/entrypoints/background.ts` updated with `tabs.onUpdated` listener, `wxt.config.ts` updated with `web_accessible_resources`, 7 urlChecker tests + 11 redirect tests all passing, TypeScript clean, WXT build succeeds with `blocked.html` in output, manifest includes `web_accessible_resources`.
- Piece 11b complete: `extension/lib/warnOverlay.ts` (injectWarnOverlay with pastel nature themed card, Burmese title + English subtitle, Back to Focus and Continue anyway buttons), `extension/entrypoints/warn.content.ts` (defineContentScript with 7 host patterns, checks strict mode, injects overlay with struggling motivation message), `extension/lib/__tests__/warnOverlay.test.ts` (6 tests all passing), TypeScript clean, WXT build succeeds with `content-scripts/warn.js` in output and manifest content_scripts entry.
- Piece 12 complete: `extension/lib/focusSync.ts` (swappable browser instance, readFocusSession, syncFocusSession with dedup, startFocusSyncPolling), `extension/entrypoints/focusSync.content.ts` (defineContentScript matching `http://localhost:3000/*`), `extension/lib/__tests__/focusSync.test.ts` (11 tests all passing), TypeScript clean, WXT build succeeds with `content-scripts/focusSync.js` in output and manifest content_scripts entry.

## Piece 12: Research + Virtual Sizing (in progress)

### Research Findings
- Piece 10b already sends a desktop notification from the background when `subPieceRemaining` reaches 0.
- The notification trigger depends on `ff_extension_timer` state being up-to-date in extension storage.
- The web app currently only persists timer state to `localStorage` (`ff_active_session`); it does not send anything to the extension.
- Therefore, closing the FocusFlow tab leaves the background with stale state and off-screen notifications do not fire.
- A content script polling `window.localStorage` on `http://localhost:3000/*` and forwarding state via `browser.runtime.sendMessage` is the smallest, most robust fix:
  - No extension ID is required (unlike web-page direct messaging).
  - Reuses the existing `UPDATE_TIMER_STATE` handler and background alarm logic.
  - Does not require any web app code changes.

### Virtual Sizing — Piece 12 (Option A: Content Script Sync)
| Metric | Value |
|---|---|
| New files | 3 (`extension/lib/focusSync.ts`, `extension/entrypoints/focusSync.content.ts`, `extension/lib/__tests__/focusSync.test.ts`) |
| Modified files | 0 |
| Hooks | 0 |
| Pages | 0 |
| Est. lines | ~140 |
| Verdict | ✅ Small |

### Proposed Approach
- Create `extension/lib/focusSync.ts` with swappable `browser` instance, `readFocusSession`, `syncFocusSession` (with dedup), and `startFocusSyncPolling`.
- Create `extension/entrypoints/focusSync.content.ts` matching `http://localhost:3000/*` that starts polling.
- Create `extension/lib/__tests__/focusSync.test.ts` using `fakeBrowser` to verify message sending, dedup, and error handling.
- Run `npx tsc --noEmit`, `npx vitest run extension/lib/__tests__/focusSync.test.ts`, and `npm run build:ext` to verify the content script is bundled.

## Next Action
Piece 13a complete. Awaiting user review before Piece 13b.

## Latest Update
- Piece 13b complete: `extension/entrypoints/popup.html` (styled popup with Burmese-first labels, pastel nature theme), `extension/lib/popup.ts` (reads `ff_extension_timer`, renders project/sub-piece names, elapsed/remaining times, status dot, open-app button with `browser.tabs.create`), `extension/lib/__tests__/popup.test.ts` (12 tests all passing), TypeScript clean, WXT build succeeds with popup bundle and manifest `action.default_popup`.
- **Bugfix Piece 1 — TimerPanel conditional-hooks crash: fixed by moving all hooks before any conditional return in `TimerPanel.tsx`; `useTimer` now accepts nullable IDs; 168/168 tests passing, `/timer` refresh no longer crashes.**
- Piece 13a complete: `ExtensionTimerState` enriched with optional `projectName` and `subPieceName`; `hooks/useTimer.ts` `persistSession` now includes names from store; `extension/lib/focusSync.ts` passes names through without validation blocking; focusSync test (12 tests) and useTimer test (20 tests) all passing; TypeScript clean; WXT build succeeds.

## Piece 13: Research + Virtual Sizing (in progress)

### Research Findings
- Current popup is a plain HTML placeholder with no logic (`extension/entrypoints/popup.html`).
- Background now stores `ff_extension_timer` via Piece 12 content-script sync.
- Context7 `/wxt-dev/wxt` confirms:
  - Popup entrypoints are HTML files under `entrypoints/` mapped to `action.default_popup`.
  - To bundle TypeScript, use `<script src="./popup.ts" type="module"></script>`.
  - Extension APIs (`browser.*`) are imported from `wxt/browser`.
  - A new tab can be opened via `browser.tabs.create({ url })` (existing `tabs` permission).
- Real-world reference from `dominhduy09/pomodoro-extension` (GitHub MCP):
  - `popup.html` + `popup.js` plain HTML/CSS/JS.
  - Popup requests state from service worker via `chrome.runtime.sendMessage({ type: 'GET_STATE' })`.
  - Renders timer, mode label, stats, controls; listens to `chrome.storage.onChanged`.
  - For FocusFlow MVP, read-only popup (status + times + open-app link) is enough; controls would desync with web app timer.
- To show project/sub-piece names, `ExtensionTimerState` needs optional `projectName` and `subPieceName`, requiring small changes to `useTimer` and `focusSync.ts`.

### Original Virtual Sizing — Piece 13 (Monolithic)
| Metric | Value |
|---|---|
| New files | 3 (`extension/entrypoints/popup.html`, `extension/entrypoints/popup.ts`, `extension/lib/__tests__/popup.test.ts`) |
| Modified files | 3 (`extension/lib/types.ts`, `hooks/useTimer.ts`, `extension/lib/focusSync.ts`) |
| Hooks | 0 |
| Pages | 1 (popup) |
| Est. lines | ~200 |
| Verdict | ❌ Too Big / borderline — split required |

### Proposed Split

#### Piece 13a — Enrich Timer State with Names ✅ Small
| Metric | Value |
|---|---|
| New files | 0 |
| Modified files | 3 (`extension/lib/types.ts`, `hooks/useTimer.ts`, `extension/lib/focusSync.ts`) |
| Hooks | 0 |
| Pages | 0 |
| Est. lines | ~40 |
| Verdict | ✅ Small |

- Add optional `projectName` and `subPieceName` to `ExtensionTimerState`.
- Update `useTimer.persistSession` to include names from the store.
- Update `focusSync.ts` validation to accept the optional name fields.

#### Piece 13b — Extension Popup UI ✅ Small
| Metric | Value |
|---|---|
| New files | 3 (`extension/entrypoints/popup.html`, `extension/entrypoints/popup.ts`, `extension/lib/__tests__/popup.test.ts`) |
| Modified files | 0 |
| Hooks | 0 |
| Pages | 1 (popup) |
| Est. lines | ~160 |
| Verdict | ✅ Small |

- Replace `popup.html` placeholder with styled popup loading `popup.ts`.
- `popup.ts` reads `ff_extension_timer`, renders names, elapsed/remaining, status, and an "Open FocusFlow" link.
- Test rendering logic with `fakeBrowser` and jsdom.

- **Bugfix Piece 2 — Zustand store rehydration on client navigation: fixed by adding `HydrationSlice` with `hasHydrated` flag, switching `persist` to `skipHydration: true`, and using `StoreHydrationProvider` to explicitly call `persist.rehydrate()` in a `useEffect`; live browser verified that projects now appear on `/projects` and `/timer` after sidebar navigation without hard reload; 172/172 tests passing, TypeScript clean.**

## Bugfix Summary (2026-06-22)

Verification run found web app not ready for release. Fixed so far:

- **Piece 1 — TimerPanel conditional-hooks crash:** all hooks moved before conditional returns; live browser verified `/timer` refresh no longer crashes.
- **Piece 2 — Zustand store rehydration:** added `HydrationSlice`, `skipHydration: true`, and explicit `persist.rehydrate()` in provider; live browser verified projects appear after client-side navigation.
- **Piece 3 — Dashboard stats hardcoded:** converted `app/page.tsx` to client component, wired `totalProjects`, `todayFocusMinutes`, and `currentLevel` to `useFocusStore`; created `app/__tests__/page.test.tsx` with 4 tests; all 176/176 tests passing, TypeScript clean; live browser verified stats update after project creation and timer run.

- **Piece 4 — `useTimer` reset/lint cleanup:** replaced `init.shouldAutoComplete` mutation with `autoCompleteHandledRef`; restructured `tick` so it is declared before the RAF loop references it; verified reset restores `projectElapsed` and `subPieceRemaining` to store values and pauses the timer; `hooks/useTimer.ts` lint errors resolved; 177/177 tests passing, TypeScript clean; live browser verified reset behavior.**

Remaining pieces:
- **Piece 5:** Extension `require()` lint errors. — **REVERTED** due to PC crashes; will revisit later with lighter approach.
- **Piece 6:** `/settings` page missing. — **DELETED** (monolithic attempt caused crashes); will revisit as lightweight feature-by-feature when PC is stable.

Workflow updated: live browser verification with Playwright MCP is now mandatory for UI/timer/extension changes. **Additional rule added:** use lightweight agent mode (narrow scope, targeted tests only, one focused live browser check) when PC resources are limited.

## Current State (2026-06-22 / end of session)

- **Piece 1–4:** Complete and pushed to GitHub.
  - Piece 1: TimerPanel hooks crash fixed.
  - Piece 2: Zustand store rehydration fixed.
  - Piece 3: Dashboard stats wired to store.
  - Piece 4: useTimer lint/reset fixed.
- **Piece 5:** Reverted to pre-fix state (`git revert 5fa610f`). Extension `require()` lint errors remain.
- **Piece 6:** Deleted; no settings page exists.
- **Playwright MCP:** Disabled by user to reduce PC load.
- **Project status:** `npm run dev` and `npm run build` both working; `npm test` 177/177 passing.
- **Workflow updated:** lightweight feature-by-feature mode documented in `.claude/memory/workflow.md`.

## Current State (2026-06-23 / new chat)

- **No new implementation in this session.** User confirmed Playwright MCP remains disabled and manual browser verification will be used for UI/timer/extension changes.
- **Open pieces unchanged:** Piece 5 (extension `require()` lint errors, reverted) and Piece 6 (`/settings` page, deleted) still pending.
- **Test suite:** 177/177 tests passing, TypeScript clean, `npm run dev` and `npm run build` working.
- **Workflow confirmed:** lightweight feature-by-feature mode (≤100 lines, ≤1 new file, targeted tests, no browser automation from agents).

## Next Action (for next chat)
Continue with tiny features only. Piece 5/6 remain open but must be split into ≤100-line features and implemented without Playwright MCP or heavy agents.

## Blockers
None.

## Blockers
None.
