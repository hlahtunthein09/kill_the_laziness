# Skill: Tier 4 Piece 2a — Fortress Level/Health Computation

## Goal
Derive `fortressLevel` and `fortressHealth` from project XP in the Zustand store.

## Why
`Project` already has `fortressLevel` and `fortressHealth` fields but they are stale. Before drawing a fortress visualization, these values must reflect actual project XP.

## Files to Read
1. `lib/store/slices/projectSlice.ts`
2. `lib/constants.ts`
3. `lib/store/__tests__/useFocusStore.test.ts`

## Files to Create
1. `lib/store/__tests__/fortress.test.ts`

## Files to Modify
1. `lib/store/slices/projectSlice.ts`

## Implementation Details
- Add helper functions in `projectSlice.ts`:
  - `getFortressLevelFromXp(xp: number): number` — returns level based on `LEVEL_THRESHOLDS`.
  - `getFortressHealthFromXp(xp: number): number` — returns percentage (0-100) toward next level.
- Update `addProject`:
  - Set `fortressLevel: 1`, `fortressHealth: 100`.
- Update `incrementProjectTime`:
  - After adding XP, recompute `fortressLevel` and `fortressHealth` for the project.
- Update `completeSubPiece`:
  - After adding XP, recompute `fortressLevel` and `fortressHealth`.
- Formula for health:
  - `currentLevel = getLevelFromXp(xp)`
  - `currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1]`
  - `nextThreshold = LEVEL_THRESHOLDS[currentLevel]` (or max if at max level)
  - `progress = xp - currentThreshold`
  - `required = nextThreshold - currentThreshold`
  - `health = Math.round((progress / required) * 100)`
  - At max level, health = 100.

## Test Strategy
Create `lib/store/__tests__/fortress.test.ts`:
1. New project starts at fortress level 1, health 100.
2. XP gain increases fortress level when threshold crossed.
3. Fortress health reflects progress toward next level.
4. `completeSubPiece` updates fortress via XP bonus.

Run:
1. `npx vitest run lib/store/__tests__/fortress.test.ts`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] Fortress level/health derived from XP
- [ ] Updated on XP gain and sub-piece completion
- [ ] 4 tests passing
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- No UI changes in this piece.
- Keep under 60 lines of change.
