# Skill: Timer Engine Hook Build

## Purpose
Create an accurate, drift-corrected timer hook for project count-up and sub-piece count-down timers.

## Scope
- **Create**
  - `hooks/useTimer.ts`
  - `hooks/__tests__/useTimer.test.ts`
- **Modify**: none
- **Size**: Small → Medium — 2 files, ~220 lines

## References
- `.claude/memory/store-schema.md` — existing increment/complete actions
- `lib/types/index.ts` — `TimerState`, `PieceStatus`
- `lib/store/slices/projectSlice.ts` — `incrementProjectTime`, `incrementSubPieceTime`, `completeSubPiece`
- Context7 `/vercel/next.js` — client components, `useEffect`
- Context7 `/pmndrs/zustand` — store actions from hook

## Steps
1. Read memory files, `lib/types/index.ts`, and `lib/store/slices/projectSlice.ts`.
2. Create `hooks/useTimer.ts` as a `"use client"` hook.
   - Signature: `useTimer(projectId: string, subPieceId?: string)`.
   - State:
     - `isRunning`
     - `projectElapsed` (seconds)
     - `subPieceRemaining` (seconds)
     - `sessionStartTime`
     - `lastTick`
     - `savedAt`
   - Use `requestAnimationFrame` loop with `Date.now()` delta.
   - Every 5 seconds persist active session to `ff_active_session` localStorage key.
   - On mount, read `ff_active_session`; if it matches `projectId`/`subPieceId`, calculate drift from `savedAt` and apply it.
   - Project timer counts up from store's `totalTimeSeconds`.
   - Sub-piece timer counts down from `allocatedMinutes * 60`.
   - When sub-piece reaches 0, auto-pause and call `completeSubPiece`.
   - Call `incrementProjectTime` and `incrementSubPieceTime` each tick (e.g., every accumulated second).
   - Expose: `start()`, `pause()`, `reset()`.
3. Create `hooks/__tests__/useTimer.test.ts`.
   - Mock `requestAnimationFrame` / `cancelAnimationFrame`.
   - Mock `Date.now` to control time.
   - Test start/pause/resume.
   - Test project elapsed increments.
   - Test sub-piece countdown reaches zero and calls `completeSubPiece`.
   - Test persistence to localStorage.
4. Run `npx tsc --noEmit` and `npx vitest run hooks/__tests__/useTimer.test.ts`.
5. Update `.claude/memory/progress.md`.

## Rules
- No `setInterval`.
- Time stored in seconds internally.
- Storage key prefix: `ff_active_session`.
- Do not create UI components in this piece.
- Do not modify existing store slices.
- Cleanup `requestAnimationFrame` on unmount.

## Agent
- **Core Architect**

## Verification
- TypeScript compiles.
- Tests pass.
- Timer increments project time and decrements sub-piece time accurately.
- Sub-piece auto-completes at zero.
- State persists to localStorage and restores with drift correction.
