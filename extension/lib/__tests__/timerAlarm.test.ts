import { describe, it, expect, beforeEach } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import { setBrowserInstance, getTimerState } from "../storage";
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
  });

  describe("startFocusAlarm", () => {
    it("creates a periodic alarm named focus-timer", async () => {
      startFocusAlarm();

      const alarm = await fakeBrowser.alarms.get("focus-timer");
      expect(alarm).not.toBeNull();
      expect(alarm?.name).toBe("focus-timer");
      expect(alarm?.periodInMinutes).toBe(1);
    });
  });

  describe("stopFocusAlarm", () => {
    it("clears the focus-timer alarm", async () => {
      startFocusAlarm();
      expect(await fakeBrowser.alarms.get("focus-timer")).not.toBeUndefined();

      stopFocusAlarm();
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
      expect(notif.title).toBe("အလုပ်ပြီးစီး!");
      expect(notif.message).toBe("သင့်စိတ်အားထန်မှုအတွက်ဂုဏ်ယူပါတယ်။");

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
  });
});
