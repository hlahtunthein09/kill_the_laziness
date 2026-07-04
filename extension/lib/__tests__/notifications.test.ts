import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import {
  notifyMilestone,
  notifySessionComplete,
  notifyScheduleDue,
  notifyDistractionBlocked,
  notifyStart,
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

  describe("notifyMilestone", () => {
    it("creates a beginning-tier notification with deterministic message", async () => {
      const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

      await notifyMilestone(fakeBrowser, 30, 600);

      expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(1);
      const [id, options] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(id.startsWith("focus-milestone-")).toBe(true);
      expect(options).toMatchObject({
        type: "basic",
        iconUrl: "chrome-extension://test/icon/128.png",
        title: "စတင်ကြည့်ရအောင်!",
        message: "Let's get started!",
      });

      randomSpy.mockRestore();
    });

    it("creates a struggling-tier notification with deterministic message", async () => {
      const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

      await notifyMilestone(fakeBrowser, 400, 600);

      const [, options] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(options).toMatchObject({
        type: "basic",
        title: "အနည်းငယ်ပင်ပန်းနေပြီလား? အနားယူလိုက်ပါ",
        message: "Feeling stuck? Take a breath.",
      });

      randomSpy.mockRestore();
    });

    it("creates a succeeding-tier notification with deterministic message", async () => {
      const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

      await notifyMilestone(fakeBrowser, 150, 120);

      const [, options] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(options).toMatchObject({
        type: "basic",
        title: "ကောင်းလိုက်တာ! အရမ်းစဉ်းစားနေပြီ",
        message: "Great! You're in the zone.",
      });

      randomSpy.mockRestore();
    });

    it("creates a completing-tier notification with deterministic message", async () => {
      const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

      await notifyMilestone(fakeBrowser, 600, 30);

      const [, options] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(options).toMatchObject({
        type: "basic",
        title: "အနီးကပ်လာပြီ! နောက်တစ်လှမ်းသာ",
        message: "Almost there! One more step.",
      });

      randomSpy.mockRestore();
    });

    it("does not call create when permission is denied and resolves without throwing", async () => {
      setNotificationPermissionLevel("denied");

      await expect(notifyMilestone(fakeBrowser, 30, 600)).resolves.toBeUndefined();
      expect(fakeBrowser.notifications.create).not.toHaveBeenCalled();
    });

    it("resolves without throwing when notifications.create rejects", async () => {
      fakeBrowser.notifications.create = vi.fn().mockRejectedValue(new Error("create failed"));

      await expect(notifyMilestone(fakeBrowser, 30, 600)).resolves.toBeUndefined();
    });

    it("produces two different IDs for two rapid calls", async () => {
      await notifyMilestone(fakeBrowser, 30, 600);
      await notifyMilestone(fakeBrowser, 30, 600);

      expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(2);
      const [id1] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      const [id2] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[1];
      expect(id1).not.toBe(id2);
    });

    it("clamps negative elapsed and remaining values to 0 and still creates a notification", async () => {
      const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

      await notifyMilestone(fakeBrowser, -10, -5);

      expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(1);
      const [, options] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(options).toMatchObject({
        type: "basic",
        title: "စတင်ကြည့်ရအောင်!",
        message: "Let's get started!",
      });

      randomSpy.mockRestore();
    });
  });

  describe("notifyStart", () => {
    it("creates a beginning-tier notification with priority 2, correct iconUrl, and unique focus-start id when permission is granted", async () => {
      const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
      const state: ExtensionTimerState = {
        projectId: "p1",
        projectName: "Project Alpha",
        subPieceName: "Sub-piece One",
        projectElapsed: 0,
        subPieceRemaining: 1500,
        isRunning: false,
        savedAt: Date.now(),
      };

      await notifyStart(fakeBrowser, state);

      expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(1);
      const [id, options] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(id.startsWith("focus-start-")).toBe(true);
      expect(options).toMatchObject({
        type: "basic",
        iconUrl: "chrome-extension://test/icon/128.png",
        title: "စတင်ကြည့်ရအောင်!",
        message: "Let's get started!",
        priority: 2,
      });

      randomSpy.mockRestore();
    });

    it("does not call create when permission is denied and resolves without throwing", async () => {
      setNotificationPermissionLevel("denied");
      const state: ExtensionTimerState = {
        projectId: "p1",
        projectElapsed: 0,
        subPieceRemaining: 1500,
        isRunning: false,
        savedAt: Date.now(),
      };

      await expect(notifyStart(fakeBrowser, state)).resolves.toBeUndefined();
      expect(fakeBrowser.notifications.create).not.toHaveBeenCalled();
    });

    it("resolves without throwing when notifications.create rejects", async () => {
      fakeBrowser.notifications.create = vi.fn().mockRejectedValue(new Error("create failed"));
      const state: ExtensionTimerState = {
        projectId: "p1",
        projectElapsed: 0,
        subPieceRemaining: 1500,
        isRunning: false,
        savedAt: Date.now(),
      };

      await expect(notifyStart(fakeBrowser, state)).resolves.toBeUndefined();
    });
  });

  describe("notifySessionComplete", () => {
    it("uses sub-piece name and first completing message when targetReached is false", async () => {
      const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
      const state: ExtensionTimerState = {
        projectId: "p1",
        projectName: "Project Alpha",
        subPieceName: "Sub-piece One",
        projectElapsed: 1200,
        subPieceRemaining: 0,
        isRunning: false,
        savedAt: Date.now(),
      };

      await notifySessionComplete(fakeBrowser, state, false);

      expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(1);
      const [id, options] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(id.startsWith("session-complete-")).toBe(true);
      expect(options).toMatchObject({
        type: "basic",
        iconUrl: "chrome-extension://test/icon/128.png",
        title: "Sub-piece One အတွက် အချိန် ပြည့်ပါပြီ",
        message: "အနီးကပ်လာပြီ! နောက်တစ်လှမ်းသာ — Almost there! One more step.",
      });

      randomSpy.mockRestore();
    });

    it("uses project name and first completing message when targetReached is true", async () => {
      const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
      const state: ExtensionTimerState = {
        projectId: "p1",
        projectName: "Project Alpha",
        subPieceName: "Sub-piece One",
        projectElapsed: 3600,
        subPieceRemaining: 0,
        isRunning: false,
        savedAt: Date.now(),
      };

      await notifySessionComplete(fakeBrowser, state, true);

      const [, options] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(options).toMatchObject({
        type: "basic",
        title: "Project Alpha အတွက် အချိန် ပြည့်ပါပြီ",
        message: "အနီးကပ်လာပြီ! နောက်တစ်လှမ်းသာ — Almost there! One more step.",
      });

      randomSpy.mockRestore();
    });

    it("uses fallback names when projectName and subPieceName are missing", async () => {
      const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
      const state: ExtensionTimerState = {
        projectId: "p1",
        projectElapsed: 60,
        subPieceRemaining: 0,
        isRunning: false,
        savedAt: Date.now(),
      };

      await notifySessionComplete(fakeBrowser, state, false);
      const [, optionsSubPiece] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(optionsSubPiece.title).toBe("အထွေထွေ focus အတွက် အချိန် ပြည့်ပါပြီ");

      fakeBrowser.notifications.create = vi.fn().mockResolvedValue("notification-id");
      await notifySessionComplete(fakeBrowser, state, true);
      const [, optionsProject] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(optionsProject.title).toBe("ပရောဂျက် အတွက် အချိန် ပြည့်ပါပြီ");

      randomSpy.mockRestore();
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
    it("notifyMilestone sets requireInteraction to true", async () => {
      await notifyMilestone(fakeBrowser, 30, 600);
      const [, options] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(options.requireInteraction).toBe(true);
    });

    it("notifyStart sets requireInteraction to true", async () => {
      const state: ExtensionTimerState = {
        projectId: "p1",
        projectElapsed: 0,
        subPieceRemaining: 1500,
        isRunning: false,
        savedAt: Date.now(),
      };
      await notifyStart(fakeBrowser, state);
      const [, options] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(options.requireInteraction).toBe(true);
    });

    it("notifySessionComplete sets requireInteraction to true", async () => {
      const state: ExtensionTimerState = {
        projectId: "p1",
        projectName: "Project Alpha",
        subPieceName: "Sub-piece One",
        projectElapsed: 1200,
        subPieceRemaining: 0,
        isRunning: false,
        savedAt: Date.now(),
      };
      await notifySessionComplete(fakeBrowser, state, false);
      const [, options] = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(options.requireInteraction).toBe(true);
    });

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
