# Skill: Tier 3 Piece 2a — SessionSummary Component

## Goal
Create a presentational focus-session completion card.

## Files to Read
1. `lib/time.ts`
2. `lib/motivation.ts`
3. `.claude/memory/ui-conventions.md`

## Files to Create
1. `components/timer/SessionSummary.tsx`
2. `components/timer/__tests__/SessionSummary.test.tsx`

## Files to Modify
None.

## Props
```ts
interface SessionSummaryProps {
  projectName: string;
  subPieceName: string;
  elapsedSeconds: number;
  allocatedMinutes: number;
  xpGained: number;
  className?: string;
}
```

## Implementation
- Use `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Button` from shadcn/ui.
- Container classes: `rounded-xl border border-stone-200 bg-white p-6 shadow-sm`.
- Header: `"အချိန်ပြည့် focus session (Focus Session Complete)"`.
- Show project name, sub-piece name, focused duration (`formatDuration`), allocated minutes, XP gained.
- Show motivation message via `getMotivation({ elapsedSeconds, remainingSeconds: 0, isRunning: false, completedToday: 1 })`.
- Use Lucide icons: `CheckCircle2`, `Clock`, `Target`, `Sparkles`.
- Use `cn()` from `lib/utils.ts`.

## Tests
Create `components/timer/__tests__/SessionSummary.test.tsx`:
1. Renders Burmese header.
2. Renders English header.
3. Shows project and sub-piece names.
4. Shows formatted focused duration.
5. Shows XP gained.

## Verification
1. `npx vitest run components/timer/__tests__/SessionSummary.test.tsx`
2. `npx tsc --noEmit`
3. `npm run build`

## Notes
- Pure presentational; no store, no timer logic.
- Keep component under 70 lines.
