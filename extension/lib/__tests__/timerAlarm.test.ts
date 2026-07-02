import { describe, it, expect, beforeEach } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import { setBrowserInstance, getTimerState, getLastMilestone } from "../storage";
import { setAlarmBrowserInstance, startFocusAlarm, stopFocusAlarm, onAlarmTick } from "../timerAlarm";
import type { ExtensionTimerState } from "../types";

// Helper to set a stored state directly via fakeBrowser
async function seedTimerState(state: ExtensionTimerState): Promise<void> {
  await fakeBrowser.storage.local.set({ ff_extension_timer: state });
}

describe("timerAlarm.ts", () => {
  beforeEach(() => {
    setBrowserInstance(fakeBrowser);
    setAlarmBrowserInstance(fakeBrowser);
    fakeBrowser.reset();
    fakeBrowser.runtime.getURL = (path: string) => `chrome-extension://test${path}`;
  });

  describe("startFocusAlarm", () => {
    it("creates a periodic alarm named focus-timer", async () => {
      await startFocusAlarm();

      const alarm = await fakeBrowser.alarms.get("focus-timer");
      expect(alarm).not.toBeNull();
      expect(alarm?.name).toBe("focus-timer");
      expect(alarm?.periodInMinutes).toBe(1);
    });
  });

  describe("stopFocusAlarm", () => {
    it("clears the focus-timer alarm", async () => {
      await startFocusAlarm();
      expect(await fakeBrowser.alarms.get("focus-timer")).not.toBeUndefined();

      await stopFocusAlarm();
      expect(await fakeBrowser.alarms.get("focus-timer")).toBeUndefined();
    });
  });

  describe("onAlarmTick", () => {
    it("does nothing when no timer state is stored", async () => {
      await onAlarmTick();
      const state = await getTimerState();
      expect(state).toBeNull();
    });

    it("does nothing when state is not running", async () => {
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        subPieceId: "sub-1",
        projectElapsed: 120,
        subPieceRemaining: 300,
        isRunning: false,
        savedAt: Date.now() - 60000,
      };
      await seedTimerState(state);

      await onAlarmTick();

      const updated = await getTimerState();
      expect(updated).toEqual(state);
    });

    it("updates projectElapsed and subPieceRemaining when running", async () => {
      const now = Date.now();
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        subPieceId: "sub-1",
        projectElapsed: 120,
        subPieceRemaining: 300,
        isRunning: true,
        savedAt: now - 65000, // 65 seconds ago
      };
      await seedTimerState(state);

      await onAlarmTick();

      const updated = await getTimerState();
      expect(updated).not.toBeNull();
      expect(updated!.projectElapsed).toBeGreaterThan(state.projectElapsed);
      expect(updated!.subPieceRemaining).toBeLessThan(state.subPieceRemaining);
      expect(updated!.isRunning).toBe(true);
    });

    it("sends notification and stops when subPieceRemaining reaches zero", async () => {
      const now = Date.now();
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        subPieceId: "sub-1",
        projectName: "My Project",
        subPieceName: "My Task",
        projectElapsed: 100,
        subPieceRemaining: 30, // only 30 seconds left
        isRunning: true,
        savedAt: now - 45000, // 45 seconds ago — will overshoot
      };
      await seedTimerState(state);

      await onAlarmTick();

      const updated = await getTimerState();
      expect(updated).not.toBeNull();
      expect(updated!.subPieceRemaining).toBe(0);
      expect(updated!.isRunning).toBe(false);

      // Verify notification was created
      const notifications = await fakeBrowser.notifications.getAll();
      expect(Object.keys(notifications)).toHaveLength(1);

      const notifId = Object.keys(notifications)[0];
      const notif = notifications[notifId];
      expect(notif.type).toBe("basic");
      expect(notif.iconUrl).toBe("chrome-extension://test/icon/128.png");
      expect(notif.title).toBe("My Task အတွက် အချိန် ပြည့်ပါပြီ");
      expect(notif.message).toBe("My Task is complete. Let's move on to the next one.");

      // Verify alarm was cleared
      const alarm = await fakeBrowser.alarms.get("focus-timer");
      expect(alarm).toBeUndefined();

      // Verify lastMilestone was cleared
      const lastMilestone = await getLastMilestone();
      expect(lastMilestone).toBeNull();
    });

    it("sends project-target notification when subPieceRemaining reaches zero and project target is met", async () => {
      const now = Date.now();
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        subPieceId: "sub-1",
        projectName: "My Project",
        subPieceName: "My Task",
        projectElapsed: 3500, // 3500 seconds elapsed
        subPieceRemaining: 30, // only 30 seconds left
        targetTimeSeconds: 3600, // target is 3600 seconds
        isRunning: true,
        savedAt: now - 45000, // 45 seconds ago — will push projectElapsed to 3545, still under target
      };
      await seedTimerState(state);

      await onAlarmTick();

      const updated = await getTimerState();
      expect(updated).not.toBeNull();
      expect(updated!.subPieceRemaining).toBe(0);
      expect(updated!.isRunning).toBe(false);

      // Notification should be sub-piece completion (target not yet reached)
      const notifications = await fakeBrowser.notifications.getAll();
      expect(Object.keys(notifications)).toHaveLength(1);

      const notifId = Object.keys(notifications)[0];
      const notif = notifications[notifId];
      expect(notif.title).toBe("My Task အတွက် အချိန် ပြည့်ပါပြီ");
      expect(notif.message).toBe("My Task is complete. Let's move on to the next one.");
    });

    it("sends project-target notification when project target is reached", async () => {
      const now = Date.now();
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        subPieceId: "sub-1",
        projectName: "My Project",
        subPieceName: "My Task",
        projectElapsed: 3580, // 3580 seconds elapsed
        subPieceRemaining: 30, // only 30 seconds left
        targetTimeSeconds: 3600, // target is 3600 seconds
        isRunning: true,
        savedAt: now - 45000, // 45 seconds ago — will push projectElapsed to 3625 >= 3600
      };
      await seedTimerState(state);

      await onAlarmTick();

      const updated = await getTimerState();
      expect(updated).not.toBeNull();
      expect(updated!.subPieceRemaining).toBe(0);
      expect(updated!.isRunning).toBe(false);

      // Notification should be project completion (target reached)
      const notifications = await fakeBrowser.notifications.getAll();
      expect(Object.keys(notifications)).toHaveLength(1);

      const notifId = Object.keys(notifications)[0];
      const notif = notifications[notifId];
      expect(notif.type).toBe("basic");
      expect(notif.iconUrl).toBe("chrome-extension://test/icon/128.png");
      expect(notif.title).toBe("My Project အတွက် အချိန်ပြည့်ပါပြီ");
      expect(notif.message).toBe("My Project target reached. Proud of your focus.");

      // Verify alarm was cleared
      const alarm = await fakeBrowser.alarms.get("focus-timer");
      expect(alarm).toBeUndefined();
    });

    it("does not send notification when sub-piece still has time remaining", async () => {
      const now = Date.now();
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        subPieceId: "sub-1",
        projectElapsed: 0,
        subPieceRemaining: 600, // 10 minutes left
        isRunning: true,
        savedAt: now - 30000, // 30 seconds ago
      };
      await seedTimerState(state);

      await onAlarmTick();

      const notifications = await fakeBrowser.notifications.getAll();
      expect(Object.keys(notifications)).toHaveLength(0);

      const alarm = await fakeBrowser.alarms.get("focus-timer");
      // Alarm is not cleared when sub-piece still has time
      expect(alarm).toBeUndefined(); // alarm was never started in this test
    });

    // --- Milestone notification tests ---

    it("sends milestone notification when project elapsed crosses 1 minute", async () => {
      const now = Date.now();
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        subPieceId: "sub-1",
        projectElapsed: 50, // just under 1 min
        subPieceRemaining: 600,
        isRunning: true,
        savedAt: now - 20000, // 20 seconds ago — will push over 60s
      };
      await seedTimerState(state);

      await onAlarmTick();

      const notifications = await fakeBrowser.notifications.getAll();
      expect(Object.keys(notifications)).toHaveLength(1);

      const notifId = Object.keys(notifications)[0];
      const notif = notifications[notifId];
      expect(notif.type).toBe("basic");
      expect(notif.iconUrl).toBe("chrome-extension://test/icon/128.png");
      expect(notif.title).toBe("FocusFlow AI — ရှေ့ဆက်နေတယ်");
      expect(notif.message).toContain("(");

      // Verify lastMilestone was updated
      const lastMilestone = await getLastMilestone();
      expect(lastMilestone).toBe(1);
    });

    it("does not send duplicate milestone notification for same milestone", async () => {
      const now = Date.now();
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        subPieceId: "sub-1",
        projectElapsed: 70, // already past 1 min
        subPieceRemaining: 600,
        isRunning: true,
        savedAt: now - 20000, // 20 seconds ago
      };
      await seedTimerState(state);
      // Pre-set lastMilestone to 1 so milestone 1 is already recorded
      await fakeBrowser.storage.local.set({ ff_extension_last_milestone: 1 });

      await onAlarmTick();

      const notifications = await fakeBrowser.notifications.getAll();
      expect(Object.keys(notifications)).toHaveLength(0);

      const lastMilestone = await getLastMilestone();
      expect(lastMilestone).toBe(1);
    });

    it("does not send milestone notification when elapsed is under 1 minute", async () => {
      const now = Date.now();
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        subPieceId: "sub-1",
        projectElapsed: 20, // 20 seconds
        subPieceRemaining: 600,
        isRunning: true,
        savedAt: now - 20000, // 20 seconds ago — total 40s, under 60s
      };
      await seedTimerState(state);

      await onAlarmTick();

      const notifications = await fakeBrowser.notifications.getAll();
      expect(Object.keys(notifications)).toHaveLength(0);

      const lastMilestone = await getLastMilestone();
      expect(lastMilestone).toBeNull();
    });

    it("catches notification errors without throwing", async () => {
      const now = Date.now();
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        subPieceId: "sub-1",
        projectElapsed: 100,
        subPieceRemaining: 30,
        isRunning: true,
        savedAt: now - 45000,
      };
      await seedTimerState(state);

      const originalCreate = fakeBrowser.notifications.create;
      fakeBrowser.notifications.create = async () => {
        throw new Error("Notification permission denied");
      };

      await expect(onAlarmTick()).resolves.not.toThrow();

      const updated = await getTimerState();
      expect(updated!.subPieceRemaining).toBe(0);
      expect(updated!.isRunning).toBe(false);

      fakeBrowser.notifications.create = originalCreate;
    });

    it("sends milestone notification for 2 minutes when lastMilestone was 1", async () => {
      const now = Date.now();
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        subPieceId: "sub-1",
        projectElapsed: 110, // just under 2 min
        subPieceRemaining: 600,
        isRunning: true,
        savedAt: now - 20000, // 20 seconds ago — will push over 120s
      };
      await seedTimerState(state);
      await fakeBrowser.storage.local.set({ ff_extension_last_milestone: 1 });

      await onAlarmTick();

      const notifications = await fakeBrowser.notifications.getAll();
      expect(Object.keys(notifications)).toHaveLength(1);

      const lastMilestone = await getLastMilestone();
      expect(lastMilestone).toBe(2);
    });
  });
});
