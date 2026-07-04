import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import { setBrowserInstance, getTimerState, getLastMilestone } from "../storage";
import {
  setTimerEngineBrowserInstance,
  startSession,
  pauseSession,
  resetSession,
  tick,
  restoreOnStartup,
  _resetTargetNotifiedRef,
} from "../timerEngine";
import type { ExtensionTimerState } from "../types";

async function seedTimerState(state: ExtensionTimerState): Promise<void> {
  await fakeBrowser.storage.local.set({ ff_extension_timer: state });
}

interface FakeNotificationsWithPermission {
  getPermissionLevel(): Promise<string>;
}

function setNotificationPermissionLevel(level: string): void {
  (
    fakeBrowser.notifications as unknown as FakeNotificationsWithPermission
  ).getPermissionLevel = vi.fn().mockResolvedValue(level);
}

describe("timerEngine.ts", () => {
  let sendMessageSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fakeBrowser.reset();
    setBrowserInstance(fakeBrowser);
    setTimerEngineBrowserInstance(fakeBrowser);
    _resetTargetNotifiedRef();
    fakeBrowser.runtime.getURL = (path: string) => `chrome-extension://test${path}`;
    fakeBrowser.runtime.sendMessage = vi.fn().mockResolvedValue(undefined);
    sendMessageSpy = vi.spyOn(fakeBrowser.runtime, "sendMessage");
    setNotificationPermissionLevel("granted");
    vi.clearAllMocks();
  });

  // --- Alarm lifecycle ---

  it("startSession stores state, sets isRunning=true, and creates both alarms", async () => {
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 0,
      subPieceRemaining: 1500,
      isRunning: false,
      savedAt: Date.now() - 1000,
    };

    await startSession(state);

    const stored = await getTimerState();
    expect(stored).not.toBeNull();
    expect(stored!.isRunning).toBe(true);
    expect(stored!.savedAt).toBeGreaterThanOrEqual(state.savedAt);

    const focusAlarm = await fakeBrowser.alarms.get("focus-timer");
    expect(focusAlarm).toBeDefined();
    expect(focusAlarm?.periodInMinutes).toBe(1);

    const keepAliveAlarm = await fakeBrowser.alarms.get("ff-keep-alive");
    expect(keepAliveAlarm).toBeDefined();
    expect(keepAliveAlarm?.periodInMinutes).toBe(4);
  });

  it("startSession when already running is idempotent (alarms recreated, state stays running)", async () => {
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 100,
      subPieceRemaining: 1400,
      isRunning: true,
      savedAt: Date.now(),
    };
    await seedTimerState(state);

    await startSession();
    await startSession();

    const stored = await getTimerState();
    expect(stored!.isRunning).toBe(true);

    const alarms = await fakeBrowser.alarms.getAll();
    const focusAlarms = alarms.filter((a) => a.name === "focus-timer");
    const keepAliveAlarms = alarms.filter((a) => a.name === "ff-keep-alive");
    expect(focusAlarms).toHaveLength(1);
    expect(keepAliveAlarms).toHaveLength(1);
  });

  it("startSession fires a native start notification with priority 2", async () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectName: "My Project",
      subPieceName: "My Task",
      projectElapsed: 0,
      subPieceRemaining: 1500,
      isRunning: false,
      savedAt: Date.now(),
    };

    await startSession(state);

    const notifications = await fakeBrowser.notifications.getAll();
    const entries = Object.entries(notifications);
    expect(entries).toHaveLength(1);

    const [notifId, notif] = entries[0];
    expect(notifId).toMatch(/^focus-start-/);
    expect(notif.type).toBe("basic");
    expect(notif.iconUrl).toBe("chrome-extension://test/icon/128.png");
    expect(notif.title).toBe("စတင်ကြည့်ရအောင်!");
    expect(notif.message).toBe("Let's get started!");
    expect(notif.priority).toBe(2);

    randomSpy.mockRestore();
  });

  it("pauseSession flushes drift, sets isRunning=false, and clears both alarms", async () => {
    const now = Date.now();
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 100,
      subPieceRemaining: 1400,
      isRunning: true,
      savedAt: now - 30000,
    };
    await seedTimerState(state);

    await pauseSession();

    const stored = await getTimerState();
    expect(stored!.isRunning).toBe(false);
    expect(stored!.projectElapsed).toBeGreaterThan(state.projectElapsed);
    expect(stored!.subPieceRemaining).toBeLessThan(state.subPieceRemaining);

    expect(await fakeBrowser.alarms.get("focus-timer")).toBeUndefined();
    expect(await fakeBrowser.alarms.get("ff-keep-alive")).toBeUndefined();
  });

  it("pauseSession when already paused is idempotent", async () => {
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 100,
      subPieceRemaining: 1400,
      isRunning: false,
      savedAt: Date.now(),
    };
    await seedTimerState(state);

    await pauseSession();

    const stored = await getTimerState();
    expect(stored!.isRunning).toBe(false);
    expect(stored!.projectElapsed).toBe(state.projectElapsed);
    expect(stored!.subPieceRemaining).toBe(state.subPieceRemaining);
    expect(await fakeBrowser.alarms.get("focus-timer")).toBeUndefined();
    expect(await fakeBrowser.alarms.get("ff-keep-alive")).toBeUndefined();
  });

  it("resetSession resets time, clears alarms, and clears milestone", async () => {
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      allocatedMinutes: 25,
      projectElapsed: 500,
      subPieceRemaining: 1000,
      isRunning: false,
      savedAt: Date.now(),
    };
    await seedTimerState(state);
    await fakeBrowser.storage.local.set({ ff_extension_last_milestone: 2 });

    await resetSession();

    const stored = await getTimerState();
    expect(stored!.isRunning).toBe(false);
    expect(stored!.projectElapsed).toBe(0);
    expect(stored!.subPieceRemaining).toBe(25 * 60);

    expect(await fakeBrowser.alarms.get("focus-timer")).toBeUndefined();
    expect(await fakeBrowser.alarms.get("ff-keep-alive")).toBeUndefined();
    expect(await getLastMilestone()).toBeNull();
  });

  it("resetSession when running stops first", async () => {
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      allocatedMinutes: 10,
      projectElapsed: 200,
      subPieceRemaining: 400,
      isRunning: true,
      savedAt: Date.now(),
    };
    await seedTimerState(state);

    await resetSession();

    const stored = await getTimerState();
    expect(stored!.isRunning).toBe(false);
    expect(stored!.projectElapsed).toBe(0);
    expect(stored!.subPieceRemaining).toBe(10 * 60);
    expect(await fakeBrowser.alarms.get("focus-timer")).toBeUndefined();
    expect(await fakeBrowser.alarms.get("ff-keep-alive")).toBeUndefined();
  });

  // --- Time advancement ---

  it("tick with 65s drift advances projectElapsed and reduces subPieceRemaining", async () => {
    const now = Date.now();
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 100,
      subPieceRemaining: 600,
      isRunning: true,
      savedAt: now - 65000,
    };
    await seedTimerState(state);

    await tick();

    const stored = await getTimerState();
    expect(stored!.projectElapsed).toBe(165);
    expect(stored!.subPieceRemaining).toBe(535);
    expect(stored!.isRunning).toBe(true);
  });

  it("tick with negative drift (savedAt in future) is a no-op", async () => {
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 100,
      subPieceRemaining: 600,
      isRunning: true,
      savedAt: Date.now() + 10000,
    };
    await seedTimerState(state);

    await tick();

    const stored = await getTimerState();
    expect(stored!.projectElapsed).toBe(100);
    expect(stored!.subPieceRemaining).toBe(600);
  });

  it("tick with 2h drift is capped to MAX_DRIFT_SECONDS", async () => {
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 100,
      subPieceRemaining: 7200,
      isRunning: true,
      savedAt: Date.now() - 7200 * 1000,
    };
    await seedTimerState(state);

    await tick();

    const stored = await getTimerState();
    expect(stored!.projectElapsed).toBe(100 + 3600);
    expect(stored!.subPieceRemaining).toBe(7200 - 3600);
  });

  it("tick called twice rapidly with same savedAt does not double-count", async () => {
    const now = Date.now();
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 100,
      subPieceRemaining: 600,
      isRunning: true,
      savedAt: now - 30000,
    };
    await seedTimerState(state);

    await tick();
    const first = await getTimerState();

    await tick();
    const second = await getTimerState();

    expect(second!.projectElapsed).toBe(first!.projectElapsed);
    expect(second!.subPieceRemaining).toBe(first!.subPieceRemaining);
  });

  it("tick allows project time to exceed targetTimeSeconds (target is a goal)", async () => {
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 3500,
      subPieceRemaining: 600,
      targetTimeSeconds: 3600,
      isRunning: true,
      savedAt: Date.now() - 200000,
    };
    await seedTimerState(state);

    await tick();

    const stored = await getTimerState();
    expect(stored!.projectElapsed).toBe(3700);
    expect(stored!.isRunning).toBe(true);
  });

  // --- Notifications ---

  it("sends sub-piece completion notification with correct title/message/iconUrl", async () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectName: "My Project",
      subPieceName: "My Task",
      projectElapsed: 100,
      subPieceRemaining: 30,
      isRunning: true,
      savedAt: Date.now() - 45000,
    };
    await seedTimerState(state);

    await tick();

    const stored = await getTimerState();
    expect(stored!.subPieceRemaining).toBe(0);
    expect(stored!.isRunning).toBe(false);

    const notifications = await fakeBrowser.notifications.getAll();
    expect(Object.keys(notifications)).toHaveLength(1);

    const [notifId, notif] = Object.entries(notifications)[0];
    expect(notifId).toMatch(/^session-complete-/);
    expect(notif.type).toBe("basic");
    expect(notif.iconUrl).toBe("chrome-extension://test/icon/128.png");
    expect(notif.title).toBe("My Task အတွက် အချိန် ပြည့်ပါပြီ");
    expect(notif.message).toBe(
      "အနီးကပ်လာပြီ! နောက်တစ်လှမ်းသာ — Almost there! One more step.",
    );

    expect(await fakeBrowser.alarms.get("focus-timer")).toBeUndefined();
    randomSpy.mockRestore();
  });

  it("sends project-target notification when target is reached and keeps running", async () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectName: "My Project",
      subPieceName: "My Task",
      projectElapsed: 3580,
      subPieceRemaining: 600,
      targetTimeSeconds: 3600,
      isRunning: true,
      savedAt: Date.now() - 45000,
    };
    await seedTimerState(state);

    await tick();

    const stored = await getTimerState();
    expect(stored!.projectElapsed).toBe(3625);
    expect(stored!.isRunning).toBe(true);

    const notifications = await fakeBrowser.notifications.getAll();
    expect(Object.keys(notifications)).toHaveLength(1);

    const [notifId, notif] = Object.entries(notifications)[0];
    expect(notifId).toMatch(/^session-complete-/);
    expect(notif.title).toBe("My Project အတွက် အချိန် ပြည့်ပါပြီ");
    expect(notif.message).toBe(
      "အနီးကပ်လာပြီ! နောက်တစ်လှမ်းသာ — Almost there! One more step.",
    );
    randomSpy.mockRestore();
  });

  it("target-reached message wins when both sub-piece completes and target is reached", async () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectName: "My Project",
      subPieceName: "My Task",
      projectElapsed: 3580,
      subPieceRemaining: 20,
      targetTimeSeconds: 3600,
      isRunning: true,
      savedAt: Date.now() - 45000,
    };
    await seedTimerState(state);

    await tick();

    const stored = await getTimerState();
    expect(stored!.subPieceRemaining).toBe(0);
    expect(stored!.projectElapsed).toBeGreaterThan(3600);
    // Sub-piece completion stops the session even though project is in overtime
    expect(stored!.isRunning).toBe(false);

    const notifications = await fakeBrowser.notifications.getAll();
    expect(Object.keys(notifications)).toHaveLength(1);

    const [notifId, notif] = Object.entries(notifications)[0];
    expect(notifId).toMatch(/^session-complete-/);
    expect(notif.title).toBe("My Project အတွက် အချိန် ပြည့်ပါပြီ");
    expect(notif.message).toBe(
      "အနီးကပ်လာပြီ! နောက်တစ်လှမ်းသာ — Almost there! One more step.",
    );
    randomSpy.mockRestore();
  });

  it("fires milestone notification when projectElapsed crosses 60s", async () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 50,
      subPieceRemaining: 600,
      isRunning: true,
      savedAt: Date.now() - 20000,
    };
    await seedTimerState(state);

    await tick();

    const notifications = await fakeBrowser.notifications.getAll();
    expect(Object.keys(notifications)).toHaveLength(1);

    const [notifId, notif] = Object.entries(notifications)[0];
    expect(notifId).toMatch(/^focus-milestone-/);
    expect(notif.type).toBe("basic");
    expect(notif.iconUrl).toBe("chrome-extension://test/icon/128.png");
    expect(notif.title).toBe("ကောင်းလိုက်တာ! အရမ်းစဉ်းစားနေပြီ");
    expect(notif.message).toBe("Great! You're in the zone.");

    expect(await getLastMilestone()).toBe(1);
    randomSpy.mockRestore();
  });

  it("does not fire duplicate milestone notification for the same milestone", async () => {
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 70,
      subPieceRemaining: 600,
      isRunning: true,
      savedAt: Date.now() - 20000,
    };
    await seedTimerState(state);
    await fakeBrowser.storage.local.set({ ff_extension_last_milestone: 1 });

    await tick();

    const notifications = await fakeBrowser.notifications.getAll();
    expect(Object.keys(notifications)).toHaveLength(0);
    expect(await getLastMilestone()).toBe(1);
  });

  it("jumping from 50s to 130s fires milestone 2 once and sets lastMilestone to 2", async () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 50,
      subPieceRemaining: 600,
      isRunning: true,
      savedAt: Date.now() - 80000,
    };
    await seedTimerState(state);

    await tick();

    const notifications = await fakeBrowser.notifications.getAll();
    expect(Object.keys(notifications)).toHaveLength(1);

    const [notifId, notif] = Object.entries(notifications)[0];
    expect(notifId).toMatch(/^focus-milestone-/);
    expect(notif.title).toBe("ကောင်းလိုက်တာ! အရမ်းစဉ်းစားနေပြီ");
    expect(notif.message).toBe("Great! You're in the zone.");

    const stored = await getTimerState();
    expect(stored!.projectElapsed).toBe(130);
    expect(await getLastMilestone()).toBe(2);
    randomSpy.mockRestore();
  });

  it("does not create notification when permission level is denied", async () => {
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 100,
      subPieceRemaining: 30,
      isRunning: true,
      savedAt: Date.now() - 45000,
    };
    await seedTimerState(state);
    setNotificationPermissionLevel("denied");

    await expect(tick()).resolves.not.toThrow();

    const stored = await getTimerState();
    expect(stored!.subPieceRemaining).toBe(0);
    expect(stored!.isRunning).toBe(false);

    const notifications = await fakeBrowser.notifications.getAll();
    expect(Object.keys(notifications)).toHaveLength(0);
  });

  it("still updates state when notifications.create throws", async () => {
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 100,
      subPieceRemaining: 30,
      isRunning: true,
      savedAt: Date.now() - 45000,
    };
    await seedTimerState(state);
    fakeBrowser.notifications.create = vi.fn().mockRejectedValue(new Error("create failed"));

    await expect(tick()).resolves.not.toThrow();

    const stored = await getTimerState();
    expect(stored!.subPieceRemaining).toBe(0);
    expect(stored!.isRunning).toBe(false);
  });

  // --- Startup recovery ---

  it("restoreOnStartup with running state recreates both alarms and calls tick", async () => {
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 100,
      subPieceRemaining: 600,
      isRunning: true,
      savedAt: Date.now() - 30000,
    };
    await seedTimerState(state);

    await restoreOnStartup();

    expect(await fakeBrowser.alarms.get("focus-timer")).toBeDefined();
    expect(await fakeBrowser.alarms.get("ff-keep-alive")).toBeDefined();

    const stored = await getTimerState();
    expect(stored!.projectElapsed).toBeGreaterThan(state.projectElapsed);
  });

  it("restoreOnStartup with paused state does not create alarms", async () => {
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 100,
      subPieceRemaining: 600,
      isRunning: false,
      savedAt: Date.now() - 30000,
    };
    await seedTimerState(state);

    await restoreOnStartup();

    expect(await fakeBrowser.alarms.get("focus-timer")).toBeUndefined();
    expect(await fakeBrowser.alarms.get("ff-keep-alive")).toBeUndefined();

    const stored = await getTimerState();
    expect(stored!.projectElapsed).toBe(state.projectElapsed);
  });

  it("restoreOnStartup with no state does nothing", async () => {
    await expect(restoreOnStartup()).resolves.toBeUndefined();
    expect(await fakeBrowser.alarms.get("focus-timer")).toBeUndefined();
    expect(await fakeBrowser.alarms.get("ff-keep-alive")).toBeUndefined();
  });

  it("restoreOnStartup caps drift for very old savedAt", async () => {
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 100,
      subPieceRemaining: 7200,
      isRunning: true,
      savedAt: Date.now() - 7200 * 1000,
    };
    await seedTimerState(state);

    await restoreOnStartup();

    const stored = await getTimerState();
    expect(stored!.projectElapsed).toBe(100 + 3600);
    expect(stored!.subPieceRemaining).toBe(7200 - 3600);
  });

  // --- State invariants ---

  it("maintains savedAt, non-negative projectElapsed and subPieceRemaining after every public method", async () => {
    let state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      allocatedMinutes: 25,
      projectElapsed: 0,
      subPieceRemaining: 1500,
      isRunning: false,
      savedAt: Date.now(),
    };

    await startSession(state);
    let stored = await getTimerState();
    expect(stored!.savedAt).toBeGreaterThan(0);
    expect(stored!.projectElapsed).toBeGreaterThanOrEqual(0);
    expect(stored!.subPieceRemaining).toBeGreaterThanOrEqual(0);

    await pauseSession();
    stored = await getTimerState();
    expect(stored!.savedAt).toBeGreaterThan(0);
    expect(stored!.projectElapsed).toBeGreaterThanOrEqual(0);
    expect(stored!.subPieceRemaining).toBeGreaterThanOrEqual(0);

    await resetSession();
    stored = await getTimerState();
    expect(stored!.savedAt).toBeGreaterThan(0);
    expect(stored!.projectElapsed).toBe(0);
    expect(stored!.subPieceRemaining).toBe(25 * 60);

    // Start again and tick
    state = { ...stored!, isRunning: false, savedAt: Date.now() };
    await startSession(state);
    await fakeBrowser.storage.local.set({
      ff_extension_timer: {
        ...(await getTimerState())!,
        savedAt: Date.now() - 65000,
      },
    });
    await tick();
    stored = await getTimerState();
    expect(stored!.savedAt).toBeGreaterThan(0);
    expect(stored!.projectElapsed).toBeGreaterThanOrEqual(0);
    expect(stored!.subPieceRemaining).toBeGreaterThanOrEqual(0);

    // Restore
    await fakeBrowser.storage.local.set({
      ff_extension_timer: { ...stored!, isRunning: true, savedAt: Date.now() - 10000 },
    });
    await restoreOnStartup();
    stored = await getTimerState();
    expect(stored!.savedAt).toBeGreaterThan(0);
    expect(stored!.projectElapsed).toBeGreaterThanOrEqual(0);
    expect(stored!.subPieceRemaining).toBeGreaterThanOrEqual(0);
  });

  it("isRunning is never true when subPieceRemaining is 0", async () => {
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 3580,
      subPieceRemaining: 20,
      targetTimeSeconds: 7200,
      isRunning: true,
      savedAt: Date.now() - 45000,
    };
    await seedTimerState(state);

    await tick();

    const stored = await getTimerState();
    expect(stored!.isRunning).toBe(false);
    expect(stored!.subPieceRemaining).toBe(0);
  });

  // --- STATE_UPDATED broadcast ---

  it("broadcasts STATE_UPDATED after startSession", async () => {
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 0,
      subPieceRemaining: 1500,
      isRunning: false,
      savedAt: Date.now(),
    };

    await startSession(state);

    expect(sendMessageSpy).toHaveBeenCalledWith({
      action: "STATE_UPDATED",
      payload: expect.objectContaining({
        projectId: "proj-1",
        isRunning: true,
      }),
    });
  });

  it("broadcasts STATE_UPDATED after pauseSession", async () => {
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 100,
      subPieceRemaining: 1400,
      isRunning: true,
      savedAt: Date.now() - 30000,
    };
    await seedTimerState(state);

    await pauseSession();

    expect(sendMessageSpy).toHaveBeenLastCalledWith({
      action: "STATE_UPDATED",
      payload: expect.objectContaining({
        projectId: "proj-1",
        isRunning: false,
      }),
    });
  });

  it("broadcasts STATE_UPDATED after resetSession", async () => {
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      allocatedMinutes: 25,
      projectElapsed: 500,
      subPieceRemaining: 1000,
      isRunning: true,
      savedAt: Date.now(),
    };
    await seedTimerState(state);

    await resetSession();

    expect(sendMessageSpy).toHaveBeenLastCalledWith({
      action: "STATE_UPDATED",
      payload: expect.objectContaining({
        projectId: "proj-1",
        projectElapsed: 0,
        subPieceRemaining: 25 * 60,
        isRunning: false,
      }),
    });
  });

  it("broadcasts STATE_UPDATED after tick", async () => {
    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 100,
      subPieceRemaining: 600,
      isRunning: true,
      savedAt: Date.now() - 65000,
    };
    await seedTimerState(state);

    await tick();

    expect(sendMessageSpy).toHaveBeenLastCalledWith({
      action: "STATE_UPDATED",
      payload: expect.objectContaining({
        projectId: "proj-1",
        projectElapsed: 165,
        subPieceRemaining: 535,
      }),
    });
  });

  it("does not break engine when STATE_UPDATED broadcast fails", async () => {
    sendMessageSpy.mockRejectedValue(new Error("no listener"));

    const state: ExtensionTimerState = {
      projectId: "proj-1",
      subPieceId: "sub-1",
      projectElapsed: 0,
      subPieceRemaining: 1500,
      isRunning: false,
      savedAt: Date.now(),
    };

    await expect(startSession(state)).resolves.not.toThrow();

    const stored = await getTimerState();
    expect(stored!.isRunning).toBe(true);
  });
});
