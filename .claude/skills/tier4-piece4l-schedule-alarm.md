# Skill: Tier 4 Piece 4l — Extension Schedule Alarm + Notification

## Goal
Add a background alarm that checks synced schedules every minute and shows a desktop notification when a schedule is due.

## Files

### Create
- `extension/lib/scheduleAlarm.ts` — alarm logic + notification trigger.
- `extension/lib/__tests__/scheduleAlarm.test.ts` — alarm behavior tests.

### Modify
- `extension/entrypoints/background.ts` — start alarm and wire listener.

## Implementation Details

1. `extension/lib/scheduleAlarm.ts`:
   ```ts
   import type { Browser } from "webextension-polyfill";
   import { getTimerState } from "./storage";

   const SCHEDULE_ALARM_NAME = "schedule-check";

   let _browser: Browser | null = null;

   export function setScheduleAlarmBrowserInstance(browser: Browser): void {
     _browser = browser;
   }

   async function getBrowser(): Promise<Browser> {
     if (!_browser) {
       const { browser } = await import("wxt/browser");
       _browser = browser;
     }
     return _browser!;
   }

   export async function startScheduleAlarm(): Promise<void> {
     const browser = await getBrowser();
     browser.alarms.create(SCHEDULE_ALARM_NAME, { periodInMinutes: 1 });
   }

   export async function stopScheduleAlarm(): Promise<void> {
     const browser = await getBrowser();
     browser.alarms.clear(SCHEDULE_ALARM_NAME);
   }

   const lastNotifiedRef = { id: "", minute: -1 };

   export async function onScheduleAlarmTick(): Promise<void> {
     const state = await getTimerState();
     if (!state?.schedules || state.schedules.length === 0) return;

     const now = new Date();
     const currentDay = now.getDay();
     const currentMinute = now.getHours() * 60 + now.getMinutes();

     const due = state.schedules.find((s) => {
       if (!s.enabled || s.dayOfWeek !== currentDay) return false;
       const [h, m] = s.startTime.split(":").map(Number);
       const scheduleMinute = h * 60 + m;
       return scheduleMinute === currentMinute;
     });

     if (!due) return;
     if (lastNotifiedRef.id === due.id && lastNotifiedRef.minute === currentMinute) return;

     lastNotifiedRef.id = due.id;
     lastNotifiedRef.minute = currentMinute;

     const browser = await getBrowser();
     await browser.notifications.create("schedule-due", {
       type: "basic",
       iconUrl: "/icon/128.png",
       title: "FocusFlow AI — စီစဉ်ထားသော focus အချိန် ရောက်ပါပြီ",
       message: `${state.projectName ?? "ပရောဂျက်"} · ${state.subPieceName ?? "အထွေထွေ focus"} · ${due.startTime}`,
     });
   }
   ```

2. `extension/entrypoints/background.ts`:
   - Import `startScheduleAlarm` and `onScheduleAlarmTick`.
   - Call `startScheduleAlarm()` inside `defineBackground`.
   - Add alarm listener:
     ```ts
     browser.alarms.onAlarm.addListener((alarm: AlarmEvent) => {
       if (alarm.name === "focus-timer") {
         onAlarmTick();
       } else if (alarm.name === "schedule-check") {
         onScheduleAlarmTick().catch((err: unknown) => {
           console.error("Schedule alarm error:", err);
         });
       }
     });
     ```

## Test Strategy

Create `extension/lib/__tests__/scheduleAlarm.test.ts`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  startScheduleAlarm,
  stopScheduleAlarm,
  onScheduleAlarmTick,
  setScheduleAlarmBrowserInstance,
} from '../scheduleAlarm';
import { getTimerState } from '../storage';

vi.mock('../storage', () => ({
  getTimerState: vi.fn(),
}));

describe('scheduleAlarm', () => {
  const fakeBrowser = {
    alarms: {
      create: vi.fn(),
      clear: vi.fn(),
    },
    notifications: {
      create: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setScheduleAlarmBrowserInstance(fakeBrowser as unknown as Browser);
    vi.setSystemTime(new Date('2026-06-25T09:00:00'));
  });

  it('starts and stops schedule alarm', async () => {
    await startScheduleAlarm();
    expect(fakeBrowser.alarms.create).toHaveBeenCalledWith('schedule-check', { periodInMinutes: 1 });

    await stopScheduleAlarm();
    expect(fakeBrowser.alarms.clear).toHaveBeenCalledWith('schedule-check');
  });

  it('does not notify when no schedules', async () => {
    // @ts-expect-error - mock return
    getTimerState.mockResolvedValue({ schedules: [] });
    await onScheduleAlarmTick();
    expect(fakeBrowser.notifications.create).not.toHaveBeenCalled();
  });

  it('notifies when a schedule is due', async () => {
    // @ts-expect-error - mock return
    getTimerState.mockResolvedValue({
      projectName: 'My Project',
      subPieceName: 'My Sub',
      schedules: [
        {
          id: 's1',
          projectId: 'p1',
          dayOfWeek: 4,
          startTime: '09:00',
          durationMinutes: 25,
          enabled: true,
          createdAt: Date.now(),
        },
      ],
    });

    await onScheduleAlarmTick();
    expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(1);
    expect(fakeBrowser.notifications.create).toHaveBeenCalledWith(
      'schedule-due',
      expect.objectContaining({
        title: expect.stringContaining('စီစဉ်ထားသော'),
      })
    );
  });

  it('dedups notifications within the same minute', async () => {
    const state = {
      schedules: [
        {
          id: 's1',
          projectId: 'p1',
          dayOfWeek: 4,
          startTime: '09:00',
          durationMinutes: 25,
          enabled: true,
          createdAt: Date.now(),
        },
      ],
    };
    // @ts-expect-error - mock return
    getTimerState.mockResolvedValue(state);

    await onScheduleAlarmTick();
    await onScheduleAlarmTick();
    expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(1);
  });
});
```

## Verification Checklist

- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vitest run extension/lib/__tests__/scheduleAlarm.test.ts` passes.
- [ ] `npm run build:ext` succeeds.
- [ ] No new lint warnings.
- [ ] Agent reports file paths and line counts.

## Agent Notes

- Lightweight agent; read `extension/lib/timerAlarm.ts` and `extension/entrypoints/background.ts` for patterns.
- Do not run the full test suite; run only the targeted test file.
- Do not open a browser or run `npm run dev`.
- Keep `scheduleAlarm.ts` under ~70 lines.
- If any step fails, fix it before reporting done.
