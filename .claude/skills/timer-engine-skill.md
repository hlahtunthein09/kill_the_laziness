# Skill: Timer Engine Build

## Purpose
Build an accurate, drift-corrected hierarchical timer engine.

## When to Use
Implementing project timer, sub-piece countdown, or session tracking.

## References
- Context7: `/vercel/next.js` (client components)
- GitHub: `dominhduy09/pomodoro-extension` for timer patterns

## Steps
1. Read `.claude/memory/timer-behavior.md`.
2. Create/update `hooks/useTimer.ts` with `requestAnimationFrame`.
3. Create/update `hooks/useHierarchicalTimer.ts` for project + sub-piece orchestration.
4. Wire timer completion to store actions and XP awards.
5. Run `npx tsc --noEmit`.
6. Update `.claude/memory/progress.md`.

## Rules
- Use `Date.now()` delta, not `setInterval`.
- Persist every 5 seconds.
- Handle tab close/reopen drift correction.
- Auto-complete sub-piece at zero.

## Verification
- Timer counts accurately over 5-minute test.
- State persists across reload.
- Sub-piece auto-completes and advances.
