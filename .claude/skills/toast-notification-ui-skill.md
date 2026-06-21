# Skill: Toast Notification UI Build

## Purpose
Show motivational toast notifications from the timer based on focus state.

## Scope
- **Create**
  - `components/timer/TimerToast.tsx`
  - `components/timer/__tests__/TimerToast.test.tsx`
- **Modify**
  - `components/timer/TimerPanel.tsx` — trigger toasts
- **Size**: Small — 3 files, ~120 lines

## References
- `.claude/memory/notification-spec.md`
- `lib/motivation.ts` — `getMotivation(context)`
- `components/ui/sonner.tsx`
- `components/timer/TimerPanel.tsx`

## Steps
1. Read memory files and reference components.
2. Create `components/timer/TimerToast.tsx` as a `"use client"` component.
   - Props:
     ```ts
     interface TimerToastProps {
       context: MotivationContext;
       trigger?: "start" | "milestone" | "complete";
     }
     ```
   - Call `getMotivation(context)`.
   - Use `toast.info(motivation.my, { description: motivation.en })` from `sonner`.
   - Only toast when `trigger` changes or on explicit milestone; do not loop continuously.
3. Modify `components/timer/TimerPanel.tsx`.
   - Import `TimerToast`.
   - Render `<TimerToast context={context} trigger={trigger} />`.
   - Derive `trigger` from timer state:
     - `start` when timer transitions from paused to running.
     - `milestone` every 5 minutes of elapsed time (or on tier change).
     - `complete` when sub-piece finishes.
4. Create `components/timer/__tests__/TimerToast.test.tsx`.
   - Mock `sonner` toast.
   - Test that `TimerToast` calls `toast.info` with the Burmese message.
5. Run `npx tsc --noEmit` and `npx vitest run components/timer/__tests__/TimerToast.test.tsx`.
6. Update `.claude/memory/progress.md`.

## Rules
- Burmese-first message, English as description.
- Do not spam toasts; only trigger on meaningful state changes.
- Do not modify `lib/motivation.ts` or `lib/notifications.ts`.
- Keep toast duration short (default).

## Agent
- **UI Designer**

## Verification
- TypeScript compiles.
- Tests pass.
- Toasts appear on timer start, milestones, and completion.
- No continuous toast spam.
