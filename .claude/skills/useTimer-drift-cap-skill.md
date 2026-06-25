# Skill: Cap Auto-Resume Drift in `useTimer` (Observation #4A)

## Scope
Add a maximum drift cap to the `useTimer` rehydration logic so that returning after a long absence does not auto-resume and fast-forward an unexpectedly large amount of time.

## Files
- `hooks/useTimer.ts`
- `hooks/__tests__/useTimer.test.tsx`

## Changes
1. Define a constant `MAX_DRIFT_SECONDS = 60 * 60` (60 minutes) in `useTimer.ts`.
2. In `computeInit`, cap the computed drift:
   ```ts
   const drift = session.isRunning
     ? Math.min(MAX_DRIFT_SECONDS, Math.floor((Date.now() - session.savedAt) / 1000))
     : 0;
   ```
3. When the drift hits the cap, treat the session as if it should not auto-complete or auto-resume excessively:
   - `shouldAutoComplete` should remain false if capped drift does not bring remaining to 0.
   - `isRunning` should become false after cap (pause the timer after long absence).
4. Add a test that seeds an old `ff_active_session` (e.g., 2 hours ago), verifies the timer loads paused, and verifies elapsed time is capped at 60 minutes.

## Test Strategy
- Run `npx vitest run hooks/__tests__/useTimer.test.tsx`
- Expect existing tests plus the new drift-cap test to pass.
- Run `npx tsc --noEmit`.

## Verification
- No UI change; hook behavior only.
- No browser verification required.
