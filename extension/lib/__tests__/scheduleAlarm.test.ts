import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import { setBrowserInstance, getTimerState } from "../storage";
import {
  setScheduleAlarmBrowserInstance,
  startScheduleAlarm,
  stopScheduleAlarm,
  onScheduleAlarmTick,
  _resetLastNotifiedRef,
} from "../scheduleAlarm";
import type { ExtensionTimerState } from "../types";

async function seedTimerState(state: ExtensionTimerState): Promise<void> {
  await fakeBrowser.storage.local.set({ ff_extension_timer: state });
}

describe("scheduleAlarm.ts", () => {
  beforeEach(() => {
    setBrowserInstance(fakeBrowser);
    setScheduleAlarmBrowserInstance(fakeBrowser);
    _resetLastNotifiedRef();
    fakeBrowser.reset();
  });

  describe("startScheduleAlarm / stopScheduleAlarm", () => {
    it("creates a periodic alarm named schedule-check", async () => {
      await startScheduleAlarm();

      const alarm = await fakeBrowser.alarms.get("schedule-check");
      expect(alarm).not.toBeNull();
      expect(alarm?.name).toBe("schedule-check");
      expect(alarm?.periodInMinutes).toBe(1);
    });

    it("clears the schedule-check alarm", async () => {
      await startScheduleAlarm();
      expect(await fakeBrowser.alarms.get("schedule-check")).not.toBeUndefined();

      await stopScheduleAlarm();
      expect(await fakeBrowser.alarms.get("schedule-check")).toBeUndefined();
    });
  });

  describe("onScheduleAlarmTick", () => {
    it("does not notify when no schedules", async () => {
      const state: ExtensionTimerState = {
        projectId: "p1",
        projectElapsed: 0,
        subPieceRemaining: 600,
        isRunning: false,
        savedAt: Date.now(),
      };
      await seedTimerState(state);

      await onScheduleAlarmTick();

      const notifications = await fakeBrowser.notifications.getAll();
      expect(Object.keys(notifications)).toHaveLength(0);
    });

    it("notifies when a schedule is due", async () => {
      const now = new Date("2026-06-25T09:00:00"); // Thursday = day 4
      vi.setSystemTime(now);

      const state: ExtensionTimerState = {
        projectId: "p1",
        projectName: "My Project",
        subPieceName: "My Sub",
        projectElapsed: 0,
        subPieceRemaining: 600,
        isRunning: false,
        savedAt: Date.now(),
        schedules: [
          {
            id: "s1",
            projectId: "p1",
            dayOfWeek: 4,
            startTime: "09:00",
            durationMinutes: 25,
            enabled: true,
            createdAt: Date.now(),
          },
        ],
      };
      await seedTimerState(state);

      await onScheduleAlarmTick();

      const notifications = await fakeBrowser.notifications.getAll();
      expect(Object.keys(notifications)).toHaveLength(1);

      const notifId = Object.keys(notifications)[0];
      const notif = notifications[notifId];
      expect(notif.type).toBe("basic");
      expect(notif.title).toContain("စီစဉ်ထားသော");
      expect(notif.message).toContain("My Project");
    });

    it("dedups notifications within the same minute", async () => {
      const now = new Date("2026-06-25T09:00:00"); // Thursday = day 4
      vi.setSystemTime(now);

      const state: ExtensionTimerState = {
        projectId: "p1",
        projectName: "My Project",
        subPieceName: "My Sub",
        projectElapsed: 0,
        subPieceRemaining: 600,
        isRunning: false,
        savedAt: Date.now(),
        schedules: [
          {
            id: "s1",
            projectId: "p1",
            dayOfWeek: 4,
            startTime: "09:00",
            durationMinutes: 25,
            enabled: true,
            createdAt: Date.now(),
          },
        ],
      };
      await seedTimerState(state);

      await onScheduleAlarmTick();
      await onScheduleAlarmTick();

      const notifications = await fakeBrowser.notifications.getAll();
      expect(Object.keys(notifications)).toHaveLength(1);
    });
  });
});
