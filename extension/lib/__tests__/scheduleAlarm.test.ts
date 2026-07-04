import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import { setBrowserInstance } from "../storage";
import {
  setScheduleAlarmBrowserInstance,
  startScheduleAlarm,
  stopScheduleAlarm,
  onScheduleAlarmTick,
  _resetLastNotifiedRef,
} from "../scheduleAlarm";
import type { ExtensionTimerState } from "../types";

interface FakeNotificationsWithPermission {
  getPermissionLevel(): Promise<string>;
}

function setNotificationPermissionLevel(level: string): void {
  (
    fakeBrowser.notifications as unknown as FakeNotificationsWithPermission
  ).getPermissionLevel = vi.fn().mockResolvedValue(level);
}

async function seedTimerState(state: ExtensionTimerState): Promise<void> {
  await fakeBrowser.storage.local.set({ ff_extension_timer: state });
}

function getCreateMock() {
  return fakeBrowser.notifications.create as ReturnType<typeof vi.fn>;
}

describe("scheduleAlarm.ts", () => {
  beforeEach(() => {
    fakeBrowser.reset();
    setBrowserInstance(fakeBrowser);
    setScheduleAlarmBrowserInstance(fakeBrowser);
    _resetLastNotifiedRef();
    fakeBrowser.runtime.getURL = (path: string) => `chrome-extension://test${path}`;
    fakeBrowser.notifications.create = vi.fn().mockResolvedValue("notification-id");
    setNotificationPermissionLevel("granted");
    vi.clearAllMocks();
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

      expect(fakeBrowser.notifications.create).not.toHaveBeenCalled();
    });

    it("notifies when a schedule is due", async () => {
      const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
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

      expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(1);
      const [id, options] = getCreateMock().mock.calls[0];
      expect(id.startsWith("schedule-due-")).toBe(true);
      expect(options).toMatchObject({
        type: "basic",
        iconUrl: "chrome-extension://test/icon/128.png",
        title: "FocusFlow AI — စီစဉ်ထားသော focus အချိန် ရောက်ပါပြီ",
        message: "စတင်ကြည့်ရအောင်! — Let's get started! · My Project · 09:00",
      });

      randomSpy.mockRestore();
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

      expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(1);
    });

    it("resolves without creating a notification when permission is denied", async () => {
      setNotificationPermissionLevel("denied");
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

      await expect(onScheduleAlarmTick()).resolves.not.toThrow();
      expect(fakeBrowser.notifications.create).not.toHaveBeenCalled();
    });

    it("uses fallback project name when projectName is missing", async () => {
      const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
      const now = new Date("2026-06-25T09:00:00"); // Thursday = day 4
      vi.setSystemTime(now);

      const state: ExtensionTimerState = {
        projectId: "p1",
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

      const [, options] = getCreateMock().mock.calls[0];
      expect(options.message).toContain("ပရောဂျက်");
      expect(options.message).toContain("09:00");

      randomSpy.mockRestore();
    });
  });
});
