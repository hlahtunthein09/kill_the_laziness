import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import { startSession, pauseSession, resumeSession, resetSession, restoreOnStartup, setTimerEngineBrowserInstance } from "../timerEngine";
import { getStoredSession, setStoredSession } from "../sessionStorage";
import { buildNotificationSchedule, onFocusAlarm } from "../notificationEngine";
import type { ActiveSessionToken } from "../types";
import type { Browser } from "webextension-polyfill";

const baseToken = (overrides?: Partial<ActiveSessionToken>): ActiveSessionToken => ({
  projectId: "p1", projectName: "Project", mode: "project", targetTimeSeconds: 300,
  projectElapsedBaseline: 0, isRunning: true, startedAt: Date.now(), resumedAt: Date.now(), elapsedActiveSeconds: 0, ...overrides,
  sessionId: overrides?.sessionId ?? "abc12345",
});
const titles = () => (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[1].title as string);
const byName = async () => Object.fromEntries((await stageAlarms()).map((a) => [a.name, a]));
const stageAlarms = async () => (await fakeBrowser.alarms.getAll()).filter((a) => a.name?.startsWith("focus-"));
const browser = () => fakeBrowser as unknown as Browser;

describe("focus session integration", () => {
  let now: number;
  beforeEach(() => {
    fakeBrowser.reset();
    setTimerEngineBrowserInstance(fakeBrowser as unknown as import("webextension-polyfill").Browser);
    (fakeBrowser.notifications as any).getPermissionLevel = vi.fn().mockResolvedValue("granted");
    fakeBrowser.notifications.create = vi.fn().mockResolvedValue("notif-id") as any;
    now = 1_000_000; vi.spyOn(Date, "now").mockImplementation(() => now); vi.clearAllMocks();
  });

  it("1-minute session fires start, 1 milestone, almost, and complete once", async () => {
    const t = baseToken({ targetTimeSeconds: 60 }); await startSession(t);
    const sessionId = (await getStoredSession())!.token.sessionId;
    const schedule = buildNotificationSchedule(t); expect(schedule.milestoneTimes).toEqual([30]);
    const alarms = await byName();
    expect(alarms[`focus-${sessionId}-milestone-0-30`].scheduledTime).toBe(t.startedAt + 30_000);
    expect(alarms[`focus-${sessionId}-almost-49.5`].scheduledTime).toBe(t.startedAt + 49_500);
    expect(alarms[`focus-${sessionId}-complete-60`].scheduledTime).toBe(t.startedAt + 60_000);
    await onFocusAlarm(browser(), `focus-${sessionId}-milestone-0-30`);
    await onFocusAlarm(browser(), `focus-${sessionId}-almost-49.5`);
    const stored = await getStoredSession();
    stored!.token.elapsedActiveSeconds = 59;
    await setStoredSession(stored!);
    await onFocusAlarm(browser(), `focus-${sessionId}-complete-60`);
    expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(4);
    expect(titles().filter((x) => x.startsWith("စ_ milestone")).length).toBe(1);
    expect(titles().filter((x) => x.startsWith("စ_ အနီးရှိပြီ")).length).toBe(1);
    expect(titles().filter((x) => x.startsWith("စ_ session ပြီးစီး")).length).toBe(1);
    const s = await getStoredSession();
    expect(s?.trackers.startFired).toBe(true); expect(s?.trackers.milestoneTimesFired).toEqual([30]); expect(s?.trackers.almostDoneFired).toBe(true); expect(s?.trackers.completeFired).toBe(true);
  });

  it("5-minute session fires start, 2 milestones, almost, and complete once", async () => {
    const t = baseToken({ targetTimeSeconds: 300 }); await startSession(t);
    const sessionId = (await getStoredSession())!.token.sessionId;
    const schedule = buildNotificationSchedule(t); expect(schedule.milestoneTimes).toEqual([125, 175]);
    const alarms = await byName();
    expect(alarms[`focus-${sessionId}-milestone-0-125`].scheduledTime).toBe(t.startedAt + 125_000);
    expect(alarms[`focus-${sessionId}-milestone-1-175`].scheduledTime).toBe(t.startedAt + 175_000);
    expect(alarms[`focus-${sessionId}-almost-247.5`].scheduledTime).toBe(t.startedAt + 247_500);
    expect(alarms[`focus-${sessionId}-complete-300`].scheduledTime).toBe(t.startedAt + 300_000);
    await onFocusAlarm(browser(), `focus-${sessionId}-milestone-0-125`);
    await onFocusAlarm(browser(), `focus-${sessionId}-milestone-1-175`);
    await onFocusAlarm(browser(), `focus-${sessionId}-almost-247.5`);
    const stored = await getStoredSession();
    stored!.token.elapsedActiveSeconds = 299;
    await setStoredSession(stored!);
    await onFocusAlarm(browser(), `focus-${sessionId}-complete-300`);
    expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(5);
    expect(titles().filter((x) => x.startsWith("စ_ milestone")).length).toBe(2);
    expect(titles().filter((x) => x.startsWith("စ_ အနီးရှိပြီ")).length).toBe(1);
    expect(titles().filter((x) => x.startsWith("စ_ session ပြီးစီး")).length).toBe(1);
  });

  it("pause clears all focus-* alarms and resume recreates only remaining alarms using Date.now() + remaining", async () => {
    const t = baseToken({ targetTimeSeconds: 300 }); await startSession(t);
    const sessionId = (await getStoredSession())!.token.sessionId;
    (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mockClear();
    // Fire milestone-0 so we can prove it is not duplicated after resume.
    await onFocusAlarm(browser(), `focus-${sessionId}-milestone-0-125`);
    expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(1);
    now += 150_000; await pauseSession();
    // After pause there must be no focus-* alarms left.
    expect((await stageAlarms()).length).toBe(0);
    // Simulate a long idle wait (browser/computer sleep).
    now += 5 * 60 * 60 * 1000;
    await resumeSession();
    const resumedAt = now;
    const alarms = await byName();
    // Only unfired stages are recreated.
    expect(Object.keys(alarms).sort()).toEqual([
      `focus-${sessionId}-almost-247.5`,
      `focus-${sessionId}-complete-300`,
      `focus-${sessionId}-milestone-1-175`,
    ].sort());
    // Alarms use Date.now() + remaining active time, not startedAt + target.
    expect(alarms[`focus-${sessionId}-milestone-1-175`].scheduledTime).toBe(resumedAt + 25_000);
    expect(alarms[`focus-${sessionId}-almost-247.5`].scheduledTime).toBe(resumedAt + 97_500);
    expect(alarms[`focus-${sessionId}-complete-300`].scheduledTime).toBe(resumedAt + 150_000);
    // Already-fired milestone is a no-op after resume.
    await onFocusAlarm(browser(), `focus-${sessionId}-milestone-0-125`);
    expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(1);
    // Seed active elapsed near target so the complete alarm can fire.
    const stored = await getStoredSession();
    stored!.token.elapsedActiveSeconds = 299;
    await setStoredSession(stored!);
    // Fire remaining stages once, then again to prove no duplicates.
    for (const suffix of ["milestone-1-175", "almost-247.5", "complete-300"]) {
      await onFocusAlarm(browser(), `focus-${sessionId}-${suffix}`);
    }
    expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(4);
    for (const suffix of ["milestone-1-175", "almost-247.5", "complete-300"]) {
      await onFocusAlarm(browser(), `focus-${sessionId}-${suffix}`);
    }
    expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(4);
  });

  it("reset clears session and trackers so the next start is fresh", async () => {
    const t = baseToken({ targetTimeSeconds: 60 }); await startSession(t);
    const sessionId = (await getStoredSession())!.token.sessionId;
    await onFocusAlarm(browser(), `focus-${sessionId}-milestone-0-30`);
    await onFocusAlarm(browser(), `focus-${sessionId}-almost-49.5`);
    await onFocusAlarm(browser(), `focus-${sessionId}-complete-60`);
    await resetSession();
    expect(await getStoredSession()).toBeNull();
    expect((await stageAlarms()).length).toBe(0);
    now += 1000; const next = baseToken({ targetTimeSeconds: 60 }); (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mockClear();
    await startSession(next);
    expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(1);
    const c = (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(c[1].title).toBe("စ_Focus စတင်လိုက်ပြီ"); expect(c[0]).toBe(`focus-start-${next.startedAt}`);
    const s = await getStoredSession(); expect(s?.trackers.startFired).toBe(true); expect(s?.trackers.completeFired).toBe(false);
  });

  it("start → pause → resume → complete continues notifications once", async () => {
    const t = baseToken({ targetTimeSeconds: 60 }); await startSession(t);
    const sessionId = (await getStoredSession())!.token.sessionId;

    now += 20_000;
    await pauseSession();
    expect((await stageAlarms()).length).toBe(0);

    now += 60_000; // idle wait
    const resumedAt = now;
    await resumeSession();

    const alarms = await byName();
    expect(Object.keys(alarms).sort()).toEqual([
      `focus-${sessionId}-milestone-0-30`,
      `focus-${sessionId}-almost-49.5`,
      `focus-${sessionId}-complete-60`,
    ].sort());
    expect(alarms[`focus-${sessionId}-milestone-0-30`].scheduledTime).toBe(resumedAt + 10_000);

    (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mockClear();
    now += 10_000;
    await onFocusAlarm(browser(), `focus-${sessionId}-milestone-0-30`);
    now += 19_500;
    await onFocusAlarm(browser(), `focus-${sessionId}-almost-49.5`);
    now += 10_500;
    await onFocusAlarm(browser(), `focus-${sessionId}-complete-60`);

    expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(3);
    expect(titles().filter((x) => x.startsWith("စ_ milestone")).length).toBe(1);
    expect(titles().filter((x) => x.startsWith("စ_ အနီးရှိပြီ")).length).toBe(1);
    expect(titles().filter((x) => x.startsWith("စ_ session ပြီးစီး")).length).toBe(1);

    const s = await getStoredSession();
    expect(s?.trackers.completeFired).toBe(true);
    expect(s?.token.isRunning).toBe(false);
  });

  it("reset while paused destroys session and clears alarms", async () => {
    const t = baseToken({ targetTimeSeconds: 300 }); await startSession(t);
    const firstSessionId = (await getStoredSession())!.token.sessionId;
    now += 100_000;
    await pauseSession();
    await resetSession();
    expect(await getStoredSession()).toBeNull();
    expect((await stageAlarms()).length).toBe(0);

    now += 1_000;
    const next = baseToken({ targetTimeSeconds: 300 });
    await startSession(next);
    const s = await getStoredSession();
    expect(s?.token.sessionId).not.toBe(firstSessionId);
    expect(fakeBrowser.notifications.create).toHaveBeenCalledTimes(2); // first start + fresh start
  });

  it("old session alarm is ignored after reset and new start", async () => {
    const t = baseToken({ targetTimeSeconds: 60 }); await startSession(t);
    const oldSessionId = (await getStoredSession())!.token.sessionId;
    await resetSession();
    const next = baseToken({ targetTimeSeconds: 60 });
    now += 1_000;
    await startSession(next);

    (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mockClear();
    await onFocusAlarm(browser(), `focus-${oldSessionId}-complete-60`);
    expect(fakeBrowser.notifications.create).not.toHaveBeenCalled();
  });

  it("re-focus sub-piece uses remaining duration for schedule and notifications", async () => {
    const t = baseToken({
      mode: "sub-piece",
      subPieceId: "s1",
      subPieceName: "Sub-piece",
      targetTimeSeconds: 300,
      subPieceRemainingBaseline: 120,
    });
    await startSession(t);
    const sessionId = (await getStoredSession())!.token.sessionId;

    const schedule = buildNotificationSchedule(t);
    expect(schedule.completeTime).toBe(120);
    expect(schedule.milestoneTimes).toEqual([50, 70]);

    const alarms = await byName();
    expect(alarms[`focus-${sessionId}-complete-120`]).toBeDefined();
    expect(alarms[`focus-${sessionId}-complete-300`]).toBeUndefined();

    await onFocusAlarm(browser(), `focus-${sessionId}-milestone-0-50`);
    await onFocusAlarm(browser(), `focus-${sessionId}-milestone-1-70`);
    await onFocusAlarm(browser(), `focus-${sessionId}-almost-99`);

    const stored = await getStoredSession();
    stored!.token.elapsedActiveSeconds = 119;
    await setStoredSession(stored!);
    await onFocusAlarm(browser(), `focus-${sessionId}-complete-120`);

    expect(titles().filter((x) => x.startsWith("စ_ milestone")).length).toBe(2);
    expect(titles().filter((x) => x.startsWith("စ_ အနီးရှိပြီ")).length).toBe(1);
    expect(titles().filter((x) => x.startsWith("စ_ session ပြီးစီး")).length).toBe(1);
    expect((await getStoredSession())?.trackers.completeFired).toBe(true);
  });

  it("re-focus project uses remaining duration for schedule and notifications", async () => {
    const t = baseToken({ targetTimeSeconds: 300, projectElapsedBaseline: 180 });
    await startSession(t);
    const sessionId = (await getStoredSession())!.token.sessionId;

    const schedule = buildNotificationSchedule(t);
    expect(schedule.completeTime).toBe(120);
    expect(schedule.milestoneTimes).toEqual([50, 70]);

    const alarms = await byName();
    expect(alarms[`focus-${sessionId}-complete-120`]).toBeDefined();
    expect(alarms[`focus-${sessionId}-complete-300`]).toBeUndefined();

    await onFocusAlarm(browser(), `focus-${sessionId}-milestone-0-50`);
    await onFocusAlarm(browser(), `focus-${sessionId}-milestone-1-70`);
    await onFocusAlarm(browser(), `focus-${sessionId}-almost-99`);

    const stored = await getStoredSession();
    stored!.token.elapsedActiveSeconds = 119;
    await setStoredSession(stored!);
    await onFocusAlarm(browser(), `focus-${sessionId}-complete-120`);

    expect(titles().filter((x) => x.startsWith("စ_ milestone")).length).toBe(2);
    expect(titles().filter((x) => x.startsWith("စ_ အနီးရှိပြီ")).length).toBe(1);
    expect(titles().filter((x) => x.startsWith("စ_ session ပြီးစီး")).length).toBe(1);
    expect((await getStoredSession())?.trackers.completeFired).toBe(true);
  });

  it("extension restart restores a running session and recalculates remaining alarms", async () => {
    const t = baseToken({ targetTimeSeconds: 300 }); await startSession(t);
    const sessionId = (await getStoredSession())!.token.sessionId;

    now += 100_000;
    await pauseSession();
    const stored = await getStoredSession();
    stored!.token.isRunning = true;
    stored!.token.resumedAt = now - 50_000; // 50s of drift before restart
    await setStoredSession(stored!);

    // Simulate restart: wipe alarms but keep storage.
    for (const a of await fakeBrowser.alarms.getAll()) {
      if (a.name) await fakeBrowser.alarms.clear(a.name);
    }

    (fakeBrowser.notifications.create as ReturnType<typeof vi.fn>).mockClear();
    const restoredAt = now;
    await restoreOnStartup();

    const alarms = await byName();
    expect(Object.keys(alarms).sort()).toEqual([
      `focus-${sessionId}-milestone-1-175`,
      `focus-${sessionId}-almost-247.5`,
      `focus-${sessionId}-complete-300`,
    ].sort());
    expect(alarms[`focus-${sessionId}-milestone-1-175`].scheduledTime).toBe(restoredAt + 25_000);
    expect(alarms[`focus-${sessionId}-almost-247.5`].scheduledTime).toBe(restoredAt + 97_500);
    expect(alarms[`focus-${sessionId}-complete-300`].scheduledTime).toBe(restoredAt + 150_000);

    const s = await getStoredSession();
    expect(s?.token.elapsedActiveSeconds).toBeCloseTo(150, 1);
    expect(s?.token.resumedAt).toBe(restoredAt);
  });
});
