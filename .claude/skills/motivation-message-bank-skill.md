# Skill: Motivation Message Bank Build

## Purpose
Create a bank of encouraging, Burmese-first motivational messages and helpers to pick the right message based on timer/focus context.

## Scope
- **Create**
  - `lib/motivation.ts`
  - `lib/notifications.ts`
  - `lib/__tests__/motivation.test.ts`
- **Modify**: none
- **Size**: Small — 3 files, ~150 lines

## References
- `.claude/memory/conventions.md` — language rules
- `.claude/skills/notification-craft-skill.md`
- Existing `.claude/memory/notification-spec.md` (create if missing)

## Steps
1. Read `.claude/CLAUDE.md`, `.claude/memory/conventions.md`, `.claude/memory/progress.md`.
2. Create `.claude/memory/notification-spec.md` with tier definitions and tone guidelines.
3. Create `lib/motivation.ts`.
   - Define `MotivationTier = 'beginning' | 'struggling' | 'succeeding' | 'completing'`.
   - Define `MotivationContext`:
     ```ts
     interface MotivationContext {
       elapsedSeconds: number;
       remainingSeconds?: number;
       isRunning: boolean;
       completedToday: number;
     }
     ```
   - Create tiered message arrays. Each message is an object:
     ```ts
     { my: string; en: string }
     ```
   - Create `getMotivation(context): { my: string; en: string; tier: MotivationTier }`.
     - beginning: timer just started, elapsed < 60s
     - struggling: elapsed > 5min and little progress (no remaining or high ratio)
     - succeeding: elapsed > 2min and progressing
     - completing: remaining < 60s or just completed
4. Create `lib/notifications.ts`.
   - Default notification templates for session complete and distraction blocked.
   - Burmese-first, short enough for desktop/mobile alerts.
5. Create `lib/__tests__/motivation.test.ts`.
   - Test each tier returns a valid Burmese string.
   - Test `getMotivation` picks the expected tier for given contexts.
6. Run `npx tsc --noEmit` and `npx vitest run lib/__tests__/motivation.test.ts`.
7. Update `.claude/memory/progress.md`.

## Rules
- Burmese first, English secondary.
- Encouraging tone. No shaming.
- Messages short enough for notification popups.
- No UI components.

## Agent
- **Notification Copywriter**

## Verification
- TypeScript compiles.
- Tests pass.
- Every tier has at least 3 messages.
- Helper returns correct tier for sample contexts.
