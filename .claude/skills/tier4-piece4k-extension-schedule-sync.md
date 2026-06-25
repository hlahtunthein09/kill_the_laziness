# Skill: Tier 4 Piece 4k — Extension Schedule Sync

## Goal
Forward web app schedules to extension storage by including them in the existing timer-state sync payload.

## Files

### Modify
- `extension/lib/types.ts` — add optional `schedules` to `ExtensionTimerState`.
- `extension/lib/focusSync.ts` — include schedules in the sync payload.
- `extension/lib/__tests__/focusSync.test.ts` — add schedule sync test.

## Implementation Details

1. `extension/lib/types.ts`:
   ```ts
   import type { FocusSessionSchedule } from "@/lib/types";

   export interface ExtensionTimerState {
     projectId: string;
     subPieceId?: string;
     projectName?: string;
     subPieceName?: string;
     projectElapsed: number;
     subPieceRemaining: number;
     isRunning: boolean;
     savedAt: number;
     schedules?: FocusSessionSchedule[];
   }
   ```

2. `extension/lib/focusSync.ts`:
   - In `syncFocusSession`, read `schedules` from `useFocusStore.getState()`.
   - Add `schedules` to the payload sent via `browser.runtime.sendMessage`.
   - Example:
     ```ts
     const payload: ExtensionTimerState = {
       ...session,
       schedules: state.schedules,
     };
     ```

3. No changes to `messageHandler.ts` needed — the existing `UPDATE_TIMER_STATE` handler stores the whole payload including the new optional field.

## Test Strategy

Extend `extension/lib/__tests__/focusSync.test.ts`:

```ts
it('forwards schedules to extension', async () => {
  const schedule = {
    id: 'sched-1',
    projectId: 'proj-1',
    dayOfWeek: 1,
    startTime: '09:00',
    durationMinutes: 25,
    enabled: true,
    createdAt: Date.now(),
  };

  useFocusStore.setState({
    schedules: [schedule],
    activeProjectId: 'proj-1',
  });

  const session = createValidSession();
  await syncFocusSession(browser, session);

  expect(browser.runtime.sendMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      action: 'UPDATE_TIMER_STATE',
      payload: expect.objectContaining({
        ...session,
        schedules: [schedule],
      }),
    })
  );
});
```

## Verification Checklist

- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run extension/lib/__tests__/focusSync.test.ts` passes.
- [ ] `npm run build:ext` succeeds.
- [ ] No new lint warnings.
- [ ] Agent reports file paths and line counts.

## Agent Notes

- Lightweight agent; read `extension/lib/types.ts`, `extension/lib/focusSync.ts`, and its test file.
- Do not run the full test suite; run only the targeted test file.
- Do not open a browser or run `npm run dev`.
- If any step fails, fix it before reporting done.
