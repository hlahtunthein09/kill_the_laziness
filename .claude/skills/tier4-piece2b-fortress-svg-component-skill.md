# Skill: Tier 4 Piece 2b — FortressSvg Component

## Goal
Create a visual fortress SVG component based on project fortress level and health.

## Why
Fortress level/health are now computed from XP, but there is nothing to show the user. A visual fortress SVG makes gamification tangible.

## Files to Read
1. `.claude/memory/fortress-svg-spec.md` (if exists)
2. `.claude/memory/ui-conventions.md`
3. `lib/types/index.ts`
4. `lib/utils.ts`

## Files to Create
1. `components/fortress/FortressSvg.tsx`
2. `components/fortress/__tests__/FortressSvg.test.tsx`

## Files to Modify
None.

## Implementation Details
- Create `components/fortress/FortressSvg.tsx`:
  - Props: `{ level: number; health: number; size?: number; className?: string }`.
  - Default size 120px.
  - Use inline SVG with pastel nature colors (teal/amber/stone).
  - Draw a simple castle/fortress shape.
  - Add turrets/details based on `level` (e.g., level 1 = 1 tower, level 5 = 3 towers + flag).
  - Add a health bar at the bottom: width = `health%`, color shifts from amber to emerald.
  - Label: `"အဆင့် {level} (Level {level})"` below the SVG.
  - Use `cn()` for class merging.

## Test Strategy
Create `components/fortress/__tests__/FortressSvg.test.tsx`:
1. Renders level 1 fortress.
2. Renders higher level fortress with more towers.
3. Health bar width matches `health` percent.
4. Shows Burmese/English level label.

Run:
1. `npx vitest run components/fortress/__tests__/FortressSvg.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Verification Checklist
- [ ] `FortressSvg.tsx` created with level/health props
- [ ] SVG changes based on level
- [ ] Health bar reflects health percent
- [ ] 4 tests passing
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds

## Notes
- Pure presentational; no store access.
- Keep component under 90 lines.
- Do not over-engineer the SVG; simple shapes are enough.
