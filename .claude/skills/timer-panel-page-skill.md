# Skill: Timer Panel + `/timer` Page Build

## Purpose
Wire the existing `useTimer` hook and timer UI components into a `/timer` page.

## Scope
- **Create**
  - `components/timer/TimerPanel.tsx`
  - `app/timer/page.tsx`
  - `components/timer/__tests__/TimerPanel.test.tsx`
- **Modify**: none
- **Size**: Small — 3 files, ~130 lines

## References
- `.claude/memory/store-schema.md`
- `.claude/memory/ui-conventions.md`
- `hooks/useTimer.ts`
- `components/timer/TimerDisplay.tsx`
- `components/timer/TimerControls.tsx`
- `components/projects/ProjectList.tsx` — store selector pattern

## Steps
1. Read memory files and reference components/hook.
2. Create `components/timer/TimerPanel.tsx` as a `"use client"` component.
   - Read `activeProjectId` and `projects` from `useFocusStore`.
   - Find active project and its first incomplete sub-piece.
   - Call `useTimer(project.id, subPiece?.id)`.
   - Render empty state if no active project or no sub-piece:
     - "လက်ရှိ ပရောဂျက် မရွေးရသေးပါ" / "No active project"
     - "အခန်းကဏ္ဍများ မရှိသေးပါ" / "No sub-pieces to focus on"
   - Render `TimerDisplay` and `TimerControls` with values/callbacks from `useTimer`.
3. Create `app/timer/page.tsx`.
   - Server component that renders a page title and `<TimerPanel />`.
4. Create `components/timer/__tests__/TimerPanel.test.tsx`.
   - Mock `useTimer` hook.
   - Seed store with project + sub-piece and test active state renders display/controls.
   - Test empty states (no active project, no sub-pieces).
5. Run `npx tsc --noEmit` and `npx vitest run components/timer/__tests__/TimerPanel.test.tsx`.
6. Update `.claude/memory/progress.md`.

## Rules
- Do not modify `useTimer`, `TimerDisplay`, `TimerControls`, or store logic.
- Keep `TimerPanel` focused on wiring and empty states.
- Use existing selectors and actions only.
- Burmese-first labels.

## Agent
- **UI Designer**

## Verification
- TypeScript compiles.
- Tests pass.
- `/timer` route renders the timer panel.
- Empty states display correctly.
