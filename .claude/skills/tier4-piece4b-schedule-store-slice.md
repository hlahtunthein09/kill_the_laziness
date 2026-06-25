# Skill: Tier 4 Piece 4b — Schedule Store Slice (add/delete/toggle)

## Goal
Add a Zustand slice that owns `FocusSessionSchedule` state and exposes add, delete, and toggle actions.

## Files

### Create
- `lib/store/slices/scheduleSlice.ts` — `ScheduleSlice` interface + `createScheduleSlice`.
- `lib/store/__tests__/scheduleSlice.test.ts` — tests for add/delete/toggle.

### Modify
- `lib/store/useFocusStore.ts` — import `ScheduleSlice`/`createScheduleSlice`, add to `FocusState`, spread into persisted store.

## Implementation Details

1. `lib/store/slices/scheduleSlice.ts`:
   ```ts
   "use client";

   import type { StateCreator } from "zustand";
   import type { FocusSessionSchedule } from "@/lib/types";
   import type { FocusState } from "../useFocusStore";
   import { generateId } from "@/lib/utils";

   export interface ScheduleSlice {
     schedules: FocusSessionSchedule[];
     addSchedule: (
       schedule: Omit<FocusSessionSchedule, "id" | "createdAt" | "enabled">
     ) => FocusSessionSchedule;
     deleteSchedule: (id: string) => void;
     toggleSchedule: (id: string) => void;
   }

   export const createScheduleSlice: StateCreator<FocusState, [], [], ScheduleSlice> = (set, get) => ({
     schedules: [],

     addSchedule: (schedule) => {
       const newSchedule: FocusSessionSchedule = {
         ...schedule,
         id: generateId(),
         createdAt: Date.now(),
         enabled: true,
       };
       set((state) => ({
         schedules: [...state.schedules, newSchedule],
       }));
       return newSchedule;
     },

     deleteSchedule: (id) => {
       set((state) => ({
         schedules: state.schedules.filter((s) => s.id !== id),
       }));
     },

     toggleSchedule: (id) => {
       set((state) => ({
         schedules: state.schedules.map((s) =>
           s.id === id ? { ...s, enabled: !s.enabled } : s
         ),
       }));
     },
   });
   ```

2. `lib/store/useFocusStore.ts`:
   - Import `createScheduleSlice, type ScheduleSlice`.
   - Add `ScheduleSlice` to `FocusState` intersection.
   - Spread `createScheduleSlice(set, get, ...rest)` into the persisted object.

## Test Strategy

Create `lib/store/__tests__/scheduleSlice.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useFocusStore } from '../useFocusStore';
import { DEFAULT_APP_SETTINGS } from '@/lib/constants';

const baseScheduleInput = {
  projectId: 'proj-1',
  subPieceId: 'sub-1',
  dayOfWeek: 1,
  startTime: '09:00',
  durationMinutes: 25,
};

describe('ScheduleSlice', () => {
  beforeEach(() => {
    useFocusStore.setState({
      projects: [],
      activeProjectId: null,
      settings: { ...DEFAULT_APP_SETTINGS },
      logs: [],
      hasHydrated: false,
      schedules: [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with empty schedules', () => {
    expect(useFocusStore.getState().schedules).toEqual([]);
  });

  it('addSchedule creates an enabled schedule with id and createdAt', () => {
    const before = Date.now();
    const schedule = useFocusStore.getState().addSchedule(baseScheduleInput);
    const after = Date.now();

    expect(schedule.projectId).toBe('proj-1');
    expect(schedule.enabled).toBe(true);
    expect(schedule.createdAt).toBeGreaterThanOrEqual(before);
    expect(schedule.createdAt).toBeLessThanOrEqual(after);
    expect(schedule.id).toBeDefined();

    expect(useFocusStore.getState().schedules).toHaveLength(1);
  });

  it('deleteSchedule removes the schedule', () => {
    const schedule = useFocusStore.getState().addSchedule(baseScheduleInput);
    useFocusStore.getState().deleteSchedule(schedule.id);
    expect(useFocusStore.getState().schedules).toHaveLength(0);
  });

  it('toggleSchedule flips enabled state', () => {
    const schedule = useFocusStore.getState().addSchedule(baseScheduleInput);
    expect(schedule.enabled).toBe(true);

    useFocusStore.getState().toggleSchedule(schedule.id);
    expect(useFocusStore.getState().schedules[0].enabled).toBe(false);

    useFocusStore.getState().toggleSchedule(schedule.id);
    expect(useFocusStore.getState().schedules[0].enabled).toBe(true);
  });
});
```

## Verification Checklist

- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run lib/store/__tests__/scheduleSlice.test.ts` passes.
- [ ] No new lint warnings.
- [ ] Agent reports file paths and line counts.

## Agent Notes

- Lightweight agent; read only `lib/store/useFocusStore.ts` and `lib/store/slices/projectSlice.ts`/`settingsSlice.ts` for pattern reference.
- Do not run the full test suite; run only the targeted test file.
- Do not open a browser or run `npm run dev`.
