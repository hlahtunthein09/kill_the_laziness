# Skill: Add `onComplete` Callback to `useTimer` (Issue #6a)

## Scope
Add an optional `onComplete` callback to the `useTimer` hook so callers can reliably know when a sub-piece has been auto-completed by the timer engine.

## Root Cause
`TimerPanel` currently tries to infer completion by watching `subPieceRemaining` drop to 0. This is fragile because the hook may reset state or auto-complete on rehydration before the panel's transition effect runs.

## Files
- `hooks/useTimer.ts`
- `hooks/__tests__/useTimer.test.tsx`

## Changes
1. Add optional `onComplete?: () => void` parameter to `useTimer(projectId, subPieceId, onComplete)`.
2. Inside the RAF loop, after calling `completeSubPiece` when `nextSubPieceRemaining` hits 0, invoke `onComplete?.()`.
3. Store the callback in a ref so the RAF loop can call the latest version without being a dependency.
4. Add/update tests to assert `onComplete` is called when the sub-piece reaches zero.

## Test Strategy
- Run `npx vitest run hooks/__tests__/useTimer.test.tsx`
- Expect all existing tests plus the new `onComplete` test(s) to pass.
- Run `npx tsc --noEmit`.

## Verification
- No UI change; this is a hook API extension.
- No browser verification required.
