# Skill: Tier 4 Piece 1b — Sound Playback Wiring

## Goal
Wire sound playback into timer completion and milestone events.

## Why
The `soundEnabled` setting exists but does nothing until timer events trigger sounds.

## Files to Read
1. `lib/sound.ts` (does not exist yet)
2. `components/timer/TimerPanel.tsx`
3. `components/timer/__tests__/TimerPanel.test.tsx`
4. `components/timer/__tests__/TimerPanel.session-summary.test.tsx`

## Files to Create
1. `lib/sound.ts`
2. `lib/__tests__/sound.test.ts`

## Files to Modify
1. `components/timer/TimerPanel.tsx`

## Implementation Details
- Create `lib/sound.ts`:
  - `playCompleteSound()` — uses `new Audio()` with a short beep or tone (can use a data URI for a simple beep so no external asset needed).
  - `playMilestoneSound()` — slightly different tone.
  - Both check `useFocusStore.getState().settings.soundEnabled` before playing.
- In `TimerPanel.tsx`:
  - Call `playCompleteSound()` when `subPieceRemaining` goes from >0 to 0 (reuse existing transition detection).
  - Call `playMilestoneSound()` when a new milestone is reached (reuse `lastMilestoneRef` logic).
- Use `Audio` API — browser-only, so guard with `typeof window !== "undefined"`.

## Test Strategy
Create `lib/__tests__/sound.test.ts`:
1. `playCompleteSound()` calls `Audio.prototype.play` when `soundEnabled` is true.
2. `playCompleteSound()` does not call play when `soundEnabled` is false.
3. `playMilestoneSound()` plays when enabled.
4. `playMilestoneSound()` skips when disabled.

Mock `Audio` and `useFocusStore.getState()` in tests.

Run:
1. `npx vitest run lib/__tests__/sound.test.ts`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `lib/sound.ts` created with `playCompleteSound` and `playMilestoneSound`
- [ ] Sounds respect `settings.soundEnabled`
- [ ] `TimerPanel` triggers sounds on completion/milestone
- [ ] 4 tests passing
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Keep under 60 lines of change.
- No external sound files; use simple generated tones or data URI beeps.
