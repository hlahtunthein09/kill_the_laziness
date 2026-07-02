# Skill: Sub-piece Timer Count-Up Display

## Goal
Make the sub-piece timer **count up** (show elapsed time increasing) instead of counting down remaining time, with a highlighted target label. Display-only change; the `useTimer` engine stays unchanged.

## Scope
- Modify `components/timer/TimerDisplay.tsx`.
- Update `components/timer/__tests__/TimerDisplay.test.tsx`.
- Do NOT touch `hooks/useTimer.ts` — it still counts `subPieceRemaining` down internally and auto-completes at zero.

## Rules
- `useTimer` continues to own `subPieceRemaining` (countdown + auto-complete). Do not change it.
- Sub-piece elapsed is derived in the display: `subPieceElapsed = Math.max(0, allocatedMinutes*60 - subPieceRemaining)`.
- Elapsed + target label only — **no progress bar** for the sub-piece.
- Follow project conventions: `cn()`, `formatDuration` from `lib/time`, seconds internally, Burmese-first labels, dark semantic tokens (`text-primary`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-muted`).

## Implementation
In `TimerDisplay.tsx`, replace the sub-piece "Remaining" block (the `showRemaining` section) with an elapsed count-up block:

1. Keep `showRemaining = allocatedMinutes && allocatedMinutes > 0` (rename intent, still gates on allocated).
2. Compute `subPieceElapsed = Math.max(0, allocatedMinutes! * 60 - subPieceRemaining)`.
3. Render:
   - Label (muted, small): sub-piece name (highlighted `font-semibold text-primary` when present) + `အတွက် အသုံးပြုပြီးအချိန်` + `(Elapsed)`. `data-testid="subpiece-elapsed-label"`.
   - Highlighted **target label**: `text-sm font-semibold text-primary`, `data-testid="subpiece-target-label"`, text `သတ်မှတ်ထားသော အချိန်: {formatDuration(allocatedMinutes*60)}`.
   - Count-up value: `{formatDuration(subPieceElapsed)}` in a bordered ring like the project value (`text-2xl font-semibold tabular-nums px-3 py-0.5 rounded-lg border ring-1 text-foreground border-border bg-muted/50 ring-border`). `data-testid="subpiece-elapsed-value"`.
4. Remove the old rose "<=60s remaining" styling and the `remaining-label` testid.

## Tests (`TimerDisplay.test.tsx`)
Update sub-piece assertions:
- When `allocatedMinutes>0` and `subPieceRemaining` given, elapsed value = `allocatedMinutes*60 - subPieceRemaining` formatted (e.g. allocated 25, remaining 1300 → elapsed 200s → `3m 20s`).
- Target label present with allocated time.
- Elapsed clamps at 0 when `subPieceRemaining > allocatedMinutes*60`.
- No `remaining-label` testid rendered.
- Existing project-time / target-progress / status tests still pass.

## Verify
- `npx tsc --noEmit`
- `npx vitest run components/timer/__tests__/TimerDisplay.test.tsx`

## Done criteria
Both commands pass; sub-piece shows count-up elapsed + highlighted target label; no progress bar; useTimer untouched.
