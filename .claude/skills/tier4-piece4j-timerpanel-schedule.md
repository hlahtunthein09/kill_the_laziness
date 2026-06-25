# Skill: Tier 4 Piece 4j — TimerPanel Schedule Integration

## Goal
Wire `useScheduleWatcher` and `ScheduleToast` into `TimerPanel` so due-schedule toasts fire wherever the timer panel is rendered.

## Files

### Modify
- `components/timer/TimerPanel.tsx` — add watcher + toast.
- `components/timer/__tests__/TimerPanel.test.tsx` — add integration tests.

## Implementation Details

1. `components/timer/TimerPanel.tsx`:
   - Import `useScheduleWatcher` from `@/hooks/useScheduleWatcher`.
   - Import `ScheduleToast` from `@/components/schedule/ScheduleToast`.
   - Inside the component (after store selectors), add:
     ```ts
     const { dueSchedule } = useScheduleWatcher();
     const dueProject = projects.find((p) => p.id === dueSchedule?.projectId);
     const dueSubPiece = dueProject?.subPieces.find(
       (sp) => sp.id === dueSchedule?.subPieceId
     );
     ```
   - Render `<ScheduleToast dueSchedule={dueSchedule} projectName={dueProject?.name} subPieceName={dueSubPiece?.name} />` near `TimerToast`.

2. Keep all existing TimerPanel behavior unchanged.

## Test Strategy

Extend `components/timer/__tests__/TimerPanel.test.tsx`:

```tsx
import { vi } from 'vitest';

vi.mock('@/hooks/useScheduleWatcher', () => ({
  useScheduleWatcher: vi.fn(),
}));

// In existing mock store, provide schedules and projects.

it('renders ScheduleToast when a schedule is due', () => {
  // @ts-expect-error - mock return
  useScheduleWatcher.mockReturnValue({
    dueSchedule: {
      id: 'due-s1',
      projectId: 'p1',
      subPieceId: 'sp1',
      dayOfWeek: 1,
      startTime: '09:00',
      durationMinutes: 25,
      enabled: true,
      createdAt: Date.now(),
    },
  });

  render(<TimerPanel />);
  // ScheduleToast renders null; verify toast.info was called via sonner mock.
  expect(toast.info).toHaveBeenCalled();
});

it('does not render ScheduleToast when no schedule is due', () => {
  // @ts-expect-error - mock return
  useScheduleWatcher.mockReturnValue({ dueSchedule: undefined });

  render(<TimerPanel />);
  expect(toast.info).not.toHaveBeenCalled();
});
```

## Verification Checklist

- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run components/timer/__tests__/TimerPanel.test.tsx` passes.
- [ ] No new lint warnings.
- [ ] Agent reports file paths and line counts.

## Agent Notes

- Lightweight agent; read `components/timer/TimerPanel.tsx` and its test file.
- Do not run the full test suite; run only the targeted test file.
- Do not open a browser or run `npm run dev`.
- If any step fails, fix it before reporting done.
