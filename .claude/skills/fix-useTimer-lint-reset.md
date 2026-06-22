# Skill: Fix useTimer Lint Errors and Reset Behavior

## Goal

Clean up `hooks/useTimer.ts` so ESLint passes and the reset button restores timer values as users expect.

## Issues to Fix

1. **Mutating `useState()` return value**
   - Current code: `init.shouldAutoComplete = false;`
   - Problem: React state values should never be mutated directly.
   - Fix: Replace with a `useRef` flag (e.g., `autoCompleteHandledRef`) that tracks whether the auto-complete effect has already run.

2. **`tick` accessed before declaration**
   - Current code: `rafRef.current = requestAnimationFrame(tick);` inside `tick`, but `tick` is declared with `useCallback` below the line that references it.
   - Problem: ESLint `react-hooks/immutability` error and potential stale closure issues.
   - Fix: Restructure so the RAF loop references a stable function. Options:
     - Use a function declaration for `tick` (hoisted).
     - Use a `useRef` to hold the latest `tick` callback.
     - Keep `useCallback` but reference via ref inside the loop.

3. **Reset behavior is confusing**
   - Current behavior: clicking Reset only pauses the timer; displayed values do not visibly change.
   - Expected behavior: Reset restores project elapsed time to the project's currently tracked total and sub-piece remaining to its allocated time (minus already elapsed time tracked in the store). It also clears the active session from `localStorage`.

## Implementation Plan

1. Modify `hooks/useTimer.ts`:
   - Add `const autoCompleteHandledRef = useRef(false);`.
   - In the auto-complete `useEffect`, check `autoCompleteHandledRef.current` and set it to `true` instead of mutating `init`.
   - Restructure `tick` so it is declared before the RAF loop uses it. Recommended approach:
     - Keep the RAF logic inside `useEffect` that uses a ref to the latest callback, OR
     - Convert `tick` to a regular function inside the hook (not `useCallback`) and use refs for mutable values.
   - Update `reset` to explicitly set:
     - `projectElapsedRef.current = initialProjectTime`
     - `subPieceRemainingRef.current = initialSubPieceRemaining`
     - `setProjectElapsed(initialProjectTime)`
     - `setSubPieceRemaining(initialSubPieceRemaining)`
     - `isRunningRef.current = false`
     - `setIsRunning(false)`
     - Clear RAF, accumulated time, persist refs
     - `localStorage.removeItem(SESSION_KEY)`

2. Update `hooks/__tests__/useTimer.test.tsx`:
   - Add/update a test that clicks Reset and verifies:
     - Timer is paused.
     - `projectElapsed` returns to the project's `totalTimeSeconds`.
     - `subPieceRemaining` returns to `allocatedMinutes * 60 - elapsedSeconds`.
   - Ensure existing tests still pass.

## Test Plan

- Run `npx tsc --noEmit`
- Run `npx vitest run hooks/__tests__/useTimer.test.tsx`
- Run `npm test`
- Run `npm run lint` and confirm the `useTimer.ts` lint errors are gone.
- Live browser verification (mandatory):
  - Navigate to `/timer`.
  - Start timer, let it run a few seconds.
  - Click Reset.
  - Confirm values restore to their starting points and status becomes Paused.

## Files to Modify

- `hooks/useTimer.ts`
- `hooks/__tests__/useTimer.test.tsx`

## Constraints

- Do not change the public API of `useTimer`.
- Keep RAF-based timing accuracy and session persistence behavior unchanged.
- Burmese-first UI labels are unaffected (this is hook logic only).
- Do not accept completion until lint errors for `useTimer.ts` are resolved and live browser verification passes.

## Agent Instructions

- Read `hooks/useTimer.ts` and `hooks/__tests__/useTimer.test.tsx` first.
- Make the minimal changes needed to fix the three issues above.
- Update tests to cover reset behavior and auto-complete handling.
- Run test and lint commands; ensure `useTimer.ts` produces no lint errors.
- Perform live browser verification with Playwright MCP and report the outcome.
