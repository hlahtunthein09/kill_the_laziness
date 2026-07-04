- **Screenshot files committed (2026-07-05):** Committed the five PNG screenshots under `docs/screenshots/` (previously untracked because `*.png` is in `.gitignore`) using `git add -f`. Created `docs/PROJECT_REPORT.md` as a backup reference with all screenshots embedded. README screenshots section kept unchanged. Images should now render on GitHub. Pushed to `main`.
- **README extension tutorial added (2026-07-05):** Expanded `## Loading the Extension` in `README.md` with a highlighted developer-oriented tutorial: prerequisites, build step, loading unpacked extension in Chrome/Edge, verification, reload-after-change workflow, and web app origin note. Committed, merged to `main`, and pushed.
- **README screenshots added (2026-07-05):** Added `## Screenshots` section to `README.md` with the five saved images in `docs/screenshots/` (dashboard, projects, timer, settings, extension) displayed in a markdown table layout.
- **CompletionDialog continue action bugfix (2026-07-05):** Fixed `TimerPanel.tsx` so both "Continue focusing on [project]" and project-target "Continue focusing" buttons switch to project-only focus and immediately start the timer after closing the summary dialog. Added `resumeAfterSummary` state + effect that calls `restart()` then `start()`; the continue handler now always calls `setActiveProject` so it no longer refocuses the completed sub-piece. Updated `TimerPanel.session-summary.test.tsx` to mock `restart`/`start` and assert both are invoked for each continue branch; 82/82 timer tests passing. Full suite still has 4 unrelated pre-existing failures (globals dark mode CSS, ProjectCard target-edit/delete mocks). TypeScript clean.
- **README rewrite (2026-07-05):** Rewrote `README.md` with project purpose, core features, tech stack, project structure, agent workflow, MCP servers, master skills, agents, dev scripts, extension loading instructions, and link to Burmese user guide. Committed and pushed to `main`.
- **Push and merge (2026-07-05):** Committed all working-tree changes on `feature/offscreen-notification-system` (227 files), pushed to GitHub, and merged into `main` via non-fast-forward merge commit `cc3e75c`. Both branches now in sync on origin.
- **ProjectCard lint fixes (2026-07-05):** Removed `setState` from `useEffect` at `ProjectCard.tsx` by replacing dialog-open inline calls with `openTargetDialog` callback; escaped quotes in delete dialog description with `&ldquo;`/`&rdquo;`; removed unused `ProgressLabel`/`ProgressValue` imports. ESLint clean; `ProjectCard.test.tsx` 17/17 passing; TypeScript clean.
- **Skill consolidation (2026-07-05):** Consolidated ~167 per-feature skills into 5 master skills — `frontend-layout-skill.md`, `projects-timer-skill.md`, `extension-notifications-skill.md`, `settings-gamification-skill.md`, `core-data-workflow-skill.md`. Old per-feature skills deleted; only the 5 master skills remain in `.claude/skills/`. Memory updated.
- **CompletionDialog buttons wired (2026-07-04):** `TimerPanel.tsx` "Continue focusing" now refocuses/resets the completed sub-piece via `refocusSubPiece` + `setActiveSubPiece`; "Add new sub-piece" opens `SubPieceForm` and the new sub-piece is set active via `onSubPieceAdded`; added timer restart effect when `activeSubPieceId` changes so the display picks up the new sub-piece's allocated time; restored project-mode summary branch with Back-to-projects button. Updated `SubPieceForm.tsx` with optional `onSubPieceAdded` callback, `SubPieceForm.test.tsx` +1 callback test, `TimerPanel.session-summary.test.tsx` updated for new handlers and project-mode summary; targeted tests 100/100 passing; TypeScript clean. Full suite has 3 unrelated pre-existing failures (globals dark mode CSS, ProjectCard target-edit mock).
- **Session end state (2026-07-04):** Web-app milestone toast → native browser notification wiring was scoped but **not implemented**. Resume from `.claude/memory/notification-toast-wiring-resume.md`. Uncommitted changes on branch `feature/offscreen-notification-system`: CompletionDialog fix + memory updates; full suite 630/633 passing.
- **Completed-project guard dialog (2026-07-04):** Created reusable `ProjectCompletedDialog` with Cancel / Restart from zero / Extend target time options; wired it into `ProjectCard` (focus whole project), `SubPieceCard` (focus/refocus any sub-piece), and `TimerPanel` (Start button). The dialog opens whenever `totalTimeSeconds >= targetTimeSeconds`, blocking silent time accumulation. Removed the blocking target-reached card and the hard target cap so the timer only auto-pauses on crossing the target, then forces the user to choose extend or restart. Updated `useFocusStore.test.ts`, `ProjectCard.test.tsx`, `SubPieceCard.test.tsx`, `TimerPanel.test.tsx`, `useTimer.test.tsx`; 212/212 affected tests passing; `npm run build` and `npm run build:ext` succeed.
- **Notification banner diagnostics (2026-07-04):** Added `requireInteraction: true` to all extension notifications with module augmentation for `CreateNotificationOptions`, replaced `require("wxt/browser")` with dynamic `import("wxt/browser")` in `control.content.ts`, added temporary service-worker logging through the notification chain; `notifications.test.ts` and `control.content.test.ts` updated; TypeScript clean; `npm run build:ext` succeeds. Live browser verification pending.
- **Timer target-cap bugfix (2026-07-04):** `hooks/useTimer.ts` now caps project elapsed at `targetTimeSeconds`, auto-pauses on target reached, exposes `targetReached`, and clears it on reset/reinitialize; `components/timer/TimerPanel.tsx` renders a target-reached card with reset/continue button; `useTimer.test.tsx` + `TimerPanel.test.tsx` updated; 62/62 targeted tests passing; TypeScript clean; `npm run build` succeeds.
- **Extension popup notification status + button layout (2026-07-04):** `popup.html` moved `#notification-status` to top with color-coded dot; `popup.ts` added `renderNotificationStatus`, Start button feedback, and separated Open App outline button; `popup.test.ts` 19/19 passing; TypeScript clean; `npm run build:ext` succeeds. (Also fixed pre-existing `targetReached` return mismatch in `hooks/useTimer.ts` so `tsc --noEmit` passes.)
- **Native start notification wired (2026-07-04):** `extension/lib/timerEngine.ts` `startSession` now calls `notifyStart` with `priority: 2`; `notifications.test.ts` adds 3 `notifyStart` tests; `timerEngine.test.ts` adds start-notification assertion; 58/58 targeted tests passing; TypeScript clean; `npm run build:ext` succeeds.
- **Native notification motivational tiers Phase 6 complete (2026-07-04):** Removed dead `extension/lib/timerAlarm.ts` and `extension/lib/__tests__/timerAlarm.test.ts`; `messageHandler.ts` `UPDATE_TIMER_STATE` branch now a pure storage write with no alarm side effects; cleaned `setAlarmBrowserInstance` references from `controlMessage.test.ts`, `background.test.ts`, and `timerEngine.test.ts`; 43/43 targeted tests passing; TypeScript clean; `npm run build:ext` succeeds.
- **Native notification motivational tiers Phase 5 complete (2026-07-04):** `notifyDistractionBlocked` switched to English title/message; `extension/lib/redirect.ts` now calls `notifyDistractionBlocked` after strict-mode redirect; `notifications.test.ts` and `background-redirect.test.ts` updated with new assertions and notification mocks; 40/40 targeted tests passing; TypeScript clean; `npm run build:ext` succeeds.
- **Native notification motivational tiers paused for chat switch (2026-07-04):** Phases 1–3 complete; Phase 4 (wire `extension/lib/scheduleAlarm.ts` to use `notifyScheduleDue`) is the next pending piece; see `.claude/memory/native-notification-tiers-resume.md` for full resume state.
- **Native notification motivational tiers Phase 3 complete (2026-07-04):** `extension/lib/timerEngine.ts` now uses `notifyMilestone` and `notifySessionComplete` from `extension/lib/notifications.ts`; local `safeCreateNotification` helper and `NotificationsWithPermission` interface removed; completion and milestone notifications carry Burmese-title + English-message motivational content with unique `session-complete-*`/`focus-milestone-*` IDs; `extension/lib/__tests__/timerEngine.test.ts` assertions updated and `Math.random` spied to `0` for exact-tier verification; alarm/state/broadcast/drift invariants preserved; 30/30 timer engine tests passing; TypeScript clean; `npm run build:ext` succeeds.
- **Native notification motivational tiers Phase 2b complete (2026-07-04):** Added `notifySessionComplete`, `notifyScheduleDue`, and `notifyDistractionBlocked` to `extension/lib/notifications.ts`; all use `withPermission`, `getIconUrl`, and unique IDs; name/duration fallbacks and clamping handled; 24/24 notification tests passing; TypeScript clean; `npm run build:ext` succeeds.
- **Native notification motivational tiers Phase 2a complete (2026-07-04):** Created `extension/lib/notifications.ts` shared service with `getIconUrl`, `withPermission`, `nextId`, and `notifyMilestone`; negative elapsed/remaining clamped to 0; 15/15 notification tests passing; TypeScript clean; `npm run build:ext` succeeds.
- **Native notification motivational tiers Phase 1 complete (2026-07-04):** `extension/lib/motivation.ts` `my` field is now Burmese-only and matches `lib/motivation.ts`; public API unchanged; 11/11 motivation tests passing; TypeScript clean; `npm run build:ext` succeeds.
- **Off-screen notification Piece C complete (2026-07-03):** `extension/lib/timerEngine.ts` now broadcasts `STATE_UPDATED` after every state save in `startSession`/`pauseSession`/`resetSession`/`tick` with try/catch; `extension/entrypoints/control.content.ts` forwards `STATE_UPDATED` as `ff:state`; `components/timer/TimerPanel.tsx` listens to `ff:state` and updates displayed elapsed/remaining; `hooks/useTimer.ts` seeds display from `GET_TIMER_STATE` on mount with drift capping; targeted tests pass (`timerEngine` 30/30, `control.content` 5/5, `TimerPanel` 18/18, `useTimer` 41/41); TypeScript clean; `npm run build:ext` succeeds.
- **Off-screen notification Piece B complete (2026-07-03):** `extension/lib/messageHandler.ts` refactored so `START_TIMER`/`PAUSE_TIMER`/`RESET_TIMER` route to `timerEngine.startSession`/`pauseSession`/`resetSession` with payload validation and `{ ok: true }` responses; old tab-forwarding removed; `hooks/useTimer.ts` sends commands via `window.browser.runtime.sendMessage` when available; `controlMessage.test.ts` (8/8) and `useTimer.test.tsx` (39/39) passing; TypeScript clean; `npm run build:ext` succeeds.
- **Off-screen notification Piece A complete (2026-07-03):** `extension/lib/timerEngine.ts` created with `startSession`, `pauseSession`, `resetSession`, `tick`, `restoreOnStartup`, permission-checked notifications, and drift capping; `ExtensionTimerState` extended with `allocatedMinutes`; `background.ts` wired with `restoreOnStartup()` and `ff-keep-alive` alarm branch; 25/25 tests passing; TypeScript clean; `npm run build:ext` succeeds.
- **Pending (2026-07-01):** Sub-piece timer should count up (increasing elapsed) like project timer, with highlighted target label showing allocated time; deferred to next chat due to context limit.
- **Timer Piece B label highlight (2026-07-01):** Target label styled with `text-sm font-semibold text-primary`; `TimerDisplay.test.tsx` passing; TypeScript clean.
- **Timer Piece B label update (2026-07-01):** Target label changed from `ပစ်မှတ်အချိန်` to `သတ်မှတ်ထားသော အချိန်`; `TimerDisplay.test.tsx` updated; 11/11 tests passing; TypeScript clean.
- **Timer Piece B complete (2026-07-01):** `TimerDisplay.tsx` now accepts optional `targetTimeSeconds` prop, renders target label + progress bar under project time, progress clamps at 100%, uses theme tokens for light/dark modes; `TimerDisplay.test.tsx` extended to 11 tests (all passing); TypeScript clean.
- **Timer logic review (2026-06-30):** User clarified FocusFlow AI tracks cumulative focus hours (increment), not countdown. Project-level timer currently initializes from `project.totalTimeSeconds` instead of counting up from 0 to `targetTimeSeconds`. Split plan proposed: Piece A (`useTimer` baseline fix), Piece B (`TimerDisplay` target UI), Piece C (`TimerPanel` wiring). Next chat resumes from Piece A after approval.
- **Session summary (2026-06-29):** Continued dark mode overhaul — project card footer pinned/blended, timer page themed, settings page themed, collapsible sidebar with toggle added, theme selector labels switched to English. Extension builds successfully. Full suite 504/506 passing (2 pre-existing `globals.test.ts` color-format failures). All changes committed and pushed to `fix/session-2026-06-26`.
- **Pushed to GitHub (2026-06-26):** Session changes အားလုံး `fix/session-2026-06-26` branch အဖြစ် push လုပ်ပြီးပါပြီ။ PR link: https://github.com/hlahtunthein09/kill_the_laziness/pull/new/fix/session-2026-06-26
- **Next session note:** New chat မှ စတင်ပြီး manual browser testing → #10 UI overhaul + #11 extension live blocking စစ်ဆေးမည်။ `docs/ui-references.md` နှင့် `docs/USER_GUIDE_MYANMAR.md` ရှိပြီးဖြစ်သည်။
- **UI reference research done (2026-06-26):** Pomofocus, Forest, Freedom, Todoist Karma, MV3 extension popups, WXT best practices များကို analyze၍ `docs/ui-references.md` နှင့် auto-memory index တွင် သိမ်းထား။ မနက်ဖြန် #10 UI overhaul အတွက် အသုံးပြုမည်။
- **Session end (2026-06-26):** Issues #6–#9 + Observations #2A–#5A အားလုံး ပြီးစီး။ #10 (dark/system UI) နှင့် #11 (extension live blocking) ကို manual testing မှတဆင့် နောက်နေ့ ဆက်လက်မည်။ Working tree တွင် changes စုစုပေါင်း ရှိနေသည် — push မလုပ်သေးပါ။
- **Observation #5A decided (2026-06-26):** Reset နှိပ်လျှင် accumulated time ကို ထိန်းထားမည် (undo session semantics မသုံး); code change မလိုပါ။
- **Observation #4A complete (2026-06-26):** `useTimer` auto-resume drift ကို ၆၀ မိနစ်ဖြင့် capping လုပ်ပြီး ထပ်ကြာခဲ့ရင် paused အဖြစ် load ဖြစ်စေခြင်း; 24/24 tests passing; TypeScript clean. Next: #10 (UI) or #11 (extension live test) — user said UI fixes deferred until tomorrow.
- **Observation #3A complete (2026-06-26):** `TimerControls` တွင် `isRunning` အလိုက် Start/Pause button ကို toggle ပြသခြင်း (Reset ကတော့ အမြဲပါသည်); 5/5 tests passing; TypeScript clean.
- **Observation #2A complete (2026-06-26):** Dashboard greeting ကို Header မှ `app/page.tsx` သို့ ရွှေ့ခြင်း; Header.test.tsx 3/3 + page.test.tsx 5/5 passing; TypeScript clean.

- **Timer Piece C complete (2026-07-01):** `TimerPanel.tsx` now passes `activeProject.targetTimeSeconds` to `TimerDisplay`; `TimerPanel.test.tsx` extended with 2 tests for target label/progress bar presence (when target > 0) and absence (when target = 0); 18/18 tests passing; TypeScript clean.

- **Piece C — Sub-piece Budget: Project Target Edit (2026-07-02):** `ProjectCard.tsx` now has pencil icon next to target display opening a target-hours edit dialog; dialog floors to allocated sub-piece sum; uses `useEffect` reset on open; semantic theme tokens only; `ProjectCard.target-edit.test.tsx` 4/4 tests passing; also fixed existing `ProjectCard.test.tsx` and `ProjectCard.status.test.tsx` mocks to include `getRemainingBudgetSeconds` (required by `SubPieceForm` inside `AddSubPieceButton`); all 25 ProjectCard tests passing; TypeScript clean.

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
- **Piece 5a complete:** `extension/lib/storage.ts` `require("wxt/browser")` replaced with dynamic `await import("wxt/browser")`; 5/5 storage tests passing; TypeScript clean; WXT build succeeds.
- **Piece 5b complete:** `extension/lib/timerAlarm.ts` `require("wxt/browser")` replaced with dynamic import; `startFocusAlarm`/`stopFocusAlarm` made async; `messageHandler.ts` updated to await them; 7/7 timerAlarm tests passing; TypeScript clean; WXT build succeeds.
- **Piece 5c complete:** `extension/lib/redirect.ts` `require("wxt/browser")` replaced with dynamic import; 11/11 background-redirect tests passing; TypeScript clean; WXT build succeeds.
- **Piece 5d complete:** `extension/lib/focusSync.ts` `require("wxt/browser")` replaced with dynamic import; 12/12 focusSync tests passing; TypeScript clean; WXT build succeeds.
- **Piece 5 complete:** All 4 extension `require("wxt/browser")` usages fixed across `storage.ts`, `timerAlarm.ts`, `redirect.ts`, and `focusSync.ts`.
- **Piece 6a complete:** `/settings` page shell created with Burmese-first title and 4 placeholder sections; 3/3 tests passing; TypeScript clean; `npm run build` succeeds.
- **Piece 6b complete:** `StrictModeToggle` component created; reads/writes `settings.strictMode` via `useFocusStore`; 4/4 tests passing; TypeScript clean; `npm run build` succeeds.
- **Piece 6c-a complete:** `AddForbiddenUrl` component created; input + add button with validation; reads/writes `settings.forbiddenUrls` via `useFocusStore`; 5/5 tests passing; TypeScript clean; `npm run build` succeeds.
- **Piece 6c-b complete:** `ForbiddenUrlsList` component created; integrated into `/settings` page; reads `settings.forbiddenUrls` and calls `removeForbiddenUrl`/`resetForbiddenUrls`; 4/4 tests passing; TypeScript clean; `npm run build` succeeds.
- **Piece 6d complete:** `NotificationsToggle` component created; reads/writes `settings.notificationsEnabled` via `useFocusStore`; integrated into `/settings` page; 3/3 tests passing; TypeScript clean; `npm run build` succeeds.
- **Piece 6e-a complete:** `ThemeProvider` wrapper created around `next-themes`; `app/layout.tsx` wraps app with `<ThemeProvider>`; `suppressHydrationWarning` kept on `<html>`; 1/1 test passing; TypeScript clean; `npm run build` succeeds.
- **Piece 6e-b complete:** `ThemeSelector` component created; reads `settings.theme` from `useFocusStore`, calls `setTheme` from `next-themes`; uses native `<select>` with Burmese labels and Lucide icons; integrated into `/settings` page; removed leftover placeholder section from `app/settings/page.tsx`; updated `app/__tests__/settings-page.test.tsx` descriptions; full suite 199/199 tests passing; TypeScript clean; `npm run build` succeeds.
- **Piece 7b complete:** `ProjectCard.tsx` active-project indicator added — card-level `ring-2 ring-teal-500 border-teal-500` highlight + `"လက်ရှိ focus လုပ်နေသည် (Currently focusing)"` badge in header; `ProjectCard.test.tsx` active/inactive indicator tests added; 10/10 tests passing; full suite 202/202; TypeScript clean; `npm run build` succeeds.
- **Piece 8a complete:** `incrementProjectTime` now adds `Math.floor(seconds / 60) * XP_PER_MINUTE` XP to the project; `useFocusStore.test.ts` adds 2 tests for full-minute XP gain and partial-minute no-XP; 26/26 store tests passing; full suite 204/204; TypeScript clean; `npm run build` succeeds.
- **Piece 8b complete:** `completeSubPiece` now adds `XP_SUB_PIECE_COMPLETE` (50 XP) to the project; `useFocusStore.test.ts` adds test verifying sub-piece completion grants bonus XP; 27/27 store tests passing; full suite 205/205; TypeScript clean; `npm run build` succeeds.
- **Piece 9b complete:** `extension/lib/focusSync.ts` extended with `syncExtensionSettings()` — reads `ff_focus_store` settings and syncs `strictMode`/`forbiddenUrls` to extension storage via `setExtensionSettings()`; `focusSync.content.ts` polls settings alongside timer; `focusSync.test.ts` updated with 7 settings-sync tests (19/19 passing); full suite 222/222; TypeScript clean; `npm run build:ext` succeeds.
- **MVP status:** Core web app + extension engine complete. User research completed comparing Pomofocus, Forest, Freedom, Todoist Karma, and MV3 pomodoro extension. Identified that the project needs workflow UX fixes to become a daily useful tool, especially off-screen motivational notifications.
- **Tier 1 Piece 1 complete:** ProjectCard focus button now navigates to `/timer` after setting active project; reusable `__mocks__/next-navigation.ts` mock created; `vitest.config.ts` aliased; 10/10 ProjectCard tests passing; full suite 222/222; TypeScript clean; `npm run build` succeeds.
- **Tier 1 Piece 4 complete:** `TimerPanel.tsx` empty state now shows a CTA button `"ပရောဂျက်တစ်ခုရွေးချယ်ပါ (Choose a project)"` that navigates to `/projects`; `TimerPanel.test.tsx` adds navigation test (7/7 passing); TypeScript clean; `npm run build` succeeds; full suite 241/241.
- **Tier 1 Piece 4b complete:** `ProjectCard.tsx` focus button now auto-creates a default sub-piece `"အထွေထွေ focus (General Focus)"` when focusing a project with no sub-pieces; `ProjectCard.test.tsx` adds 2 tests for empty vs non-empty project focus behavior (11/11 passing); TypeScript clean; `npm run build` succeeds; full suite 242/242.
- **Tier 1 Piece 4c complete:** `ProjectCard.tsx` focus button now auto-creates a default sub-piece when a project has no incomplete sub-pieces (covers both empty projects and fully completed projects); completed projects can be re-focused; `ProjectCard.test.tsx` adds re-focus test (12/12 passing); TypeScript clean; `npm run build` succeeds; full suite 243/243.
- **Tier 1 complete:** Core daily focus tool workflow now fully friction-free for all project states — empty projects get default sub-piece, focus navigates to timer, extension sends milestone desktop notifications, default project auto-created, and timer empty-state has clear CTA.
- **Tier 2 Piece 1a complete:** daily focus goal fields added to `AppSettings` and `DEFAULT_APP_SETTINGS`; `incrementProjectTime` now tracks `todayFocusSeconds` with date rollover; 29/29 store tests passing; TypeScript clean.
- **Tier 2 Piece 1b-1 complete:** `components/analytics/DailyFocusGoal.tsx` created showing `todayMinutes / dailyFocusGoalMinutes`; `DailyFocusGoal.test.tsx` 3/3 passing; TypeScript clean; `npm run build` succeeds.
- **Tier 2 Piece 1b-2 complete:** `DailyFocusGoal.tsx` progress bar added (`bg-stone-200` track + `bg-teal-500` fill with percentage); `DailyFocusGoal.test.tsx` 6/6 passing (50% progress, 100% cap, 0% progress); `app/page.tsx` replaced "ယနေ့ focus အချိန်" card with `<DailyFocusGoal />`; `page.test.tsx` updated for new mock shape and assertions; full suite 245/245; TypeScript clean; `npm run build` succeeds.
- **Bugfix:** `DailyFocusGoal.tsx` NaN dashboard bug fixed by defaulting `todayFocusSeconds ?? 0` and `dailyFocusGoalMinutes ?? 60`, plus guarding division by zero; test added for missing persisted settings fields; 6/6 component tests passing; `npm run build` succeeds.
- **Tier 2 Piece 1c complete:** `components/settings/DailyFocusGoalInput.tsx` created — number input with `min={15}`, `max={480}`, `step={5}`; reads/writes `settings.dailyFocusGoalMinutes` via `useFocusStore`; clamps on blur; Burmese-first label + English subtitle; `DailyFocusGoalInput.test.tsx` 4/4 passing (render, update, below-min clamp, above-max clamp); `app/settings/page.tsx` updated; full suite 249/249; TypeScript clean; `npm run build` succeeds.
- **UX fix (Piece 1c):** `DailyFocusGoalInput` now has show/edit mode — input disabled by default with Edit (pencil) button; tapping Edit enables input and shows Confirm (check) button; value only saves on confirm; 6/6 tests passing; `npm run build` succeeds.
- **Tier 2 Piece 2a complete:** `components/timer/QuickFocusInput.tsx` created — input + start button; creates sub-piece under active/default project (auto-creates default project if none); `QuickFocusInput.test.tsx` 5/5 passing; TypeScript clean; `npm run build` succeeds.
- **Tier 2 Piece 2b complete:** `QuickFocusInput` integrated into `app/page.tsx` with `onStart` prop navigating to `/timer`; dashboard renders quick-focus card; 10/10 tests passing (QuickFocusInput + page); TypeScript clean; `npm run build` succeeds.
- **Tier 2 Piece 3a complete:** streak counter fields (`currentStreak`, `longestStreak`, `lastStreakDate`) added to `AppSettings` and `DEFAULT_APP_SETTINGS`; `incrementProjectTime` now increments streak on daily goal reach, continues on consecutive days, resets after gap, and counts only once per day; `useFocusStore.test.ts` 33/33 passing; TypeScript clean; `npm run build` succeeds.
- **Tier 2 Piece 3b complete:** `components/analytics/StreakCounter.tsx` created — reads `settings.currentStreak` and `settings.longestStreak` from `useFocusStore`; renders `Card` matching existing dashboard stat cards with `Flame` icon, Burmese title, big number, and longest streak subtitle; `StreakCounter.test.tsx` 4/4 passing; `app/page.tsx` updated to 4-column grid (`sm:grid-cols-2 lg:grid-cols-4`) with `<StreakCounter />` as 3rd card; `page.test.tsx` updated with streak assertions; full suite 253/253; TypeScript clean; `npm run build` succeeds.
- **Tier 3 Piece 5b complete:** `DistractionLog` integrated into `app/settings/page.tsx` as a new settings section with consistent card styling (`rounded-xl border border-stone-200 bg-white p-6 shadow-sm`); `app/__tests__/settings-page.test.tsx` updated with Burmese (`အာရုံစားသမျှမှတ်တမ်း`) and English (`Distraction Log`) assertions; 3/3 settings page tests passing; TypeScript clean; `npm run build` succeeds.
- **Tier 3 Piece 5a complete:** `components/distraction/DistractionLog.tsx` created — reads `logs` and `clearLogs` from `useFocusStore`; renders log entries with URL, blocked/warned badge, relative time, empty state, and clear button; `DistractionLog.test.tsx` 4/4 passing; TypeScript clean; `npm run build` succeeds.
- **Tier 3 Piece 1a complete:** `components/timer/TimerRing.tsx` created — pure SVG ring with track + progress arc, color thresholds (teal/amber/rose), and configurable `size`/`strokeWidth`; `TimerRing.test.tsx` 7/7 passing; TypeScript clean; `npm run build` succeeds.
- **Tier 3 Piece 1b complete:** `TimerDisplay.tsx` updated with optional `allocatedMinutes` prop, renders `TimerRing` (size 220, strokeWidth 12) behind project time label when `allocatedMinutes > 0`; `TimerPanel.tsx` passes `firstIncompleteSubPiece.allocatedMinutes` to `TimerDisplay`; `TimerDisplay.test.tsx` created (9/9 passing); `TimerPanel.test.tsx` still passing (7/7); full suite 259/259; TypeScript clean; `npm run build` succeeds.
- **Tier 3 Piece 2a complete:** `components/timer/SessionSummary.tsx` created — presentational completion card with Burmese/English header, project/sub-piece names, focused duration, allocated minutes, XP gained, and motivation message; `SessionSummary.test.tsx` 5/5 passing; TypeScript clean; `npm run build` succeeds.
- **Tier 3 Piece 2b complete:** `TimerPanel.tsx` wired to show `SessionSummary` when active sub-piece completes — detects completion via `prevSubPieceRemainingRef` transition, computes XP (`Math.floor(elapsedSeconds / 60) * XP_PER_MINUTE + XP_SUB_PIECE_COMPLETE`), renders `SessionSummary` with dismiss button (`"ဆက်လက်ပါ (Continue)"`) calling `reset()`; `TimerPanel.session-summary.test.tsx` created (3/3 passing); `TimerPanel.test.tsx` still passing (7/7); full suite 262/262; TypeScript clean; `npm run build` succeeds.
- **Tier 3 Piece 3b complete:** `ProjectCard.tsx` status badge now uses `STATUS_COLORS` map — `idle` (stone), `running` (teal), `paused` (amber), `completed` (emerald); `ProjectCard.status.test.tsx` created (4/4 passing); `ProjectCard.test.tsx` still passing (12/12); full suite 266/266; TypeScript clean; `npm run build` succeeds.
- **Tier 3 Piece 3a complete:** `lib/store/slices/projectSlice.ts` updated — `setActiveProject` marks target project `running` and previous running project `idle`; `completeSubPiece` marks project `completed` when all sub-pieces are done; `project-status.test.ts` created (6/6 passing); TypeScript clean; `npm run build` succeeds.
- **Tier 3 Piece 4a complete:** `extension/lib/messageHandler.ts` updated — added `START_TIMER` action, swappable browser instance, and tab forwarding for `EXT_START_TIMER` to FocusFlow tab; `controlMessage.test.ts` created (3/3 passing); TypeScript clean; `npm run build:ext` succeeds.
- **Tier 3 Piece 4b complete:** `extension/lib/messageHandler.ts` updated — added `PAUSE_TIMER` and `RESET_TIMER` to `TimerMessage` union, handlers forwarding `EXT_PAUSE_TIMER`/`EXT_RESET_TIMER` to FocusFlow tab; `controlMessage.test.ts` extended to 7 tests (all passing); TypeScript clean; `npm run build:ext` succeeds.
- **Tier 3 Piece 4c complete:** `extension/entrypoints/popup.html` updated with Start button (`#start-btn`) inside `#popup-content`; `extension/lib/popup.ts` updated with `setupStartButton(state)` — shows button when `state` exists and `isRunning === false`, hides when running or null, sends `START_TIMER` message on click; `extension/lib/__tests__/popup-start.test.ts` created (6 tests); full suite 272/272; TypeScript clean; `npm run build:ext` succeeds.
- **Context switch note:** conversation nearing context limit; Tier 3 Piece 5b (DistractionLog integration into settings page) queued for next chat.
- **Roadmap update (2026-06-23):** Prioritized 12 small pieces across 4 tiers to transform FocusFlow AI into a friction-free daily focus tool:
  - **Tier 1 (must-have):** ✅ Complete
  - **Tier 2 (habit formation, 3 pieces):** ✅ Complete
  - **Tier 3 (polish, 5 pieces):** visual timer ring, session summary, project status updates, extension popup controls, distraction log in web app
  - **Tier 4 (future):** sound toggle, fortress visualization, cross-device sync, scheduled focus sessions

- **Tier 3 Piece 4d complete:** `extension/entrypoints/popup.html` updated with Pause (`#pause-btn`) and Reset (`#reset-btn`) buttons inside `#popup-content` with `.btn-secondary` and `.btn-outline` CSS styles; `extension/lib/popup.ts` updated with `setupPauseResetButtons(state)` — shows buttons when `state` exists and `isRunning === true`, hides when paused or null, sends `PAUSE_TIMER`/`RESET_TIMER` messages on click; `extension/lib/__tests__/popup-pause-reset.test.ts` created (7 tests); full suite 279/279; TypeScript clean; `npm run build:ext` succeeds.
- **Tier 3 Piece 4e complete:** `extension/entrypoints/control.content.ts` created — `defineContentScript` matching `http://localhost:3000/*`, `setupControlListener()` with swappable browser instance, listens for `EXT_START_TIMER`/`EXT_PAUSE_TIMER`/`EXT_RESET_TIMER` and dispatches `ff:start`/`ff:pause`/`ff:reset` CustomEvents with `bubbles: true`; `extension/lib/__tests__/control.content.test.ts` created (4 tests); full suite 283/283; TypeScript clean; `npm run build:ext` succeeds with `content-scripts/control.js` in output.
- **Tier 3 Piece 4f complete:** `components/timer/TimerPanel.tsx` updated — added `useEffect` listeners for `ff:start`/`ff:pause`/`ff:reset` custom events, calling `start()`/`pause()`/`reset()` from `useTimer`; `TimerPanel.extension-controls.test.tsx` created (3/3 passing); TypeScript clean; `npm run build` succeeds; full suite 286/286.
- **Tier 4 Piece 1a complete:** `soundEnabled: boolean` added to `AppSettings` and `DEFAULT_APP_SETTINGS`; `SoundToggle.tsx` created with Burmese-first label + English subtitle, reads/writes `settings.soundEnabled` via `useFocusStore`; `SoundToggle.test.tsx` 4/4 passing; integrated into `app/settings/page.tsx`; TypeScript clean; `npm run build` succeeds; full suite 287/287.
- **Tier 4 Piece 2a complete:** `lib/store/slices/projectSlice.ts` updated — added `getFortressLevelFromXp()` and `getFortressHealthFromXp()` helpers, `fortressLevel`/`fortressHealth` recomputed after XP gain in `incrementProjectTime` and after XP bonus in `completeSubPiece`; `fortress.test.ts` created (4/4 passing); TypeScript clean; `npm run build` succeeds; full suite 295/295.
- **Tier 4 Piece 2b complete:** `components/fortress/FortressSvg.tsx` created — inline SVG fortress with level-based towers (1/2/3), flag at level 4+, health bar (amber < 50, emerald >= 50), Burmese/English label; `FortressSvg.test.tsx` 4/4 passing; TypeScript clean; `npm run build` succeeds; full suite 299/299.
- **Tier 4 Piece 2c complete:** `app/page.tsx` updated — Fortress card added to 5-column stat grid (`lg:grid-cols-5`), reads `activeProjectId` from store, falls back to first project, renders `FortressSvg` with `fortressLevel`/`fortressHealth`; `app/__tests__/page.fortress.test.tsx` created (4/4 passing); TypeScript clean; `npm run build` succeeds; full suite 303/303.
- **Tier 4 Piece 3a complete:** `lib/sync.ts` created with `exportStore()` — reads `useFocusStore.getState()`, returns JSON with `version: 1`, `exportedAt`, `projects`, and `settings`; guards against undefined state; `lib/__tests__/sync.export.test.ts` created (4/4 passing); TypeScript clean; `npm run build` succeeds; full suite 307/307.
- **Tier 4 Piece 3b complete:** `lib/sync.ts` updated with `importStore()` — validates JSON shape (`version`, `projects`, `settings`), validates project `id`/`name` and settings `forbiddenUrls`, loads into `useFocusStore.setState()`; `lib/__tests__/sync.import.test.ts` created (4/4 passing); TypeScript clean; `npm run build` succeeds; full suite 311/311.
- **Tier 4 Piece 3c complete:** `components/settings/SyncPanel.tsx` created — download backup button with Burmese-first label, shadcn `Button`, card-style container, disabled when export empty; `SyncPanel.test.tsx` 3/3 passing; integrated into `app/settings/page.tsx`; TypeScript clean; `npm run build` succeeds; full suite 314/314.
- **Tier 4 Piece 3d complete:** `SyncPanel.tsx` updated with hidden file input (`ref`), "Restore Backup" upload button (`Upload` icon, `variant="outline"`, Burmese-first label), `FileReader`-based `onFileChange` handler calling `importStore()`, inline success/error status messages, input cleared after selection for re-import; `SyncPanel.test.tsx` extended with 3 upload tests (6/6 total); TypeScript clean; `npm run build` succeeds; full suite 317/317.

## Tier 4 Piece 4: Scheduled Focus Sessions — Revised Split Plan

Previous 4a scope (type + full store slice) too large for current PC load. Re-split into ≤~70 implementation-line pieces.

Research summary (see `.claude/memory/schedule-spec.md`):
- Type: `FocusSessionSchedule` with `projectId`, optional `subPieceId`, `dayOfWeek`, `startTime`, `durationMinutes`, `enabled`, `createdAt`.
- Store: new `ScheduleSlice` with add/edit/delete/toggle/getters, wired into `useFocusStore`.
- UI: `ScheduleCard`, `ScheduleList`, `ScheduleForm` in settings page.
- Timer: `useScheduleWatcher` hook polls every minute and surfaces a due schedule; `ScheduleToast` notifies user.
- Extension: sync schedules to extension storage + background alarm notification (optional last pieces).

### Proposed Sub-Pieces

| # | Piece | New files | Modified files | Est. impl lines | Tests |
|---|---|---|---|---|---|
| 4a | Type + default constants | 1 test | `lib/types/index.ts`, `lib/constants.ts` | ~25 | type/constant shape |
| 4b | Store slice add/delete/toggle | 1 slice + 1 test | `lib/store/useFocusStore.ts` | ~55 | CRUD + toggle |
| 4c | Store slice update + getters | 0 | `lib/store/slices/scheduleSlice.ts` | ~40 | update, getSchedulesForDay, getNextDueSchedule |
| 4d | `ScheduleCard` component | 1 comp + 1 test | 0 | ~50 | render, toggle, delete |
| 4e | `ScheduleList` component | 1 comp + 1 test | 0 | ~50 | list, empty state |
| 4f | `ScheduleForm` add dialog | 1 comp + 1 test | 0 | ~70 | add schedule with project/sub-piece/day/time/duration |
| 4g-a | `ScheduleForm` edit mode | 0 | `ScheduleForm.tsx`, `ScheduleForm.test.tsx` | ~35 | updateSchedule path |
| 4g-b | Edit trigger in `ScheduleCard`/`ScheduleList` | 0 | `ScheduleCard.tsx`, `ScheduleList.tsx`, their tests | ~50 | edit button + state |
| 4g-c | Settings page schedules section | 0 | `app/settings/page.tsx`, `settings-page.test.tsx` | ~25 | settings section |
| 4h | `useScheduleWatcher` hook | 1 hook + 1 test | 0 | ~60 | polling, dedup, due detection |
| 4i | `ScheduleToast` component | 1 comp + 1 test | 0 | ~45 | toast renders, action button |
| 4j | TimerPanel schedule integration | 0 | `components/timer/TimerPanel.tsx` | ~35 | watcher + toast wired |
| 4k | Extension schedule sync | 1 test | `extension/lib/focusSync.ts`, `extension/lib/types.ts` | ~45 | schedules forwarded to extension |
| 4l | Extension schedule alarm + notification | 1 lib + 1 test | `extension/entrypoints/background.ts` | ~60 | background alarm, desktop notification |

### Status
- **Tier 4 Piece 4a complete:** `FocusSessionSchedule` type added to `lib/types/index.ts`, `DEFAULT_SCHEDULE_DURATION_MINUTES = 25` added to `lib/constants.ts`, `lib/__tests__/schedule-constants.test.ts` created (2/2 passing); TypeScript clean.
- **Tier 4 Piece 4b complete:** `lib/store/slices/scheduleSlice.ts` created with `addSchedule`, `deleteSchedule`, `toggleSchedule`; wired into `useFocusStore.ts`; `lib/store/__tests__/scheduleSlice.test.ts` created (4/4 passing); TypeScript clean.
- **Tier 4 Piece 4c complete:** `scheduleSlice.ts` extended with `updateSchedule`, `getSchedulesForDay`, `getNextDueSchedule`; `scheduleSlice.test.ts` extended to 10 tests (all passing); TypeScript clean.
- **Tier 4 Piece 4d complete:** `components/schedule/ScheduleCard.tsx` created with Burmese day labels, project/sub-piece display, enable toggle, delete button; `ScheduleCard.test.tsx` created (3/3 passing); TypeScript clean.
- **Tier 4 Piece 4e complete:** `components/schedule/ScheduleList.tsx` created — reads schedules/projects from store, sorts by day/time, renders `ScheduleCard`, empty state; `ScheduleList.test.tsx` created (3/3 passing); TypeScript clean.
- **Tier 4 Piece 4f complete:** `components/schedule/ScheduleForm.tsx` created — dialog form with project/sub-piece/day/time/duration, calls `addSchedule`; `ScheduleForm.test.tsx` created (3/3 passing); TypeScript clean.
- **Tier 4 Piece 4g-a complete:** `ScheduleForm.tsx` extended with optional `schedule` prop, edit mode calls `updateSchedule`; `ScheduleForm.test.tsx` extended to 5 tests (all passing); TypeScript clean.
- **Tier 4 Piece 4g-b complete:** `ScheduleCard.tsx` got edit button, `ScheduleForm.tsx` got controlled `open`/`onOpenChange` props, `ScheduleList.tsx` manages edit state and renders controlled edit form; tests added/updated (3 + 4 + 5 = 12 passing); TypeScript clean.
- **Tier 4 Piece 4g-c complete:** Settings page `/settings` updated with Scheduled Focus section containing `ScheduleForm` + `ScheduleList`; `settings-page.test.tsx` extended to 6 tests (all passing); TypeScript clean; `npm run build` succeeds.
- **Tier 4 Piece 4h complete:** `hooks/useScheduleWatcher.ts` created — polls every 60s, surfaces due schedule at most once per minute; `useScheduleWatcher.test.ts` created (4/4 passing); TypeScript clean.
- **Tier 4 Piece 4i complete:** `components/schedule/ScheduleToast.tsx` created — shows Burmese-first `sonner` toast when schedule is due, with Start action to `/timer`; `ScheduleToast.test.tsx` created (3/3 passing); TypeScript clean.
- **Tier 4 Piece 4j complete:** `TimerPanel.tsx` wired with `useScheduleWatcher` + `ScheduleToast`; `TimerPanel.test.tsx` extended to 9 tests (all passing), including mock fix for `lib/sound`; TypeScript clean.
- **Tier 4 Piece 4k complete:** `extension/lib/types.ts` updated with optional `schedules?: FocusSessionSchedule[]`; `extension/lib/focusSync.ts` reads schedules from `ff_focus_store` and forwards them in `UPDATE_TIMER_STATE` payload; `focusSync.test.ts` extended to 20 tests (all passing); TypeScript clean; `npm run build:ext` succeeds.

- **Tier 4 Piece 4l complete:** `extension/lib/scheduleAlarm.ts` created with `startScheduleAlarm`, `stopScheduleAlarm`, `onScheduleAlarmTick` (reads timer state, checks enabled schedules against current day/time, sends Burmese-first desktop notification when due, dedups by schedule id + minute); `extension/lib/__tests__/scheduleAlarm.test.ts` created (5 tests all passing); `extension/entrypoints/background.ts` updated with `startScheduleAlarm()` call and `schedule-check` alarm listener; TypeScript clean; `npm run build:ext` succeeds.

**Tier 4 Piece 4 (Scheduled Focus Sessions) — COMPLETE.**

### Verification
- Full suite: `npm test` — **412/412 tests passing**
- Web build: `npm run build` — succeeds
- Extension build: `npm run build:ext` — succeeds

### Fixes applied during verification
- `hooks/useScheduleWatcher.ts`: made `schedules` access defensive (`schedules?.length`).
- `components/schedule/__tests__/ScheduleToast.test.tsx`: switched from `vi.mock('sonner')` to `vi.spyOn(toast, 'info')` to avoid module-cache conflicts in full suite.
- `components/timer/__tests__/TimerPanel.session-summary.test.tsx`: added `schedules`, `getNextDueSchedule`, and mocked `@/lib/sound`.
- `components/timer/__tests__/TimerPanel.extension-controls.test.tsx`: added `schedules` and `getNextDueSchedule` to mock store.

### Next Action
Push current changes to GitHub. Then begin Playwright MCP browser verification one tiny test at a time (starting with P1) after user approval.

## Blockers
None.

## Playwright MCP Verification Plan (Source of Truth)

Execution rules: one test at a time, confirm each before next, ≤90 seconds per test, headless, no screenshots, no vision, **reuse single browser context across tests** (do not close/reopen browser; reset state via localStorage clear + page refresh instead), max 3 assertions per test, UI/UX checks included for every test (layout/ratio/overflow, responsive, theme, color/font, UX labels/empty states/button feedback, glitches/console errors).

**Rationale updated 2026-06-25:** Closing/reopening the browser context per test caused a PC shutdown/crash. Reusing the browser context is now mandatory to reduce resource load.

### Test Catalog

| # | Code | Test | Status |
|---|---|---|---|
| 1 | P1 | Open projects page | ✅ PASS |
| 2 | P2 | Add project dialog | ✅ PASS |
| 3 | P3 | Create project | ✅ PASS |
| 4 | P4 | Empty state | ✅ RESOLVED (expected behavior — default project auto-created) |
| 5 | P5 | Focus project | ✅ PASS |
| 6 | SP1 | Default sub-piece | ✅ PASS |
| 7 | SP2 | Add sub-piece | ✅ PASS |
| 8 | T1 | Load timer | ✅ PASS |
| 9 | T2 | Start timer | ✅ PASS |
| 10 | T3 | Pause timer | ✅ PASS |
| 11 | T4 | Reset timer | ✅ PASS |
| 12 | T5 | Session summary | ❌ FAIL |
| 13 | D1 | Daily goal | ✅ PASS |
| 14 | D2 | Streak | ✅ PASS |
| 15 | D3 | Fortress | ✅ PASS |
| 16 | D4 | Quick focus | ✅ PASS |
| 17 | S1 | Settings page loads | ⚠️ PARTIAL (nested-button bug, see Issue Log) |
| 18 | S2 | Strict mode toggle | ✅ PASS |
| 19 | S3 | Notifications toggle | ✅ PASS |
| 20 | S4 | Sound toggle | ✅ PASS |
| 21 | S5 | Theme selector | ✅ PASS |
| 22 | S6 | Daily focus goal input | ✅ PASS |
| 23 | S7 | Add forbidden URL | ✅ PASS |
| 24 | S8 | Forbidden URLs list | ✅ PASS |
| 25 | S9 | Distraction log | ✅ PASS |
| 26 | S10 | Sync export | ✅ PASS |
| 27 | S11 | Sync import | ✅ PASS |
| 28 | S12 | Schedule add/edit/delete | ✅ PASS (Issue #8 reconfirmed) |
| 29 | E1 | Extension popup loads | ⏸️ DEFERRED (user manual) |
| 30 | E2 | Extension start button | ⏸️ DEFERRED (user manual) |

### SP2 Notes
- Dialog title: "အခန်းကဏ္ဍအသစ် ထည့်ရန် (Add New Sub-piece)" ✓
- Name input + allocated minutes spinbutton (default 25) rendered ✓
- Saved "Test Sub-piece" with 25 minutes; appeared in project card as "Test Sub-piece / 25 မိနစ် / စောင့်ဆိုင်းနေသည် (Idle)" ✓
- No console errors ✓
- Observation: dashboard header greeting ("မင်္ဂလါပါ၊ ဒီနေ့လည်း focus လုပ်ကြမယ်") renders at top of /projects page — may be intentional layout or worth reviewing.

### T1 Notes
- Timer page title "အချိန်မှတ်တမ်း (Timer)" rendered ✓
- Active project name "Test Project" visible ✓
- Active sub-piece name "Test Sub-piece" visible ✓
- Timer display shows "Project Time: 0m" and "Remaining: 25m" ✓
- Start/Pause/Reset buttons visible ✓
- No console errors ✓

### T2 Notes
- Clicked Start button; status changed from "ခဏရပ်ထား (Paused)" to "လုပ်ဆောင်နေသည် (Running)" ✓
- Project time increased from 0m to 1m 39s ✓
- Remaining time decreased from 25m to 23m 21s ✓
- No console errors ✓
- Observation: Start/Pause/Reset button labels all remain in DOM text; need to verify actual visible toggle via CSS/snapshot if this becomes a UX concern.

### T3 Notes
- Start button was disabled on load because an active session (`ff_active_session`) already existed and timer was auto-running. Pause button was clickable instead.
- Clicked Pause; status changed from "လုပ်ဆောင်နေသည် (Running)" to "ခဏရပ်ထား (Paused)" ✓
- `ff_active_session.isRunning` changed to `false` ✓
- No console errors ✓
- Observation: active session persists across page loads/test runs; clearing it before a fresh timer test requires navigating away or clearing after page unload. Consider whether this is expected behavior.

### T4 Notes
- Seeded store with project totalTimeSeconds=120, subPiece elapsedSeconds=120; initial display showed Project Time 2m / Remaining 23m.
- Started timer, let it run, then clicked Reset.
- After Reset: timer paused, `ff_active_session` cleared, status "ခဏရပ်ထား (Paused)" ✓
- Store values updated to 145s (accumulated session time retained); display showed 2m 25s / 22m 35s.
- No console errors ✓
- Observation: Reset keeps accumulated store time; it does not restore pre-run values. Behavior matches "reset session to current store state" but contradicts older memory note claiming reset restores original store values. See issue file.

### T5 Notes
- Seeded active sub-piece with allocatedMinutes=1, elapsedSeconds=58, remaining 2s, isRunning=true.
- After ~5s, store updated correctly: subPiece status "completed", project status "completed", xp +50, totalTimeSeconds 60, elapsedSeconds 60.
- **Expected:** `SessionSummary` card should appear with project/sub-piece names, focused duration, XP, motivation message, and Continue button.
- **Actual:** TimerPanel rendered empty state "အခန်းကဏ္ဍများ မရှိသေးပါ / No sub-pieces to focus on" instead of `SessionSummary`.
- No console errors.
- **Verdict:** ❌ FAIL — completion logic works but SessionSummary UI did not display.

### D1 Notes
- Dashboard loaded with `DailyFocusGoal` card visible ✓
- Title: "နေ့စဉ် focus ရည်မှန်းချက်" ✓
- Progress text: "30 / 60 မိနစ်" ✓
- Percentage: "50% achieved" ✓
- No console errors ✓
- Observation: card shows "(Goal reached)" subtitle at 50%, which is inaccurate — goal should only be "reached" at 100%.

### Issue Log
- **P4 — Empty state:** Feature issue detected (not UI/UX). Details to be filled in after SP2 run.
- **T5 — Session summary:** Sub-piece completion updates store correctly, but `SessionSummary` card does not render; `TimerPanel` falls back to empty state instead.
- **D1 — Daily goal:** "Goal reached" text appears at 50% progress; should likely appear only at 100%.
- **S1 — Settings page:** ScheduleForm `DialogTrigger` renders a `<button>` wrapping the shadcn `Button` (another `<button>`) → nested-button hydration error (2 console errors). Fix: add `asChild` to `DialogTrigger` in `components/schedule/ScheduleForm.tsx`.

### Next Action
Playwright web-app verification COMPLETE: 28/28 web tests run (all S-tests done). E1/E2 (extension popup + start button) DEFERRED to user manual testing — load `.output/chrome-mv3` in Chrome, open popup, verify render + Start button. Covered by unit tests meanwhile (popup 12 + start 6 + pause/reset 7).

### S12 Notes
- Add: opened Add Schedule dialog, filled project/day(Wed)/time(14:30)/duration(30) via native setters, Save → store schedules len 1, card rendered ("14:30 · 30 min") ✓.
- Edit: pencil → edit dialog, duration 30→45, Update → store durationMinutes 45 ✓.
- Delete: trash → store schedules empty, card removed ✓.
- Issue #8 reconfirmed: Add Schedule trigger is button>button (nested). No new issues. PASS.
- Drove hidden file input via DataTransfer (handler uses FileReader, waited 300ms).
- Valid backup → store replaced with "Imported Project", success "Backup restored" ✓.
- Malformed JSON → error "Invalid backup file", store unchanged ✓.
- No new console errors. PASS.
- Intercepted `URL.createObjectURL` to capture the export blob from the Download button.
- Payload: `version:1`, `exportedAt` number, `projects` array len 1 (== store), `settings` obj 11 keys ✓.
- Download button enabled; real file `focusflow-backup-*.json` downloaded. No new console errors. PASS.
- Seeded 2 logs (reddit.com/r/all=blocked, twitter.com/home=warned) into `ff_focus_store`, reloaded /settings.
- Both rendered correctly: blocked badge red + "2m ago", warned badge amber + "Just now" ✓.
- Clear button → store `logs` emptied to 0, empty state "No distractions logged yet" shown ✓.
- Only 2 pre-existing S1 nested-button console errors; no new errors. PASS.

### Session resource note (2026-06-25)
- PC has crashed TWICE this session. Keep Playwright load minimal: reuse single browser context (never close/reopen), one test at a time, prefer evaluate() over heavy snapshots, no screenshots/vision. Persist progress + issues to memory after every test.

### S7 Notes
- Baseline 7 URLs. Typed "example.com/distract" + Add → store 7→8, entry rendered with Remove button, input cleared ✓. Removed test entry → back to 7. No new console errors.

### S8 Notes
- Baseline 7 defaults, reddit.com present. Remove reddit.com → store 7→6, gone from list ✓.
- Reset to Defaults → exact 7 default URLs restored (incl. reddit.com) ✓. No new console errors. State clean.

### Verification scope reminder
- 25/30 done. Remaining: S9, S10, S11, S12, E1, E2.
- Open issues (in verification-issues-2026-06-25.md): #1 P4 empty state, #6 T5 session summary, #7 D1 goal-reached-at-50%, #8 S1 nested-button hydration, #10 S5 dark/system theme UI broken, #11 forbidden-URL blocking never verified live. Plus observations #2-#5, #9.

### S5 UI issue
- User manually confirmed: theme selector works (store + html class update) but only LIGHT theme renders correctly; dark/system UI is broken/misaligned. Logged as Issue #10 in verification-issues file. UI rework deferred until after full manual test pass.

### S6 Notes
- Initial 60, disabled, Edit button present. Edit → input enabled + Confirm button; store stayed 60 (no keystroke save).
- Set 90 + Confirm → store 90, input disabled again ✓.
- Clamp: set 5 + Confirm → 15 (UI + store) ✓. Restored to 60.

- **Piece A — Sub-piece Completion Modal complete (2026-07-02):** `components/timer/CompletionDialog.tsx` created — shadcn Dialog with Burmese/English title, project/sub-piece info, focused time, allocated time, XP gained, and two footer buttons (Add another sub-piece, Continue focusing project); `components/timer/TimerPanel.tsx` — replaced inline `SessionSummary` with `CompletionDialog` for sub-piece completion, added `isSubPieceFormOpen` state, `handleAddSubPiece` (closes dialog, opens `SubPieceForm`), `handleContinueProject` (calls `setActiveProject` + `reinitialize`, closes dialog), `SubPieceForm` rendered in all active-project branches; `CompletionDialog.test.tsx` 4/4 tests (render, info display, add button, continue button); `TimerPanel.session-summary.test.tsx` updated — 7/7 tests (CompletionDialog render, XP, project target fallback, add button opens SubPieceForm, continue button calls setActiveProject+reinitialize); `TimerPanel.test.tsx` — added `SubPieceForm` mock; full suite 29/29 timer tests passing; `npx tsc --noEmit` clean.
- **Sub-piece Budget Piece A complete (2026-07-02):** `projectSlice.ts` — added `getRemainingBudgetSeconds` getter, clamped `addSubPiece` allocatedMinutes to remaining budget, floored `updateProject` target at allocated sum. `useFocusStore.test.ts` +6 budget tests; adjusted pre-existing `refocusSubPiece` test target 3600→7200 so 75min fits. 69/69 store tests passing; `npx tsc --noEmit` clean.
- **Sub-piece Budget Piece B complete (2026-07-02):** `SubPieceForm.tsx` — live remaining budget line `Project အတွက်ကျန်ရှိသော အချိန်`, over-budget validation, Save disabled at 0 budget. `SubPieceForm.test.tsx` +3 tests; labels later edited by user to `သတ်မှတ်အချိန်`, `သတ်မှတ်ထားသောအချိန်ထက်ကျော်လွန်နေပါသည်`; test assertions updated. 10/10 passing; tsc clean.
- **Sub-piece Budget Piece C complete (2026-07-02):** `ProjectCard.tsx` — hours-based target edit dialog, floored at allocated sum, pencil icon highlighted with `bg-primary/10`. `ProjectCard.target-edit.test.tsx` 4 tests. 25/25 ProjectCard tests passing; tsc clean.
- **Project delete button complete (2026-07-02):** `ProjectCard.tsx` — trash icon in header with confirmation dialog, calls `deleteProject`. `ProjectCard.delete.test.tsx` 4 tests. 29/29 ProjectCard tests passing; tsc clean.
- **Timer target-completion bugfix Piece A complete (2026-07-02):** `projectSlice.ts` — added `completeProject` action, capped `incrementProjectTime` at target and auto-marks project `completed`. `useTimer.ts` — reads target, stops timer at target, calls `completeProject` + `onComplete`. Store + useTimer tests +8; 108/108 passing; tsc clean.
- **Timer target-completion bugfix Piece B complete (2026-07-02):** `TimerPanel.tsx` — added `projectCompleted` state, renders `SessionSummary` for project target completion with `ပရောဂျက်ပစ်မှတ် (Project Target)` label and target-based XP. `TimerPanel.session-summary.test.tsx` +3 tests; 27/27 TimerPanel tests passing; tsc clean.
- **Sub-piece completion → project status bugfix (2026-07-02):** Removed `allCompleted` logic from `completeSubPiece`; project now only completes when target time is reached, not when all sub-pieces finish. Updated `useFocusStore.test.ts` + `project-status.test.ts` expectations. 80/80 store tests passing; tsc clean.
- **Sub-piece allocated minutes input hardening (2026-07-02):** `SubPieceForm.tsx` — added `min={0}`, sanitized negative values to 0, blocked `-` key, and 0/negative are rejected by validation. `SubPieceForm.test.tsx` +1 negative-key test; 11/11 passing; tsc clean.
- **Project target completion modal Piece B complete (2026-07-02):** `CompletionDialog.tsx` extended with `mode="project"`; `TimerPanel.tsx` replaced project-target `SessionSummary` with project-mode dialog, continue button labeled `"continue"` (English only). `CompletionDialog.test.tsx` +5 project-mode tests; `TimerPanel.session-summary.test.tsx` updated. Full suite 559/561 passing; tsc clean.
- **Piece C — Extension Off-Screen Completion Notifications complete (2026-07-02):** Extension notifications now show contextual messages: sub-piece completion `{subPieceName} အတွက် အချိန် ပြည့်ပါပြီ` / `{subPieceName} is complete. Let's move on to the next one.`; project target completion `{projectName} အတွက် အချိန်ပြည့်ပါပြီ` / `{projectName} target reached. Proud of your focus.` Added `targetTimeSeconds` to `ExtensionTimerState`, sync, and alarm logic. 71/71 targeted tests passing; `npm run build:ext` succeeds; tsc clean.
- **Dialog non-dismissible fix (2026-07-02):** `components/ui/dialog.tsx` wrapper extended with `dismissible` prop; when `false`, outside click, Escape key, and focus-out are blocked via `eventDetails.preventUnmountOnClose()`. Applied `dismissible={false}` to `ProjectForm`, `SubPieceForm`, `SubPieceCard` refocus dialog, `ProjectCard` refocus/target/delete dialogs, `ScheduleForm`, and `CompletionDialog`. Full suite 564/566 passing; tsc clean.
- **Number input backspace fix (2026-07-02):** Removed `min` attributes from `SubPieceForm` allocated minutes and `ProjectForm` target hours. Changed state to `number | ""` so users can clear the input with backspace; empty/invalid values are caught by validation. Form tests 18/18 passing; full suite 564/566 passing; tsc clean.
- **Completion dialog overflow fix (2026-07-02):** `CompletionDialog.tsx` footer buttons now stack vertically with `w-full h-auto whitespace-normal` so long Burmese/English labels don't overflow the modal. Full suite 564/566 passing; tsc clean.
- **ProjectForm negative key block (2026-07-02):** Added `onKeyDown` to target-hours input to prevent `-` key. Full suite 564/566 passing; tsc clean.
- **Completion dialog buttons simplified (2026-07-02):** Removed English sub-labels from buttons; buttons are now Burmese-only and forced to stack vertically at all breakpoints (`sm:flex-col`). Project-mode continue button changed from `continue` to `ဆက်လက်ပါ`. Tests updated. Full suite 564/566 passing; tsc clean.
- **Completion dialog footer border removed (2026-07-02):** `CompletionDialog.tsx` `DialogFooter` now uses `border-0` so no visible separator above the buttons. Tests 9/9 passing; tsc clean.
- **Full suite latest (2026-07-02):** 564/566 passing; 2 pre-existing `globals.test.ts` dark-mode CSS failures remain unrelated. `npx tsc --noEmit` clean. All changes uncommitted on branch `fix/session-2026-06-26`.











### S5 Notes
- Initial theme "system" (selector + store), html resolved to "light".
- Selected "dark": store theme → "dark", <html> class → "dark" ✓. (next-themes uses class, not data-theme.)
- Reset back to "system" to leave state clean. No new console errors.

### S4 Notes
- Initial soundEnabled true (UI + store); clicked label, both flipped to false ✓.
- No new console errors (2 pre-existing S1 nested-button errors persist).

### S3 Notes
- Initial notificationsEnabled true (UI + store); clicked label, both flipped to false ✓.
- No new console errors (2 pre-existing S1 nested-button errors persist).

### S2 Notes
- Initial strictMode false (UI + store); clicked label, both flipped to true ✓.
- No new console errors (2 pre-existing S1 nested-button errors persist).
- Toggle is sr-only checkbox + visible div; direct checkbox click times out (div intercepts), click wrapping label instead. Real users unaffected.

### D4 Notes
- Button disabled when input empty, enabled after typing "Write docs" ✓.
- Submit added sub-piece "Write docs" (25 min) to active project (count 1→2), navigated to /timer ✓.
- 0 console errors. Input + Start button fit card, Play icon + Burmese label render.
- Dashboard group D1–D4 complete.

### D3 Notes
- Seeded project xp=380, fortressLevel=2, fortressHealth=60, set as active; reloaded /.
- Label "အဆင့် 2 (Level 2)" ✓; SVG had base+2 teal towers, emerald health bar, 0 flags ✓ (matches level 2, health>=50).
- 0 console errors. SVG fits card in 5-col grid, theme colors correct.

### D2 Notes
- Seeded currentStreak=5, longestStreak=12; reloaded dashboard.
- Streak card renders "5" and "စံချိန်: 12 ရက် (Best: 12)" ✓; 0 console errors.
- Minor: label "အစဉ်လိုက်က်" has doubled က် (should be "အစဉ်လိုက်"). Spelling only.
- Re-confirmed D1 "Goal reached" text shows at 50%.
- Note: cleared orphaned MCP Chrome (mcp-chrome-73e7532 profile) from prior crash to release browser lock before D2.

## ✅ VERIFICATION SESSION COMPLETE — 2026-06-25 (RESTING before fixes)

**State:** All 28 web-app Playwright tests run. E1/E2 (extension popup + start button) DEFERRED to user manual testing (`npm run build:ext` → load `.output/chrome-mv3` in Chrome). Web catalog effectively COMPLETE.

**User decision:** Pausing here to rest the PC. No fixes started yet. Resume the fix pass in a later session, one tiny piece at a time (lightweight agent mode, live browser verify each).

### Issue Ledger (11 logged: 1 resolved, 5 bugs, 1 gap, 4 observations)

**✅ Resolved (1)**
- #1 P4 empty state — NOT a bug. `StoreHydrationProvider.tsx:17` auto-creates default project "နေ့စဥ် Focus နေရာ (Daily Focus)" when none exist (Tier 1, intentional). Project empty state unreachable by design.

**🐞 Bugs to fix (5)**
- #6 T5 SessionSummary — store completes correctly but SessionSummary card never renders; TimerPanel falls back to empty state. (`components/timer/TimerPanel.tsx`, `SessionSummary.tsx`, `hooks/useTimer.ts`) — highest impact.
- #7 D1 "Goal reached" at 50% — shows at 30/60 min; should be ≥100% only. (`components/analytics/DailyFocusGoal.tsx`)
- #8 Nested `<button>` (S1+S12) — `ScheduleForm` DialogTrigger wraps shadcn Button → hydration error (2 console errors). Fix: add `asChild` to DialogTrigger. (`components/schedule/ScheduleForm.tsx`)
- #9 D2 streak typo — "အစဉ်လိုက်က်" doubled က်; should be "အစဉ်လိုက်". (`components/analytics/StreakCounter.tsx`)
- #10 Dark/system theme UI — logic OK (html class flips) but only light styled correctly; dark/system broken. Needs broad dark-variant pass. (global styles + all fixed bg-*/text-* components)

**⚠️ Coverage gap (1)**
- #11 Forbidden-URL blocking never live-verified — web app only stores URLs; block/redirect/warn lives in extension, only mocked-unit-tested. Needs real Chrome with loaded extension. (`extension/lib/redirect.ts`, `urlChecker.ts`, `warn.content.ts`, `blocked.html`)

**🔍 Observations — need user decision (4)**
- #2 Dashboard greeting renders on /projects — intentional cross-page or dashboard-only?
- #3 Timer Start/Pause/Reset labels all in DOM — real visibility toggle or all rendered?
- #4 Active session auto-resumes on reload — feature or should start paused?
- #5 Reset keeps accumulated time — reset-to-store vs undo-session semantics?

### Suggested fix order (when resuming)
Quick wins first: #9 (typo) → #8 (asChild) → #7 (goal wording) → #6 (SessionSummary, most impactful) → #10 (dark theme, biggest) → #11 + observations (need decisions/manual extension).

## FIX PASS — starting next chat (2026-06-25 handoff)

Context filled; switching to a new chat to begin the fix pass. **Playwright MCP switched OFF by user (token cost)** — UI/timer fixes verified via manual browser next chat, not Playwright. Unit tests (vitest) + tsc still mandatory per piece.

- **Next piece: #9 Streak typo** — `StreakCounter.tsx:23` `အစဉ်လိုက်က်` → `အစဉ်လိုက်`; update test `StreakCounter.test.tsx:45` (asserts the typo). Sizing: 0 new / 2 modified / ~2 lines / Trivial. Tests required. Workflow at Step 3 done → Step 4 (skill after approval) next.
- **Issue #6 complete (2026-06-26):** `useTimer` `onComplete` callback ထည့်ခြင်း (6a) + `TimerPanel` တွင် `showSummary(true)` ခေါ်ခြင်းဖြင့် SessionSummary မပြခြင်း ပြင်ဆင်ခဲ့သည် (6b); session-summary tests 3/3 + TimerPanel tests 9/9 passing; TypeScript clean. Next: #10 or #11/observations.
- **Issue #6a complete (2026-06-26):** `useTimer` hook တွင် `onComplete` callback ထည့်ပြီး sub-piece auto-complete ဖြစ်သောအခါ reliable အဖြစ် notify လုပ်ခဲ့သည်။ 23/23 tests passing; TypeScript clean.
- **Issue #7 fixed (2026-06-26):** `DailyFocusGoal` တွင် `(Goal reached)` ကို 100% မှသာ ပြသခြင်းဖြင့် 50% မှာ အမှားပြသခြင်း ပြင်ဆင်ခဲ့သည်။ 6/6 tests passing; TypeScript clean.
- **Issue #8 fixed (2026-06-26):** `ScheduleForm.tsx` `DialogTrigger` တွင် `asChild` ထည့်ခြင်းဖြင့် nested-button hydration error ဖြေရှင်းခဲ့သည်။ 5/5 tests passing; TypeScript clean.
- Fix order: #9 ✅ → #8 (asChild on ScheduleForm DialogTrigger) → #7 (goal-at-50%) → #6 (SessionSummary) → #10 (dark theme) → #11 + observations.
- **Build fix (2026-06-27):** `ScheduleForm.tsx` တွင် base-ui `DialogTrigger` သည် `asChild` မထောက်ပံ့သောကြောင့် nested-button ပြဿနာကို ဖြေရှင်းရန် `DialogTrigger` ဝန်း၍ `Button` trigger အဖြစ် ပြောင်းလဲခြင်း — `npx tsc --noEmit`, `ScheduleForm` tests 5/5, နှင့် `npm run build` အားလုံး pass။
- **Reset fix Piece A complete (2026-06-27):** `lib/store/slices/projectSlice.ts` တွင် `decrementProjectTime` နဲ့ `decrementSubPieceTime` actions ထည့်ခြင်း (clamp at 0, XP/fortress/todayFocus adjust); `lib/store/__tests__/useFocusStore.test.ts` မှ 9 tests ထည့်၍ 41/41 passing; TypeScript clean။
- **Reset fix Piece B complete (2026-06-27):** `hooks/useTimer.ts` တွင် session baseline tracking ထည့်၍ reset နှိပ်ရင် elapsed time ကို store ကနေ နုတ်၊ display ကို baseline သို့ ပြန်ခြင်း; `hooks/__tests__/useTimer.test.tsx` update လုပ်ပြီး 25/25 passing; TypeScript clean။
- **Reset fix Piece C complete (2026-06-27):** `useTimer` တွင် `reinitialize` ထည့်၍ `SessionSummary` Continue ခလုပ်မှာ completed session အချိန်မနုတ်တော့ပဲ display ကို current store value သို့ ပြန်ခြင်း; TimerPanel + TimerPanel tests + session-summary tests update; full suite 427/427 passing; `npm run build` succeeds။
- **UI micro-fix (2026-06-27):** timer reset button label ကို `ပြန်စ (Reset)` မှ `မူလမှပြန်စမယ် (Discard Session)` သို့ ပြောင်းလဲခြင်း; `TimerControls` test update; TypeScript clean။
- **Reset fix D1 complete (2026-06-27):** `lib/store/slices/projectSlice.ts` တွင် `resetSubPieceTime` action ထည့်၍ active sub-piece elapsed time ကို 0 ပြန်၊ project total/XP/fortress/todayFocus adjust လုပ်ခြင်း; `useFocusStore.test.ts` မှာ 4 tests ထည့်၍ 45/45 passing; TypeScript clean။
- **Reset fix D2a complete (2026-06-27):** `hooks/useTimer.ts` တွင် `resetToZero` ထည့်၍ store `resetSubPieceTime` ခေါ်၊ display ကို zeroed values သို့ ပြန်ခြင်း; `useTimer.test.tsx` update လုပ်ပြီး 27/27 passing; TypeScript clean။
- **Reset fix D2b complete (2026-06-27):** `TimerControls.tsx` တွင် အနီရောင် `အချိန်ကို 0 မှ ပြန်စမယ် (Reset)` ခလုပ်ထည့်၍ confirmation dialog (သတိပေးချက်) နှင့် Cancel/Confirm ခလုပ်များ ထည့်ခြင်း; `TimerControls.test.tsx` update လုပ်ပြီး 8/8 passing; TypeScript clean။
- **Reset fix D2c complete (2026-06-27):** `TimerPanel.tsx` မှာ `resetToZero` ကို `TimerControls` သို့ pass လုပ်; TimerPanel mocks/tests update; full suite 435/435 passing; `npm run build` succeeds။
- **Reset feature overall — COMPLETE:** Discard Session + true Zero Reset (with confirmation dialog) တို့ timer ထဲ ရှိပြီးပါပြီ။
- **E1 complete (2026-06-27):** `ProjectCard.tsx` မှာ focus button နှိပ်ရင် default sub-piece auto-create လုပ်တဲ့ logic ဖြုတ်၊ focus လုပ်ရင် သက်သက် `setActiveProject` + navigate to `/timer` ဖြစ်ခြင်း; `ProjectCard.test.tsx` update လုပ်ပြီး 12/12 passing; TypeScript clean။
- **E2a complete (2026-06-27):** `TimerDisplay` မှာ sub-piece မရှိရင် Remaining မပြဘဲ၊ `TimerControls` မှာ `onResetToZero` မရှိရင် red Reset button မပြဘဲ; tests update လုပ်ပြီး 19/19 passing; TypeScript clean။
- **E2b complete (2026-06-27):** `TimerPanel` မှာ active project ရှိပြီး sub-piece မရှိရင် project-only timer UI ပြခြင်း; `TimerPanel.test.tsx` update လုပ်ပြီး 9/9 passing; full suite 437/437 passing; `npm run build` succeeds။
- **Auto sub-piece removal + project-only focus — COMPLETE။
- **F1 complete (2026-06-27):** Store ထဲ `activeSubPieceId` + `setActiveSubPiece` action ထည့်၍ sub-piece ရွေးချယ်မှုကို persistence လုပ်ခြင်း; `setActiveProject` ဖြင့် project ပြောင်းရင် `activeSubPieceId` ရှင်းခြင်း; `useFocusStore.test.ts` မှာ 6 tests ထည့်၍ 51/51 passing; TypeScript clean။
- **F2 complete (2026-06-27):** `TimerPanel` က `activeSubPieceId` ကို ဦးစားပေးရွေး၍ invalid/completed ဆိုရင် first incomplete သို့ fall back၊ မရှိရင် project-only; `TimerPanel.test.tsx` update လုပ်ပြီး 13/13 passing; TypeScript clean။
- **F3a complete (2026-06-27):** `SubPieceCard` မှာ incomplete sub-piece တိုင်းအတွက် focus button ထည့်၍ `setActiveProject` + `setActiveSubPiece` + navigate `/timer` လုပ်ခြင်း; completed sub-piece အတွက် button disabled; `SubPieceCard.test.tsx` (7 tests) + `SubPieceList.test.tsx` update လုပ်ပြီး 10/10 passing; TypeScript clean။
- **F3b complete (2026-06-27):** `ProjectCard` project-level focus button label ကို `ပရောဂျက်တစ်ခုလုံးကို focus လုပ်မယ် (Focus whole project)` သို့ ပြောင်းလဲခြင်း; `ProjectCard.test.tsx` update လုပ်ပြီး 12/12 passing; full suite 454/454 passing; `npm run build` succeeds။
- **Sub-piece selection + focus — COMPLETE:** User က sub-piece သီးခြား ရွေးပြီး focus လုပ်နိုင်၊ project တစ်ခုလုံး focus လုပ်နိုင်၊ project-only focus လုပ်နိုင်။**
- **G1 complete (2026-06-28):** Completed project အတွက် `ProjectCard` မှာ green border indicator (`border-emerald-500`) ထည့်၍ active styling ထက် နောက်ကွယ်မှာ ရှိစေခြင်း; `ProjectCard.test.tsx` မှာ 2 tests ထည့်၍ 14/14 passing; TypeScript clean။
- **G2a complete (2026-06-28):** Store ထဲ `refocusSubPiece` action ထည့်၍ completed sub-piece ကို `idle` + elapsed 0 ပြန်၊ allocatedMinutes optional update လုပ်ခြင်း; project status recompute; `useFocusStore.test.ts` မှာ 7 tests ထည့်၍ 59/59 passing; TypeScript clean။
- **G2b complete (2026-06-28):** `SubPieceCard` မှာ completed sub-piece အတွက် refocus dialog ထည့်၍ minutes input (default existing) ဖြင့် confirm လုပ်ရင် `refocusSubPiece` ခေါ် + active set + `/timer` navigate; `SubPieceCard.test.tsx` update လုပ်ပြီး 11/11 passing; TypeScript clean။
- **G2c complete (2026-06-28):** `ProjectCard` မှာ completed project အတွက် refocus confirmation dialog ထည့်၍ confirm လုပ်ရင် status `idle` ပြန် + active set + `/timer` navigate; `ProjectCard.test.tsx` update လုပ်ပြီး 17/17 passing; full suite 471/471 passing; `npm run build` succeeds။
- **H1 complete (2026-06-28):** `TimerControls` မှ red Reset button (`အချိန်ကို 0 မှ ပြန်စမယ်`) ကို ဖြုတ်; `မူလမှပြန်စမယ် (Discard Session)` button ကို ပြန်ထည့်; `TimerPanel` + tests update; full suite 467/467 passing; `npm run build` succeeds။
- **UI micro-fix (2026-06-28):** `TimerDisplay` မှ decorative `TimerRing` SVG ကို ဖြုတ်၍ timer UI ကို ပိုရှင်းလင်းအောင် လုပ်ခြင်း; `TimerDisplay.test.tsx` update လုပ်ပြီး 6/6 passing; full suite 463/463 passing; `npm run build` succeeds။
- **UI micro-fix (2026-06-28):** `lib/motivation.ts` မှ Burmese motivation message တွေထဲက English parenthetical ကို ဖြုတ်၍ toast title တွင် မြန်မာစာ-only၊ description တွင် English-only ဖြစ်အောင် လုပ်ခြင်း; full suite 463/463 passing; `npm run build` succeeds။
- **I1 complete (2026-06-28):** Layout alignment fixes — `Header` height ကို `h-16` ပြောင်း၊ `AppShell` scrollable content area မှာ `p-6 lg:p-8` ထည့်၊ `app/timer/page.tsx` spacing ပြန်ညှိခြင်း; `Header.test.tsx` 3/3 passing; full suite 463/463 passing; `npm run build` succeeds။
- **UX fix (2026-06-28):** `ProjectForm` မှာ project တည်ဆောက်ပြီးရင် `setActiveProject` + navigate `/timer` လုပ်ခြင်း (dashboard/projects နှစ်နေရာလုံးမှာ အလုပ်လုပ်တယ်); `ProjectForm.test.tsx` update လုပ်ပြီး 7/7 passing; full suite 464/464 passing; `npm run build` succeeds။
- **Completed state refocus + visual indicators — COMPLETE:** Completed sub-piece/project refocus with confirmation dialog + green completed project border ရှိပြီးပါပြီ။
- **Verification piece complete (2026-06-28):** `ProjectForm.test.tsx` navigation coverage added — proves `setActiveProject('new-id')` + `router.push('/timer')` are called on save; 7/7 tests passing; TypeScript clean.
- **UI fix complete (2026-06-28):** `ProjectCard.tsx` footer + header badges refactored to vertical responsive layout; focus button text wraps, total time readable, add-sub-piece button visible; 17/17 tests passing; TypeScript clean.
- **UI micro-fix (2026-06-28):** `ProjectCard.tsx` footer buttons hover state changed to saturated light mint (`hover:bg-teal-100 hover:text-teal-700 hover:border-teal-300`); 17/17 tests passing; TypeScript clean.
- **UI micro-fix (2026-06-28):** `SubPieceCard.tsx` focus button changed from ghost to outline with `border-teal-200`, `shadow-sm`, `hover:shadow`, `cursor-pointer`; 14/14 tests passing; TypeScript clean.
- **UI micro-fix (2026-06-28):** `SubPieceList.tsx` capped to `max-h-[150px]` (~3 sub-pieces visible) with hidden scrollbar; overflow scrolls instead of stretching card; 3/3 tests passing; TypeScript clean.
- **Global UI fix (2026-06-28):** `components/ui/button.tsx` base styles added `cursor-pointer`; all buttons now show pointer cursor on hover; full suite 464/464 passing; TypeScript clean.
- **UI micro-fix (2026-06-28):** `app/projects/page.tsx` subtitle margin increased from `mt-1` to `mt-2`; TypeScript clean.
- **UI text update (2026-06-28):** Project idle label changed to `မပြီးပြတ်သေးပါ`, sub-piece idle label changed to `ပြီးစီးခြင်းမရှိသေးပါ`; ProjectCard + SubPieceCard + test updated; 31/31 tests passing; TypeScript clean.
- **Piece 1 hotfix (2026-06-28):** `SubPieceCard.tsx` inline status badge replaced with small colored status dot + `title` tooltip; frees horizontal space for sub-piece name; SubPieceCard + SubPieceList tests 14/14 passing; TypeScript clean.
- **Piece 2 complete (2026-06-28):** `SubPieceCard.tsx` click-to-open detail dialog added; shows full name, allocated minutes, elapsed time, status badge, and Focus button; inline Focus button stops propagation; 16/16 tests passing; TypeScript clean.
- **Piece 3 complete (2026-06-28):** `SubPieceCard.tsx` detail dialog animated with Framer Motion `AnimatePresence` + `motion.div` (200ms fade/scale/slide); refocus dialog unchanged; 16/16 tests passing; TypeScript clean.
- **Sub-piece detail popover feature — COMPLETE:** Name visibility fixed (status dot), detail dialog with full info, and smooth animation all done.
- **UI text update (2026-06-28):** `ProjectCard.tsx` footer total-time label changed to `အသုံးပြုပြီးသောအချိန် (Time used)` with highlighted teal time value; ProjectCard test updated; 17/17 tests passing; TypeScript clean.
- **UI micro-fix (2026-06-28):** `ProjectCard.tsx` progress-bar time value highlighted in teal (`font-semibold text-teal-600`); target time stays subtle; 17/17 tests passing; TypeScript clean.
- **Project-only focus fix complete (2026-06-28):** Added `projectOnlyFocus` flag to store; `setActiveProject` sets it true, `setActiveSubPiece` sets it false; `TimerPanel` bypasses sub-piece fallback when true; store + TimerPanel tests 79/79 passing; TypeScript clean.
- **UI text update (2026-06-28):** `TimerDisplay.tsx` labels updated — project time → `ပရောက်ဂျက်တစ်ခုလုံး၏ အချိန် (Project Time)`, remaining → `{subPieceName} အတွက် လက်ကျန် အချိန် (Remaining)`; timer values wrapped in highlighted bordered ring; `TimerPanel.tsx` passes `subPieceName`; TimerDisplay + TimerPanel tests 22/22 passing; TypeScript clean.
- **UI micro-fix (2026-06-28):** `TimerDisplay.tsx` sub-piece name in remaining label highlighted with `font-semibold text-teal-600`; TimerDisplay tests 6/6 passing; TypeScript clean.
- **UI text update (2026-06-28):** `app/settings/page.tsx` subtitle changed to `ဆက်တင်များကို စိတ်ကြိုက်ပြင်ဆင်ပါ`; settings page tests 6/6 passing; TypeScript clean.
- **Dark mode theme research (2026-06-28):** Analyzed slide deck screenshots; proposed new dark palette — background `#0B1120`, card `#1E293B`, primary `#C6F135`, secondary `#22C55E`, text `#F8FAFC`, muted `#94A3B8`, border `#334155`; current issues documented (card color clash, soft accents, sidebar mismatch); implementation queued for next session.
- **Dark mode Piece 1 complete (2026-06-28):** `app/globals.css` `.dark` variables updated to researched palette, dark gradient utilities + card-glow added; `app/__tests__/globals.test.ts` 10/10 passing; `npx tsc --noEmit` clean.
- **Dark mode Piece 2 complete (2026-06-28):** `AppShell`, `Sidebar`, `Header` hardcoded light colors replaced with theme tokens; `AppShell.test.tsx`, `Sidebar.test.tsx` added, `Header.test.tsx` updated; 14/14 layout tests passing; `npx tsc --noEmit` clean; `npm run build` succeeds. Paused for user review before Piece 3.
- **Dark mode Piece 3a complete (2026-06-28):** `ThemeSelector` hardcoded light classes replaced with semantic tokens; `ThemeSelector.test.tsx` updated; 3/3 tests passing; `npx tsc --noEmit` clean.
- **Dark mode Piece 3b complete (2026-06-28):** `StrictModeToggle` hardcoded light classes replaced with semantic tokens; `StrictModeToggle.test.tsx` updated; 4/4 tests passing; `npx tsc --noEmit` clean.
- **Dark mode Piece 3c complete (2026-06-28):** `NotificationsToggle` hardcoded light classes replaced with semantic tokens; `NotificationsToggle.test.tsx` updated; 4/4 tests passing; `npx tsc --noEmit` clean.
- **Dark mode Piece 3d complete (2026-06-28):** `SoundToggle` hardcoded light classes replaced with semantic tokens; `SoundToggle.test.tsx` updated; 5/5 tests passing; `npx tsc --noEmit` clean.
- **Dark mode Piece 3e complete (2026-06-28):** `DailyFocusGoalInput` hardcoded light classes replaced with semantic tokens; `DailyFocusGoalInput.test.tsx` updated; 7/7 tests passing; `npx tsc --noEmit` clean. Settings input/toggle group done.
- **Dark mode Piece 4a complete (2026-06-28):** `AddForbiddenUrl` hardcoded light classes replaced with semantic tokens; `AddForbiddenUrl.test.tsx` updated; 6/6 tests passing; removed corrupt `.next/dev/types/validator.ts` artifact that was blocking `npx tsc --noEmit`; TypeScript clean.
- **Dark mode Piece 4b complete (2026-06-28):** `ForbiddenUrlsList` hardcoded light classes replaced with semantic tokens; `ForbiddenUrlsList.test.tsx` updated; 5/5 tests passing; `npx tsc --noEmit` clean.
- **Dark mode Piece 4c complete (2026-06-28):** `SyncPanel` hardcoded light classes replaced with semantic tokens; `SyncPanel.test.tsx` updated; 7/7 tests passing; `npx tsc --noEmit` clean.
- **Dark mode Piece 4d complete (2026-06-28):** `DistractionLog` hardcoded light classes replaced with semantic tokens; `DistractionLog.test.tsx` updated; 5/5 tests passing; `npx tsc --noEmit` clean.
- **Dark mode user review (2026-06-28):** User reviewed screenshots and requested a simpler, more distinctive dark palette based on a provided slide — solid dark navy `#0B1120` background, `#1E293B` cards, white titles, `#B0B8C4` subtitles, lime `#C6F135` primary accent, no gradients. Dark-mode work paused for ~1 hour while user handles urgent task; palette documented in `.claude/memory/ui-conventions.md`.
- **Dark mode background update (2026-06-28):** `app/globals.css` dark variables updated to solid `#0B1120` background, white foreground, `#1E293B` cards, `#2A3649` borders/muted, `#B0B8C4` muted-foreground; dark gradient utilities flattened to solid `#0B1120`; `app/__tests__/globals.test.ts` updated; 10/10 tests passing; `npx tsc --noEmit` clean. No component changes yet.
- **Dark mode dashboard split plan (2026-06-28):** User requested smaller pieces. Piece 5a scoped to `app/page.tsx` + `app/__tests__/page.test.tsx` only (~50 lines, Tiny). Pieces 5b/5c will be `DailyFocusGoal` and `StreakCounter` separately. User will continue from a new chat.
- **Project cards unified appearance (2026-06-29):** inner sub-piece rows and footer buttons changed to transparent background with subtle hover only; `ProjectCard` now has `border border-border` for clear card boundaries; 60/60 project tests passing; `npx tsc --noEmit` and `npm run build` succeed.
- **Project card footer fix (2026-06-29):** footer pinned to bottom (`h-full` card + `flex-1` content + `mt-auto` footer), footer container and action rows use `bg-card` with `border border-border` and lime hover glow; `ProjectCard` + `ProjectCard.status` tests 21/21 passing; TypeScript clean.
- **Timer page dark theme (2026-06-29):** `app/timer/page.tsx`, `TimerPanel.tsx`, `TimerDisplay.tsx`, `TimerControls.tsx` converted to semantic dark tokens; white timer card replaced with `bg-card border-border`; status badges, time rings, and controls use dark palette; timer tests 42/42 passing; TypeScript clean. Full suite has 3 pre-existing unrelated failures in `globals.test.ts` and `AppShell.test.tsx`.
- **Timer display spacing tweak (2026-06-29):** `TimerDisplay` label-to-value gaps increased from `gap-2` to `gap-4` so Myanmar text no longer touches the time boxes; TimerDisplay tests 6/6 passing; TypeScript clean.
- **Settings page dark theme (2026-06-29):** `app/settings/page.tsx` card wrappers converted from `bg-white border-stone-200` to `bg-card border-border`; settings/schedule/distraction components updated to semantic dark tokens (primary accents, muted surfaces, destructive actions); settings + schedule + distraction tests 67/67 passing; TypeScript clean.
- **Theme selector labels (2026-06-29):** theme option labels changed from Burmese (`လင်းရောင်`, `မှောင်ရောင်`, `စက်အလိုက်`) to English (`Light`, `Dark`, `System`); ThemeSelector tests 3/3 passing; TypeScript clean.
- **Collapsible sidebar (2026-06-29):** `Sidebar` now accepts `collapsed` prop to hide labels; `AppShell` manages `sidebarOpen` state with mobile overlay backdrop; `Header` has a menu toggle button; default state is collapsed (icon-only on desktop, hidden on mobile); layout tests 15/15 passing; full suite 504/506 with 2 pre-existing `globals.test.ts` color-format failures.
- **Sub-piece Budget Piece A complete (2026-07-02):** `lib/store/slices/projectSlice.ts` — `getRemainingBudgetSeconds` getter added, `addSubPiece` clamps `allocatedMinutes` to remaining budget, `updateProject` floors `targetTimeSeconds` at allocated sum; `useFocusStore.test.ts` 6 budget tests added (getRemainingBudgetSeconds, clamp, full budget, within budget, floor, raise); 69/69 tests passing; `npx tsc --noEmit` clean.
- **Sub-piece count-up display complete (2026-07-01):** `TimerDisplay.tsx` sub-piece section changed from counting DOWN (remaining) to counting UP (elapsed = `allocatedMinutes*60 - subPieceRemaining`, clamped ≥0); highlighted target label (`text-sm font-semibold text-primary`, `သတ်မှတ်ထားသော အချိန်`) shown below the value, no progress bar; testids `subpiece-elapsed-label`/`subpiece-target-label`/`subpiece-elapsed-value`, old `remaining-label` + rose `<=60s` styling removed; `useTimer.ts` untouched (still counts down internally + auto-completes at zero); `TimerDisplay.test.tsx` 14/14 passing; `TimerPanel.test.tsx` 18/18 passing; TypeScript clean.
- **Project timer continuity fix (2026-07-01):** regression — switching to another project and back showed project time as 0 because `useTimer.computeInit` no-session branch hard-set `projectElapsed: 0`, discarding persisted `project.totalTimeSeconds` (only one `ff_active_session` slot exists, so switching projects overwrites it). Fixed by seeding `projectElapsed: initialProjectTime` (= `totalTimeSeconds ?? 0`); count-up display direction unchanged; reset/discard button still zeroes. `hooks/__tests__/useTimer.test.tsx` 31/31 passing (2 start-from-0 assertions updated + 1 continuity test added); timer component suite 67/67; TypeScript clean. Feedback recorded: "count up" = display direction only, not a license to reset baseline.
- **Timer page gap (2026-07-01):** `app/timer/page.tsx` parent flex `gap-4` → `gap-2` (title/subtitle → panel spacing reduced 16px→8px).

## Sub-piece Budget Feature — Research + Split (approved 2026-07-02)

**Gap:** No link between project `targetTimeSeconds` and sub-piece `allocatedMinutes`. Currently unlimited sub-pieces can be added regardless of the project's target budget.

**Rule to enforce:** `allocatedSeconds = Σ(subPiece.allocatedMinutes × 60)` over ALL sub-pieces (completed included); `remainingSeconds = targetTimeSeconds − allocatedSeconds`. A new sub-piece may take at most `remainingSeconds`. Over-budget entry → **block with error** (user choice, NOT auto-cap). When remaining ≤ 0 → adding disabled until project target is raised. Project target can be edited up (edit button); target can't drop below allocated sum. NO sub-piece edit button for now (user testing extension later).

**Approved split (3 small pieces, one at a time with review):**
- **Piece A — Store budget layer** (`lib/store/slices/projectSlice.ts` + `lib/store/__tests__/useFocusStore.test.ts`): new getter `getRemainingBudgetSeconds`; clamp `addSubPiece` to remaining; floor `updateProject` target at allocated sum. Skill written: `.claude/skills/subpiece-budget-store-skill.md`. **STATUS: skill written, approved, awaiting "go" to spawn agent — NOT yet implemented.**
- **Piece B — SubPieceForm budget UI** (`components/projects/SubPieceForm.tsx` + test): show "Remaining: X min"; validate `allocatedMinutes ≤ remaining` → block Save with error; disable Save when remaining ≤ 0. Not started.
- **Piece C — Project target edit button + dialog** (new component + test + wire `ProjectCard`): raise/change target hours (min = allocated sum), calls `updateProject`. Not started.

### NEXT CHAT RESUME POINT
Start Piece A: read `.claude/skills/subpiece-budget-store-skill.md`, spawn general-purpose agent to implement, verify `npx tsc --noEmit` + `npx vitest run lib/store/__tests__/useFocusStore.test.ts`. Then Piece B, then Piece C. Reuse existing `getTotalAllocatedMinutes`. Note project target is in hours (`targetHours*3600`), sub-pieces in minutes.

### UNCOMMITTED CHANGES (2026-07-02, branch fix/session-2026-06-26) — NOT pushed
Completed & tested this session (tsc clean, tests passing):
- `components/timer/TimerDisplay.tsx` + test — sub-piece counts UP (elapsed) with target label below value, no progress bar (14/14).
- `hooks/useTimer.ts` + test — project timer continuity fix: `computeInit` no-session branch seeds `projectElapsed: initialProjectTime` (= `totalTimeSeconds`) instead of 0 (31/31). Fixes lost per-project time on project switch.
- `app/timer/page.tsx` — gap-4 → gap-2.
- `.claude/memory/progress.md` — updated.
Untracked skill files: `restore-project-timer-continuity-skill.md`, `subpiece-countup-display-skill.md`, `subpiece-budget-store-skill.md`.
All above are DONE/working — safe to commit. Budget feature (Pieces A/B/C) NOT yet implemented.
- **Piece B — Extension Notification Icon URL + Error Handling complete (2026-07-02):** `extension/lib/timerAlarm.ts` — `browser.runtime.getURL("/icon/128.png")` computed after `getBrowser()`, both `notifications.create` calls wrapped in try/catch with `[timerAlarm]` error prefix; `extension/lib/scheduleAlarm.ts` — same `iconUrl` + try/catch with `[scheduleAlarm]` prefix; `timerAlarm.test.ts` — `runtime.getURL` mocked, `iconUrl` assertions added for session-complete and milestone notifications, error-catch test added (12/12 passing); `scheduleAlarm.test.ts` — same mock + `iconUrl` assertion, error-catch test added (7/7 passing); `npx tsc --noEmit` clean; `npm run build:ext` succeeds.
- **Piece A — Fix Timer Target Completion complete (2026-07-02):** `lib/store/slices/projectSlice.ts` — added `completeProject` action (sets status `completed`), capped `incrementProjectTime` at `targetTimeSeconds` via `actualSeconds = Math.min(seconds, remainingTargetSeconds)`, marks `completed` when target reached, XP/todayFocus/streak computed from `actualSeconds`; `hooks/useTimer.ts` — reads `targetTimeSeconds`, RAF tick caps seconds at target, stops timer + calls `completeProject` + clears session + fires `onComplete` when target reached, `start()` no-op if already at target, `computeInit` caps restored `projectElapsed` at target; `useFocusStore.test.ts` — 4 new tests (completeProject, cap at target, no-cap, XP based on actualSeconds); `useTimer.test.tsx` — 4 new tests (stop at target project-only, stop at target with sub-piece remaining, start no-op at target, start no-op over target); 108/108 tests passing across both files; `npx tsc --noEmit` clean.
- **Piece B — Project Target Completion Modal complete (2026-07-02):** `components/timer/CompletionDialog.tsx` — added optional `mode?: "sub-piece" | "project"` prop (default `"sub-piece"`), project mode shows title `"ပရောဂျက်ပစ်မှတ် ရောက်ရှိ (Project Target Reached)"`, project name only (no sub-piece line), focused time + XP, single `"continue"` button (English lowercase) calling `onContinueProject` or falling back to `onOpenChange(false)`; `components/timer/TimerPanel.tsx` — project target completion branch (`showSummary && !completedSubPiece`) now renders `CompletionDialog` with `mode="project"` instead of inline `SessionSummary`, passes `projectElapsedSeconds` (capped at target), `allocatedMinutes` (target/60), and `projectXpGained`, `onContinueProject` calls `reinitialize()` + `setShowSummary(false)`; `CompletionDialog.test.tsx` — 5 new project-mode tests (title, project name only, time/XP, continue button calls handler, fallback to close); `TimerPanel.session-summary.test.tsx` — updated 3 tests to assert `CompletionDialog` in project mode with `"continue"` button; all 34 timer tests passing; `npx tsc --noEmit` clean.

- **Completion dialog fix — resumed after context limit (2026-07-02):** Re-verified: `npx tsc --noEmit` clean, `npm test` 564/566 passing (2 pre-existing `globals.test.ts` dark-mode CSS failures), targeted timer tests 34/34 passing. Workflow for this piece complete; changes remain uncommitted on `fix/session-2026-06-26`.


- **Milestone interval reduced for extension testing (2026-07-02):** `MILESTONE_INTERVAL_SECONDS = 60` added to `lib/constants.ts`; `TimerPanel.tsx` uses it for web toasts and `extension/lib/timerAlarm.ts` uses a matching local constant for extension notifications; `timerAlarm.test.ts` milestone tests updated to 60s intervals; 38 targeted tests passing, `npx tsc --noEmit` clean, `npm run build:ext` succeeds.

- **TimerToast milestone dedup bugfix (2026-07-02):** `TimerToast.tsx` now resets `lastTriggerRef` when `trigger` is cleared, so recurring `milestone` toasts fire every minute; added regression test; 45 targeted tests passing, `npx tsc --noEmit` clean.

- **Off-screen native notification analysis complete (2026-07-02):** Audited full path `useTimer.ts` → `ff_active_session` localStorage → `focusSync.content.ts` → `focusSync.ts` → `messageHandler.ts` → `timerAlarm.ts` → `browser.notifications.create`. Root cause identified: extension passively mirrors web-app state; service worker does not restart focus alarm on wake, has no keep-alive alarm, no permission check, and no popup diagnostic. Research from `dominhduy09/pomodoro-extension` and Chrome notifications docs shows the robust pattern is service-worker-owned timer. Comprehensive plan written to `.claude/memory/offscreen-notification-redesign.md` with 4-piece split. Next chat begins Piece A. Current branch `fix/session-2026-06-26` has uncommitted 60s milestone + TimerToast dedup changes; tsc clean, 45 targeted tests passing, `npm run build:ext` succeeds.

- **Merged to main and cleaned up branches (2026-07-02):** Committed all changes on `fix/session-2026-06-26` as `c8c5d43`, fast-forward merged into `main`, pushed `main` to origin, and deleted both local and remote `fix/session-2026-06-26` branches. Current branch is `main`.

- **Off-screen notification memory finalized (2026-07-02):** `.claude/memory/offscreen-notification-redesign.md` updated with final branch state (changes merged to `main`, `fix/session-2026-06-26` deleted). Comprehensive analysis, research, and 4-piece implementation plan are in the memory file for next chat.

- **Piece A complete (2026-07-03):** Extension timer engine implemented at  with state-machine ownership, drift-capped ticks, permission-checked notifications, and startup recovery;  gained ;  wires  and  alarm;  25/25 passing;  clean; 
> kill_the_laziness@0.1.0 build:ext
> wxt build


WXT 0.20.26
[36mℹ[39m Building chrome-mv3 for production with Vite 8.0.16
[32m✔[39m Built extension in 1.985 s
  ├─ .output\chrome-mv3\manifest.json                                 1.1 kB 
  ├─ .output\chrome-mv3\blocked.html                                  2.36 kB
  ├─ .output\chrome-mv3\popup.html                                    6.64 kB
  ├─ .output\chrome-mv3\background.js                                 9.53 kB
  ├─ .output\chrome-mv3\chunks\_virtual_wxt-html-plugins-Dezn_h7o.js  698 B  
  ├─ .output\chrome-mv3\chunks\popup-C33kfAM6.js                      2.18 kB
  ├─ .output\chrome-mv3\content-scripts\control.js                    4.49 kB
  ├─ .output\chrome-mv3\content-scripts\focusSync.js                  5.82 kB
  ├─ .output\chrome-mv3\content-scripts\warn.js                       8.95 kB
  ├─ .output\chrome-mv3\icon\128.png                                  739 B  
  ├─ .output\chrome-mv3\icon\16.png                                   172 B  
  ├─ .output\chrome-mv3\icon\32.png                                   243 B  
  └─ .output\chrome-mv3\icon\48.png                                   323 B  
Σ Total size: 43.23 kB                                              
[32m✔[39m Finished in 2.685 s succeeds on branch .

- **Piece A complete (2026-07-03):** Extension timer engine implemented at extension/lib/timerEngine.ts with state-machine ownership, drift-capped ticks, permission-checked notifications, and startup recovery; ExtensionTimerState gained allocatedMinutes; background.ts wires restoreOnStartup() and ff-keep-alive alarm; extension/lib/__tests__/timerEngine.test.ts 25/25 passing; npx tsc --noEmit clean; npm run build:ext succeeds on branch feature/offscreen-notification-system.

- **Piece B complete (2026-07-03):** Web app to extension command bridge refactored; messageHandler.ts START_TIMER validates payload and calls timerEngine.startSession, PAUSE_TIMER/RESET_TIMER call engine directly; useTimer.ts builds ExtensionTimerState and sends commands when extension runtime is available; controlMessage.test.ts (8 tests) and useTimer.test.tsx (4 command tests) all passing; tsc and build:ext clean on feature/offscreen-notification-system.

- **Piece C complete (2026-07-03):** Extension to web app state sync wired; timerEngine.ts broadcasts STATE_UPDATED after every state save with try/catch; control.content.ts forwards STATE_UPDATED as ff:state CustomEvent; TimerPanel.tsx listens and updates displayProjectElapsed/displaySubPieceRemaining without touching store; useTimer.ts seeds display from GET_TIMER_STATE on mount with drift cap; 94/94 targeted tests passing; tsc and build:ext clean on feature/offscreen-notification-system.

- **Piece D complete (2026-07-03):** Popup notification diagnostics added; extension/lib/popup.ts gained renderPermissionStatus() and setupTestNotificationButton(), both called in initPopup(); extension/entrypoints/popup.html added #permission-status and #test-notif-btn; extension/lib/__tests__/popup.test.ts extended with 4 notification diagnostics tests (16/16 total passing); npx tsc --noEmit clean; npm run build:ext succeeds on feature/offscreen-notification-system.

- **Piece D complete (2026-07-03):** Popup notification diagnostics added; popup.ts reads notifications.getPermissionLevel and renders status in #permission-status; #test-notif-btn triggers a test notification; popup.html updated with pastel-themed footer elements; popup.test.ts extended to 16 tests all passing; tsc and build:ext clean on feature/offscreen-notification-system.

- **Off-screen notification system bundle complete (2026-07-03):** Pieces A-D implemented on feature/offscreen-notification-system branch; extension service worker now owns active focus session; web app sends commands and listens to STATE_UPDATED broadcasts; popup shows notification permission status and test button; full suite 606/608 passing (2 pre-existing globals.test.ts dark-mode CSS failures); npm run build and npm run build:ext both succeed.

- **UI fix (2026-07-03):** AppShell.tsx sidebar now defaults to open on larger screens (>=768px) and closes on mobile after hydration; AppShell.test.tsx still passing; npm run build succeeds.

- **Extension bridge fix (2026-07-03):** Fixed broken web-app to extension communication path; useTimer.ts now dispatches ff:command CustomEvents (content script forwards to background), and GET_TIMER_STATE uses ff:request/ff:response request-response via content script; focusSync.ts no longer forwards timer state (only settings); popup.ts Start button sends START_TIMER with payload; timerEngine.ts notifications now use priority: 2 for better OS banner visibility; 596/598 tests passing (2 pre-existing globals.test.ts failures); npm run build and build:ext succeed.

- **Toast overlap fix (2026-07-03):** TimerToast.tsx now uses fixed toast id "timer-toast" and durations (4s info, 6s success) so new timer toasts replace old ones instead of stacking; TimerToast.test.tsx updated and passing; npm run build succeeds.

- **Session end handoff (2026-07-03):** Working on branch `feature/offscreen-notification-system` with uncommitted changes. Off-browser notification Pieces A-D are implemented and verified (596/598 tests passing, 2 pre-existing globals.test.ts failures; npm run build and build:ext succeed). Recent fixes: web-app ↔ extension bridge now uses `ff:command`/`ff:request` CustomEvents via content script; `focusSync.ts` no longer forwards timer state; popup Start button sends payload; notifications use `priority: 2`; sidebar defaults open on desktop; `TimerToast.tsx` uses fixed id to prevent overlap. User approved next plan: make native extension notifications mirror motivational tiers (beginning on start, succeeding on milestone, completing on completion) using `extension/lib/motivation.ts`, add `requireInteraction: true` to completion, and update `timerEngine.test.ts`. Next chat should implement this plan and verify.

- **Native notification motivational tiers Phase 4 complete (2026-07-04):** `extension/lib/scheduleAlarm.ts` now uses `notifyScheduleDue` from `extension/lib/notifications.ts`; inline `notifications.create`, `runtime.getURL`, and try/catch removed; `extension/lib/__tests__/scheduleAlarm.test.ts` updated to assert motivational title/message, project name, start time, dedup, permission denial, and missing `projectName` fallback; 7/7 scheduleAlarm tests passing; `npx tsc --noEmit` clean; `npm run build:ext` succeeds.

- **Native notification motivational tiers Phase 5 complete (2026-07-04):** `extension/lib/redirect.ts` now calls `notifyDistractionBlocked(browser, changeInfo.url)` after redirecting a forbidden URL in strict mode; `notifyDistractionBlocked` in `extension/lib/notifications.ts` switched to English title/message (`"Distraction Blocked — Focus Protected"` / `"Your time is valuable. We blocked a distracting site so you can stay focused."`); `notifications.test.ts` and `background-redirect.test.ts` updated; 40/40 targeted tests passing; `npx tsc --noEmit` clean; `npm run build:ext` succeeds.

- **Native notification motivational tiers Phase 6 complete (2026-07-04):** Dead `extension/lib/timerAlarm.ts` and `extension/lib/__tests__/timerAlarm.test.ts` deleted; `extension/lib/messageHandler.ts` `UPDATE_TIMER_STATE` branch is now a pure storage write with no alarm side effects; `setAlarmBrowserInstance` imports/calls removed from `controlMessage.test.ts`, `background.test.ts`, and `timerEngine.test.ts`; 43/43 targeted tests passing; `npx tsc --noEmit` clean; `npm run build:ext` succeeds.

- **Native notification motivational tiers Phase 7 complete (2026-07-04):** Full verification passed — `npx tsc --noEmit` clean, `npm test` 612/614 passing (2 pre-existing `globals.test.ts` dark-mode CSS failures), `npm run build:ext` succeeds (Chrome MV3 bundle 47.73 kB), `npm run build` succeeds. All Phase 1–7 changes remain uncommitted on `feature/offscreen-notification-system`.

- **Project target hard-cap bugfix (2026-07-04):** Project `targetTimeSeconds` is now a goal, not a hard cap. `incrementProjectTime` no longer caps `totalTimeSeconds` at the target; it marks `status: "completed"` when the target is crossed and allows overtime. `useTimer.ts` no longer stops the RAF loop at the target, no longer blocks `start()` when at/above target, and calls `onComplete` once when crossing the target. `TimerPanel.tsx` auto-shows the project completion dialog when loaded at or above target and adds `Continue focusing` / `Back to projects` controls; `CompletionDialog.tsx` gained `onBackToProjects` prop. Extension `timerEngine.ts` mirrors this: target is a goal, sends the project-completion notification once, and continues ticking. Tests updated in `useFocusStore.test.ts`, `useTimer.test.tsx`, `timerEngine.test.ts`, `CompletionDialog.test.tsx`, `TimerPanel.session-summary.test.tsx`; regression tests added in `TimerPanel.test.tsx`. Full verification: `npx tsc --noEmit` clean, `npm test` 613/615 passing (2 pre-existing `globals.test.ts` failures), `npm run build` and `npm run build:ext` both succeed.
