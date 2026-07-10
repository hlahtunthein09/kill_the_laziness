import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import {
  notifyScheduleDue,
  notifyDistractionBlocked,
  notifyFromPayload,
  nextId,
  withPermission,
  getIconUrl,
} from "../notifications";
import type { ExtensionTimerState } from "../types";
import type { FocusSessionSchedule } from "../../../lib/types";

interface FakeNotificationsWithPermission {
  getPermissionLevel(): Promise<string>;
}

function setNotificationPermissionLevel(level: string): void {
  (
    fakeBrowser.notifications as unknown as FakeNotificationsWithPermission
  ).getPermissionLevel = vi.fn().mockResolvedValue(level);
}

describe("notifications.ts", () => {
  beforeEach(() => {
    fakeBrowser.reset();
    fakeBrowser.runtime.getURL = (path: string) => `chrome-extension://test${path}`;
    fakeBrowser.notifications.create = vi.fn().mockResolvedValue("notification-id");
    fakeBrowser.alarms.create = vi.fn().mockResolvedValue(undefined);
    setNotificationPermissionLevel("granted");
    vi.clearAllMocks();
  });

  describe("getIconUrl", () => {
    it("returns the runtime icon URL", () => {
      expect(getIconUrl(fakeBrowser)).toBe("chrome-extension://test/icon/128.png");
    });

    it("returns undefined when runtime.getURL throws", () => {
      fakeBrowser.runtime.getURL = () => {
        throw new Error("runtime error");
      };
      expect(getIconUrl(fakeBrowser)).toBeUndefined();
    });
  });

  describe("nextId", () => {
    it("produces unique IDs for rapid calls", () => {
      const id1 = nextId("focus-milestone");
      const id2 = nextId("focus-milestone");
      expect(id1).not.toBe(id2);
      expect(id1.startsWith("focus-milestone-")).toBe(true);
      expect(id2.startsWith("focus-milestone-")).toBe(true);
    });
  });

  describe("withPermission", () => {
    it("runs the create callback when permission is granted", async () => {
      const create = vi.fn().mockResolvedValue(undefined);
      await withPermission(fakeBrowser, create);
      expect(create).toHaveBeenCalledTimes(1);
    });

    it("skips the create callback when permission is denied", async () => {
      setNotificationPermissionLevel("denied");
      const create = vi.fn().mockResolvedValue(undefined);
      await withPermission(fakeBrowser, create);
      expect(create).not.toHaveBeenCalled();
    });

    it("resolves without throwing when getPermissionLevel rejects", async () => {
      (
        fakeBrowser.notifications as unknown as FakeNotificationsWithPermission
      ).getPermissionLevel = vi.fn().mockRejectedValue(new Error("permission error"));
      const create = vi.fn().mockResolvedValue(undefined);
      await expect(withPermission(fakeBrowser, create)).resolves.toBeUndefined();
      expect(create).not.toHaveBeenCalled();
    });

    it("resolves without throwing when create rejects", async () => {
      const create = vi.fn().mockRejectedValue(new Error("create error"));
      await expect(withPermission(fakeBrowser, create)).resolves.toBeUndefined();
    });
  });

  describe("notifyFromPayload", () => {
    it("creates a basic notification from payload with correct persistence and auto-clear", async () => {
      const payload = { id: "focus-start-123", title: "စ_Start", message: "Start msg", priority: 2 };
      await notifyFromPayload(fakeBrowser, payload);
      const [id, options] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(id).toBe("focus-start-123");
      expect(options.requireInteraction).toBe(false);
      expect(fakeBrowser.alarms.create).toHaveBeenCalledTimes(1);

      fakeBrowser.notifications.create = vi.fn().mockResolvedValue("notification-id");
      fakeBrowser.alarms.create = vi.fn().mockResolvedValue(undefined);

      await notifyFromPayload(fakeBrowser, { id: "focus-complete-456", title: "Complete", message: "Done" });
      const [id2, options2] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(id2).toBe("focus-complete-456");
      expect(options2.requireInteraction).toBe(true);
      expect(fakeBrowser.alarms.create).not.toHaveBeenCalled();
    });
  });

  describe("notifyScheduleDue", () => {
    it("uses beginning message and includes project name and start time", async () => {
      const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
      const state: ExtensionTimerState = {
        projectId: "p1",
        projectName: "Morning Focus",
        projectElapsed: 0,
        subPieceRemaining: 0,
        isRunning: false,
        savedAt: Date.now(),
      };
      const schedule: FocusSessionSchedule = {
        id: "s1",
        projectId: "p1",
        dayOfWeek: 1,
        startTime: "09:00",
        durationMinutes: 25,
        enabled: true,
        createdAt: Date.now(),
      };

      await notifyScheduleDue(fakeBrowser, state, schedule);

      expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(1);
      const [id, options] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(id.startsWith("schedule-due-")).toBe(true);
      expect(options).toMatchObject({
        type: "basic",
        iconUrl: "chrome-extension://test/icon/128.png",
        title: "FocusFlow AI — စီစဉ်ထားသော focus အချိန် ရောက်ပါပြီ",
        message: "စတင်ကြည့်ရအောင်! — Let's get started! · Morning Focus · 09:00",
      });

      randomSpy.mockRestore();
    });

    it("uses fallback project name when projectName is missing", async () => {
      const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
      const state: ExtensionTimerState = {
        projectId: "p1",
        projectElapsed: 0,
        subPieceRemaining: 0,
        isRunning: false,
        savedAt: Date.now(),
      };
      const schedule: FocusSessionSchedule = {
        id: "s1",
        projectId: "p1",
        dayOfWeek: 1,
        startTime: "14:30",
        durationMinutes: 45,
        enabled: true,
        createdAt: Date.now(),
      };

      await notifyScheduleDue(fakeBrowser, state, schedule);

      const [, options] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(options.message).toContain("ပရောဂျက်");
      expect(options.message).toContain("14:30");

      randomSpy.mockRestore();
    });

    it("clamps negative durationMinutes to 0 and still creates a notification", async () => {
      const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
      const state: ExtensionTimerState = {
        projectId: "p1",
        projectName: "Negative Test",
        projectElapsed: 0,
        subPieceRemaining: 0,
        isRunning: false,
        savedAt: Date.now(),
      };
      const schedule: FocusSessionSchedule = {
        id: "s1",
        projectId: "p1",
        dayOfWeek: 1,
        startTime: "00:00",
        durationMinutes: -10,
        enabled: true,
        createdAt: Date.now(),
      };

      await notifyScheduleDue(fakeBrowser, state, schedule);

      expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(1);
      const [, options] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(options).toMatchObject({
        type: "basic",
        title: "FocusFlow AI — စီစဉ်ထားသော focus အချိန် ရောက်ပါပြီ",
        message: "စတင်ကြည့်ရအောင်! — Let's get started! · Negative Test · 00:00",
      });

      randomSpy.mockRestore();
    });
  });

  describe("notifyDistractionBlocked", () => {
    it("uses the fixed title and message", async () => {
      await notifyDistractionBlocked(fakeBrowser, "https://example.com/distraction");

      expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(1);
      const [id, options] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(id.startsWith("distraction-blocked-")).toBe(true);
      expect(options).toMatchObject({
        type: "basic",
        iconUrl: "chrome-extension://test/icon/128.png",
        title: "Distraction Blocked — Focus Protected",
        message:
          "Your time is valuable. We blocked a distracting site so you can stay focused.",
      });
    });

    it("resolves without throwing when permission is denied", async () => {
      setNotificationPermissionLevel("denied");

      await expect(
        notifyDistractionBlocked(fakeBrowser, "https://example.com/distraction"),
      ).resolves.toBeUndefined();
      expect(fakeBrowser.notifications.create).not.toHaveBeenCalled();
    });

    it("resolves without throwing when notifications.create rejects", async () => {
      fakeBrowser.notifications.create = vi.fn().mockRejectedValue(new Error("create failed"));

      await expect(
        notifyDistractionBlocked(fakeBrowser, "https://example.com/distraction"),
      ).resolves.toBeUndefined();
    });
  });

  describe("requireInteraction flag", () => {
    it("notifyScheduleDue sets requireInteraction to true", async () => {
      const state: ExtensionTimerState = {
        projectId: "p1",
        projectName: "Morning Focus",
        projectElapsed: 0,
        subPieceRemaining: 0,
        isRunning: false,
        savedAt: Date.now(),
      };
      const schedule: FocusSessionSchedule = {
        id: "s1",
        projectId: "p1",
        dayOfWeek: 1,
        startTime: "09:00",
        durationMinutes: 25,
        enabled: true,
        createdAt: Date.now(),
      };
      await notifyScheduleDue(fakeBrowser, state, schedule);
      const [, options] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(options.requireInteraction).toBe(true);
    });

    it("notifyDistractionBlocked sets requireInteraction to true", async () => {
      await notifyDistractionBlocked(fakeBrowser, "https://example.com/distraction");
      const [, options] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(options.requireInteraction).toBe(true);
    });
  });
});
