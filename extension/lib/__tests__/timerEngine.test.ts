import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import {
  startSession,
  resumeSession,
  pauseSession,
  resetSession,
  updateSession,
  getSessionElapsed,
  getActiveSession,
  restoreOnStartup,
  setTimerEngineBrowserInstance,
} from "../timerEngine";
import { buildNotificationSchedule, type NotificationPayload } from "../notificationEngine";
import * as notifications from "./../notifications";
import type { ActiveSessionToken } from "../types";

interface StoredSessionData {
  token: ActiveSessionToken;
  trackers: {
    startFired: boolean;
    milestoneTimesFired: number[];
    almostDoneFired: boolean;
    completeFired: boolean;
  };
}

function baseToken(overrides?: Partial<ActiveSessionToken>): ActiveSessionToken {
  return {
    projectId: "proj-1",
    subPieceId: "sub-1",
    projectName: "Project",
    subPieceName: "Sub-piece",
    mode: "sub-piece",
    targetTimeSeconds: 300,
    projectElapsedBaseline: 0,
    subPieceRemainingBaseline: 300,
    isRunning: true,
    startedAt: Date.now(),
    resumedAt: Date.now(),
    elapsedActiveSeconds: 0,
    ...overrides,
    sessionId: overrides?.sessionId ?? "abc12345",
  };
}

describe("timerEngine", () => {
  let now: number;
  let notifyFromPayloadSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fakeBrowser.reset();
    setTimerEngineBrowserInstance(fakeBrowser as unknown as import("webextension-polyfill").Browser);
    (fakeBrowser.notifications as any).getPermissionLevel = vi.fn().mockResolvedValue("granted");
    (fakeBrowser.notifications as any).create = vi.fn().mockResolvedValue("notif-id");
    notifyFromPayloadSpy = vi.spyOn(notifications, "notifyFromPayload").mockResolvedValue(undefined);
    now = Date.now();
    vi.spyOn(Date, "now").mockImplementation(() => now);
    vi.clearAllMocks();
  });

  async function storedSession(): Promise<StoredSessionData | undefined> {
    const result = await fakeBrowser.storage.local.get("ff_active_session_v2");
    return result["ff_active_session_v2"] as StoredSessionData | undefined;
  }

  function advance(ms: number): void {
    now += ms;
  }

  it("startSession persists token, resets trackers, and fires start", async () => {
    await startSession(baseToken());
    const stored = await storedSession();
    expect(stored?.token.projectId).toBe("proj-1");
    expect(stored?.trackers).toEqual({
      startFired: true,
      milestoneTimesFired: [],
      almostDoneFired: false,
      completeFired: false,
    });
  });

  it("startSession stores a non-empty sessionId", async () => {
    await startSession(baseToken());
    const stored = await storedSession();
    expect(stored?.token.sessionId).toBeTruthy();
    expect(typeof stored?.token.sessionId).toBe("string");
    expect(stored?.token.sessionId.length).toBeGreaterThan(0);
  });

  it("startSession generates a different sessionId for each real start", async () => {
    await startSession(baseToken({ sessionId: "first-id" }));
    const first = (await storedSession())!.token.sessionId;
    await resetSession();
    await startSession(baseToken({ sessionId: "first-id" }));
    const second = (await storedSession())!.token.sessionId;
    expect(first).not.toBe(second);
  });

  it("pauseSession freezes sessionElapsed and preserves trackers", async () => {
    await startSession(baseToken());
    advance(5000);
    const before = await getSessionElapsed();
    expect(before).toBeCloseTo(5, 1);
    await pauseSession();
    const trackers = (await storedSession())!.trackers;
    advance(5000);
    const after = await getSessionElapsed();
    expect(after).toBeCloseTo(before, 1);
    expect(trackers.startFired).toBe(true);
  });

  it("resumeSession continues sessionElapsed and preserves trackers", async () => {
    await startSession(baseToken());
    advance(5000);
    await pauseSession();
    advance(3000);
    const pausedElapsed = await getSessionElapsed();
    expect(pausedElapsed).toBeCloseTo(5, 1);
    await resumeSession();
    advance(2000);
    expect(await getSessionElapsed()).toBeCloseTo(7, 1);
    const stored = await storedSession();
    expect(stored?.token.isRunning).toBe(true);
  });

  it("resetSession clears token and trackers", async () => {
    await startSession(baseToken());
    await resetSession();
    expect(await storedSession()).toBeUndefined();
    expect(await getActiveSession()).toBeNull();
  });

  it("updateSession preserves trackers for same project/sub-piece", async () => {
    await startSession(baseToken());
    const stored = await storedSession();
    stored!.trackers.startFired = true;
    stored!.trackers.milestoneTimesFired = [30];
    await fakeBrowser.storage.local.set({ "ff_active_session_v2": stored });
    await updateSession(baseToken({ targetTimeSeconds: 600 }));
    const updated = await storedSession();
    expect(updated?.token.targetTimeSeconds).toBe(600);
    expect(updated?.trackers.startFired).toBe(true);
    expect(updated?.trackers.milestoneTimesFired).toEqual([30]);
  });

  it("updateSession resets trackers when project changes", async () => {
    await startSession(baseToken());
    const stored = await storedSession();
    stored!.trackers.startFired = true;
    await fakeBrowser.storage.local.set({ "ff_active_session_v2": stored });
    await updateSession(baseToken({ projectId: "proj-2" }));
    const updated = await storedSession();
    expect(updated?.token.projectId).toBe("proj-2");
    expect(updated?.trackers.startFired).toBe(true);
  });

  it("updateSession resets trackers when sub-piece changes", async () => {
    await startSession(baseToken());
    const stored = await storedSession();
    stored!.trackers.startFired = true;
    await fakeBrowser.storage.local.set({ "ff_active_session_v2": stored });
    await updateSession(baseToken({ subPieceId: "sub-2" }));
    const updated = await storedSession();
    expect(updated?.token.subPieceId).toBe("sub-2");
    expect(updated?.trackers.startFired).toBe(true);
  });

  it("startSession creates per-stage alarms with absolute when timestamps", async () => {
    const token = baseToken({ targetTimeSeconds: 300 });
    await startSession(token);
    const stored = await storedSession();
    const alarms = await fakeBrowser.alarms.getAll();
    const byName = Object.fromEntries(alarms.map((a) => [a.name, a]));
    const sessionId = stored!.token.sessionId;
    expect(byName[`focus-${sessionId}-milestone-0-125`]).toBeDefined();
    expect(byName[`focus-${sessionId}-milestone-0-125`].scheduledTime).toBe(now + 125 * 1000);
    expect(byName[`focus-${sessionId}-milestone-1-175`].scheduledTime).toBe(now + 175 * 1000);
    expect(byName[`focus-${sessionId}-almost-247.5`].scheduledTime).toBe(now + 247.5 * 1000);
    expect(byName[`focus-${sessionId}-complete-300`].scheduledTime).toBe(now + 300 * 1000);
  });

  it("startSession fires Start notification exactly once", async () => {
    await startSession(baseToken());
    expect(notifyFromPayloadSpy).toHaveBeenCalledTimes(1);
    await pauseSession();
    await resumeSession();
    expect(notifyFromPayloadSpy).toHaveBeenCalledTimes(1);
  });

  it("pauseSession clears all stage alarms", async () => {
    await startSession(baseToken());
    const beforeNames = (await fakeBrowser.alarms.getAll()).map((a) => a.name);
    expect(beforeNames.some((n) => n?.startsWith("focus-"))).toBe(true);
    await pauseSession();
    const afterNames = (await fakeBrowser.alarms.getAll()).map((a) => a.name);
    expect(afterNames.some((n) => n?.startsWith("focus-"))).toBe(false);
  });

  it("resumeSession recreates only remaining unfired stage alarms using Date.now() + remaining", async () => {
    const token = baseToken({ targetTimeSeconds: 300 });
    await startSession(token);
    advance(130 * 1000);
    await pauseSession();
    advance(10 * 1000);
    const resumedAt = now;
    await resumeSession();
    const alarms = await fakeBrowser.alarms.getAll();
    const names = alarms.map((a) => a.name);
    const sessionId = (await storedSession())!.token.sessionId;
    expect(names).not.toContain(`focus-${sessionId}-milestone-0-125`);
    expect(names).toContain(`focus-${sessionId}-milestone-1-175`);
    expect(names).toContain(`focus-${sessionId}-almost-247.5`);
    expect(names).toContain(`focus-${sessionId}-complete-300`);

    const byName = Object.fromEntries(alarms.map((a) => [a.name, a]));
    expect(byName[`focus-${sessionId}-milestone-1-175`].scheduledTime).toBe(resumedAt + (175 - 130) * 1000);
    expect(byName[`focus-${sessionId}-almost-247.5`].scheduledTime).toBe(resumedAt + (247.5 - 130) * 1000);
    expect(byName[`focus-${sessionId}-complete-300`].scheduledTime).toBe(resumedAt + (300 - 130) * 1000);
  });

  it("5-hour pause then resume schedules alarms from remaining active time", async () => {
    const token = baseToken({ targetTimeSeconds: 300 });
    await startSession(token);
    advance(150 * 1000);
    await pauseSession();
    advance(5 * 60 * 60 * 1000); // 5 hours
    const resumedAt = now;
    await resumeSession();
    const alarms = await fakeBrowser.alarms.getAll();
    const sessionId = (await storedSession())!.token.sessionId;
    const byName = Object.fromEntries(alarms.map((a) => [a.name, a]));
    expect(byName[`focus-${sessionId}-milestone-1-175`].scheduledTime).toBe(resumedAt + (175 - 150) * 1000);
    expect(byName[`focus-${sessionId}-almost-247.5`].scheduledTime).toBe(resumedAt + (247.5 - 150) * 1000);
    expect(byName[`focus-${sessionId}-complete-300`].scheduledTime).toBe(resumedAt + (300 - 150) * 1000);
    expect(await getSessionElapsed()).toBeCloseTo(150, 1);
  });

  it("1000 pause/resume cycles produce no drift and correct alarm math", async () => {
    const token = baseToken({ targetTimeSeconds: 3600, subPieceRemainingBaseline: 3600 });
    await startSession(token);
    for (let i = 0; i < 1000; i++) {
      advance(1000); // 1s active
      await pauseSession();
      advance(2000); // 2s idle
      await resumeSession();
    }
    expect(await getSessionElapsed()).toBeCloseTo(1000, 1);
    const alarms = await fakeBrowser.alarms.getAll();
    const sessionId = (await storedSession())!.token.sessionId;
    const byName = Object.fromEntries(alarms.map((a) => [a.name, a]));
    const schedule = buildNotificationSchedule((await storedSession())!.token);
    const nextTarget = schedule.milestoneTimes.find((t) => t > 1000)!;
    expect(byName[`focus-${sessionId}-milestone-0-${nextTarget}`]).toBeDefined();
    expect(byName[`focus-${sessionId}-milestone-0-${nextTarget}`].scheduledTime).toBe(now + (nextTarget - 1000) * 1000);
  });

  it("browser sleep simulation recalculates alarms from remaining active time", async () => {
    const token = baseToken({ targetTimeSeconds: 300 });
    await startSession(token);
    advance(50 * 1000);
    await pauseSession();
    advance(2 * 60 * 60 * 1000); // 2 hours
    const resumedAt = now;
    await resumeSession();
    const alarms = await fakeBrowser.alarms.getAll();
    const sessionId = (await storedSession())!.token.sessionId;
    const byName = Object.fromEntries(alarms.map((a) => [a.name, a]));
    expect(byName[`focus-${sessionId}-milestone-0-125`].scheduledTime).toBe(resumedAt + (125 - 50) * 1000);
    expect(byName[`focus-${sessionId}-milestone-1-175`].scheduledTime).toBe(resumedAt + (175 - 50) * 1000);
    expect(byName[`focus-${sessionId}-almost-247.5`].scheduledTime).toBe(resumedAt + (247.5 - 50) * 1000);
    expect(byName[`focus-${sessionId}-complete-300`].scheduledTime).toBe(resumedAt + (300 - 50) * 1000);
  });

  it("milestone passed while paused is skipped on resume", async () => {
    const token = baseToken({ targetTimeSeconds: 300 });
    await startSession(token);
    advance(130 * 1000);
    await pauseSession();
    await resumeSession();
    const alarms = await fakeBrowser.alarms.getAll();
    const sessionId = (await storedSession())!.token.sessionId;
    const names = alarms.map((a) => a.name);
    expect(names).not.toContain(`focus-${sessionId}-milestone-0-125`);
    expect(names).toContain(`focus-${sessionId}-milestone-1-175`);
    expect(names).toContain(`focus-${sessionId}-almost-247.5`);
    expect(names).toContain(`focus-${sessionId}-complete-300`);
  });
});

describe("restoreOnStartup", () => {
  let now: number;
  let notifyFromPayloadSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    fakeBrowser.reset();
    setTimerEngineBrowserInstance(fakeBrowser as unknown as import("webextension-polyfill").Browser);
    (fakeBrowser.notifications as any).getPermissionLevel = vi.fn().mockResolvedValue("granted");
    (fakeBrowser.notifications as any).create = vi.fn().mockResolvedValue("notif-id");
    notifyFromPayloadSpy = vi.spyOn(notifications, "notifyFromPayload").mockResolvedValue(undefined);
    now = Date.now();
    vi.spyOn(Date, "now").mockImplementation(() => now);
    vi.clearAllMocks();
  });

  async function storedSession(): Promise<StoredSessionData | undefined> {
    const result = await fakeBrowser.storage.local.get("ff_active_session_v2");
    return result["ff_active_session_v2"] as StoredSessionData | undefined;
  }

  function trackers(overrides?: Partial<StoredSessionData["trackers"]>): StoredSessionData["trackers"] {
    return {
      startFired: true,
      milestoneTimesFired: [],
      almostDoneFired: false,
      completeFired: false,
      ...overrides,
    };
  }

  it("no stored session is a no-op", async () => {
    await restoreOnStartup();
    expect(notifyFromPayloadSpy).not.toHaveBeenCalled();
    expect(await fakeBrowser.alarms.getAll()).toEqual([]);
  });

  it("paused session is a no-op", async () => {
    const token = baseToken({ isRunning: false });
    await fakeBrowser.storage.local.set({ "ff_active_session_v2": { token, trackers: trackers() } });
    await restoreOnStartup();
    expect(notifyFromPayloadSpy).not.toHaveBeenCalled();
    const stored = await storedSession();
    expect(stored?.token.isRunning).toBe(false);
    expect(stored?.token.elapsedActiveSeconds).toBe(0);
  });

  it("running below target checkpoints drift and schedules remaining alarms", async () => {
    const token = baseToken({ targetTimeSeconds: 300, subPieceRemainingBaseline: 300, elapsedActiveSeconds: 100 });
    token.resumedAt = now - 50_000;
    await fakeBrowser.storage.local.set({ "ff_active_session_v2": { token, trackers: trackers() } });
    const restoredAt = now;

    await restoreOnStartup();

    const stored = await storedSession();
    expect(stored?.token.elapsedActiveSeconds).toBeCloseTo(150, 1);
    expect(stored?.token.resumedAt).toBe(restoredAt);
    expect(stored?.token.isRunning).toBe(true);

    const alarms = await fakeBrowser.alarms.getAll();
    const sessionId = stored!.token.sessionId;
    const byName = Object.fromEntries(alarms.map((a) => [a.name, a]));
    expect(byName[`focus-${sessionId}-milestone-0-125`]).toBeUndefined();
    expect(byName[`focus-${sessionId}-milestone-1-175`]).toBeDefined();
    expect(byName[`focus-${sessionId}-milestone-1-175`].scheduledTime).toBe(restoredAt + (175 - 150) * 1000);
    expect(byName[`focus-${sessionId}-almost-247.5`].scheduledTime).toBe(restoredAt + (247.5 - 150) * 1000);
    expect(byName[`focus-${sessionId}-complete-300`].scheduledTime).toBe(restoredAt + (300 - 150) * 1000);
  });

  it("target reached while closed fires complete once, stops session, and clears alarms", async () => {
    const token = baseToken({ targetTimeSeconds: 300, subPieceRemainingBaseline: 300 });
    token.resumedAt = now - 300_000;
    await fakeBrowser.storage.local.set({ "ff_active_session_v2": { token, trackers: trackers() } });
    await fakeBrowser.alarms.create(`focus-${token.sessionId}-complete-300`, { when: now + 1000 });

    await restoreOnStartup();

    expect(notifyFromPayloadSpy).toHaveBeenCalledTimes(1);
    const payload = notifyFromPayloadSpy.mock.calls[0][1] as NotificationPayload;
    expect(payload.id.startsWith("focus-complete-")).toBe(true);

    const stored = await storedSession();
    expect(stored?.token.isRunning).toBe(false);
    expect(stored?.trackers.completeFired).toBe(true);

    const alarms = await fakeBrowser.alarms.getAll();
    expect(alarms.some((a) => a.name?.startsWith("focus-"))).toBe(false);
  });

  it("drift above 60 minutes is capped and complete fires if target passed", async () => {
    const token = baseToken({ targetTimeSeconds: 1800, subPieceRemainingBaseline: 1800 });
    token.resumedAt = now - 2 * 60 * 60 * 1000;
    await fakeBrowser.storage.local.set({ "ff_active_session_v2": { token, trackers: trackers() } });

    await restoreOnStartup();

    expect(notifyFromPayloadSpy).toHaveBeenCalledTimes(1);
    const stored = await storedSession();
    expect(stored?.token.elapsedActiveSeconds).toBeCloseTo(3600, 1);
    expect(stored?.token.isRunning).toBe(false);
    expect(stored?.trackers.completeFired).toBe(true);
  });

  it("does not re-fire complete if already fired", async () => {
    const token = baseToken({ targetTimeSeconds: 300, subPieceRemainingBaseline: 300 });
    token.resumedAt = now - 300_000;
    await fakeBrowser.storage.local.set({
      "ff_active_session_v2": { token, trackers: trackers({ completeFired: true }) },
    });

    await restoreOnStartup();

    expect(notifyFromPayloadSpy).not.toHaveBeenCalled();
    const stored = await storedSession();
    expect(stored?.token.isRunning).toBe(false);
    expect(stored?.trackers.completeFired).toBe(true);
  });
});
