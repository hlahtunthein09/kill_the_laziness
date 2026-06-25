# Skill: Tier 4 Piece 4a — Schedule Type + Default Constants

## Goal
Add the `FocusSessionSchedule` domain type and a default duration constant so later scheduled-session pieces have a stable contract.

## Files

### Modify
- `lib/types/index.ts` — append `FocusSessionSchedule` interface.
- `lib/constants.ts` — append `DEFAULT_SCHEDULE_DURATION_MINUTES`.

### Create
- `lib/__tests__/schedule-constants.test.ts` — verifies the constant value and that the type can be used to build an object.

## Implementation Details

1. In `lib/types/index.ts`, after `TimerState` append:
   ```ts
   export interface FocusSessionSchedule {
     id: string;
     projectId: string;
     subPieceId?: string;
     dayOfWeek: number; // 0 (Sun) - 6 (Sat)
     startTime: string; // "HH:mm" 24-hour
     durationMinutes: number;
     enabled: boolean;
     createdAt: number;
   }
   ```

2. In `lib/constants.ts`, after `DEFAULT_APP_SETTINGS` add:
   ```ts
   export const DEFAULT_SCHEDULE_DURATION_MINUTES = 25;
   ```

3. Keep code English-only. No UI text in this piece.

## Test Strategy

Create `lib/__tests__/schedule-constants.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { DEFAULT_SCHEDULE_DURATION_MINUTES } from '@/lib/constants';
import type { FocusSessionSchedule } from '@/lib/types';

describe('schedule constants', () => {
  it('default schedule duration is 25 minutes', () => {
    expect(DEFAULT_SCHEDULE_DURATION_MINUTES).toBe(25);
  });

  it('FocusSessionSchedule type can construct a schedule object', () => {
    const schedule: FocusSessionSchedule = {
      id: 'sched-1',
      projectId: 'proj-1',
      subPieceId: 'sub-1',
      dayOfWeek: 1,
      startTime: '09:00',
      durationMinutes: DEFAULT_SCHEDULE_DURATION_MINUTES,
      enabled: true,
      createdAt: 1_700_000_000_000,
    };
    expect(schedule.dayOfWeek).toBe(1);
    expect(schedule.enabled).toBe(true);
  });
});
```

## Verification Checklist

- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run lib/__tests__/schedule-constants.test.ts` passes.
- [ ] No new lint warnings.
- [ ] Agent reports file paths and line counts.

## Agent Notes

- Lightweight agent; read only `lib/types/index.ts` and `lib/constants.ts` before editing.
- Do not run the full test suite; run only the targeted test file.
- Do not open a browser or run `npm run dev`.
