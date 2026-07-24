import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import type { Browser } from "webextension-polyfill";
import {
  buildNotificationSchedule,
  getSessionDuration,
  scheduleNotifications,
  cancelNotifications,
  prepareStartPayload,
  prepareMilestonePayload,
  prepareAlmostPayload,
  prepareCompletePayload,
  onFocusAlarm,
  type NotificationPayload,
} from "../notificationEngine";
import type { StoredSession, SessionTrackers } from "../sessionStorage";
import { setStoredSession, setSessionBrowserInstance } from "../sessionStorage";
import type { ActiveSessionToken } from "../types";
import * as notifications from "../notifications";

function createToken(
  targetSeconds: number,
  mode: "sub-piece" | "project" = "sub-piece",
): ActiveSessionToken {
  return {
    sessionId: "abc12345",
    projectId: "proj-1",
    subPieceId: mode === "sub-piece" ? "sub-1" : undefined,
    projectName: "Test Project",
    subPieceName: mode === "sub-piece" ? "Test SubPiece" : undefined,
    mode,
    targetTimeSeconds: targetSeconds,
    projectElapsedBaseline: 0,
    subPieceRemainingBaseline: mode === "sub-piece" ? targetSeconds : undefined,
    isRunning: true,
    startedAt: 1000000,
    resumedAt: 1000000,
    elapsedActiveSeconds: 0,
  };
}

function createSession(
  token: ActiveSessionToken,
  trackers?: Partial<SessionTrackers>,
): StoredSession {
  return {
    token,
    trackers: {
      startFired: false,
      milestoneTimesFired: [],
      almostDoneFired: false,
      completeFired: false,
      ...trackers,
    },
  };
}

function assertShape(payload: NotificationPayload) {
  expect(payload.id).toBeTruthy();
  expect(payload.title).toBeTruthy();
  expect(payload.message).toBeTruthy();
}

describe("getSessionDuration", () => {
  it("sub-piece uses subPieceRemainingBaseline when present", () => {
    const token = createToken(1800, "sub-piece");
    token.subPieceRemainingBaseline = 1200;
    expect(getSessionDuration(token)).toBe(1200);
  });

  it("sub-piece falls back to targetTimeSeconds when baseline is missing", () => {
    const token = createToken(1800, "sub-piece");
    token.subPieceRemainingBaseline = undefined;
    expect(getSessionDuration(token)).toBe(1800);
  });

  it("project uses targetTimeSeconds minus projectElapsedBaseline", () => {
    const token = createToken(1000, "project");
    token.projectElapsedBaseline = 400;
    expect(getSessionDuration(token)).toBe(600);
  });

  it("project clamps duration to zero when baseline exceeds target", () => {
    const token = createToken(1000, "project");
    token.projectElapsedBaseline = 1200;
    expect(getSessionDuration(token)).toBe(0);
  });
});

describe("buildNotificationSchedule", () => {
  it("returns the expected schedule shape and exact times for a 5-minute session", () => {
    const schedule = buildNotificationSchedule(createToken(300));
    expect(schedule.startTime).toBe(0);
    expect(schedule.milestoneTimes).toEqual([125, 175]);
    expect(schedule.almostTime).toBe(247.5);
    expect(schedule.completeTime).toBe(300);
  });

  it("matches the duration bucket milestone count for a 5-minute session", () => {
    const schedule = buildNotificationSchedule(createToken(300));
    expect(schedule.milestoneTimes.length).toBe(2);
  });
});

describe("scheduleNotifications", () => {
  let now: number;
  beforeEach(() => {
    fakeBrowser.reset();
    now = Date.now();
    vi.spyOn(Date, "now").mockImplementation(() => now);
  });

  it("creates alarm names containing sessionId, type, and target elapsed", async () => {
    const token = createToken(300, "project");
    const session = createSession(token);
    const now = Date.now();
    await scheduleNotifications(fakeBrowser as unknown as Browser, session, 0);
    const alarms = await fakeBrowser.alarms.getAll();
    const names = alarms.map((a) => a.name).sort();
    expect(names).toEqual(
      [
        `focus-${token.sessionId}-complete-300`,
        `focus-${token.sessionId}-almost-247.5`,
        `focus-${token.sessionId}-milestone-0-125`,
        `focus-${token.sessionId}-milestone-1-175`,
      ].sort(),
    );
    const byName = Object.fromEntries(alarms.map((a) => [a.name, a]));
    expect(byName[`focus-${token.sessionId}-milestone-0-125`].scheduledTime).toBe(now + 125_000);
    expect(byName[`focus-${token.sessionId}-milestone-1-175`].scheduledTime).toBe(now + 175_000);
    expect(byName[`focus-${token.sessionId}-almost-247.5`].scheduledTime).toBe(now + 247_500);
    expect(byName[`focus-${token.sessionId}-complete-300`].scheduledTime).toBe(now + 300_000);
  });

  it("fresh project session (target 300s) creates correct milestone, almost, and complete alarms", async () => {
    const token = createToken(300, "project");
    const session = createSession(token);
    await scheduleNotifications(fakeBrowser as unknown as Browser, session, 0);
    const alarms = await fakeBrowser.alarms.getAll();
    const names = alarms.map((a) => a.name);
    expect(names).toContain(`focus-${token.sessionId}-milestone-0-125`);
    expect(names).toContain(`focus-${token.sessionId}-milestone-1-175`);
    expect(names).toContain(`focus-${token.sessionId}-almost-247.5`);
    expect(names).toContain(`focus-${token.sessionId}-complete-300`);
  });

  it("re-focus sub-piece uses subPieceRemainingBaseline as duration (complete at 1200s, not 1800s)", async () => {
    const token = createToken(1800, "sub-piece");
    token.subPieceRemainingBaseline = 1200;
    const session = createSession(token);
    await scheduleNotifications(fakeBrowser as unknown as Browser, session, 0);
    const alarms = await fakeBrowser.alarms.getAll();
    const names = alarms.map((a) => a.name);
    expect(names.some((n) => n.includes("-complete-1200"))).toBe(true);
    expect(names.some((n) => n.includes("-complete-1800"))).toBe(false);
  });

  it("re-focus project schedules complete at targetTimeSeconds minus projectElapsedBaseline", async () => {
    const token = createToken(1000, "project");
    token.projectElapsedBaseline = 400;
    const session = createSession(token);
    await scheduleNotifications(fakeBrowser as unknown as Browser, session, 0);
    const alarms = await fakeBrowser.alarms.getAll();
    const names = alarms.map((a) => a.name);
    expect(names.some((n) => n.includes("-complete-600"))).toBe(true);
    expect(names.some((n) => n.includes("-complete-1000"))).toBe(false);
  });

  it("skips already-fired milestones on reschedule", async () => {
    const token = createToken(300, "project");
    const session = createSession(token, { milestoneTimesFired: [125] });
    await scheduleNotifications(fakeBrowser as unknown as Browser, session, 0);
    const alarms = await fakeBrowser.alarms.getAll();
    const names = alarms.map((a) => a.name);
    expect(names).not.toContain(`focus-${token.sessionId}-milestone-0-125`);
    expect(names).toContain(`focus-${token.sessionId}-milestone-1-175`);
  });

  it("skips stages whose target elapsed is at or behind current elapsed time", async () => {
    const token = createToken(300, "project");
    const session = createSession(token);
    await scheduleNotifications(fakeBrowser as unknown as Browser, session, 125);
    const alarms = await fakeBrowser.alarms.getAll();
    const names = alarms.map((a) => a.name);
    expect(names).not.toContain(`focus-${token.sessionId}-milestone-0-125`);
    expect(names).toContain(`focus-${token.sessionId}-milestone-1-175`);
  });

  it("with elapsed=100 schedules remaining targets using Date.now() + remaining and skips passed targets", async () => {
    const token = createToken(300, "project");
    const session = createSession(token);
    await scheduleNotifications(fakeBrowser as unknown as Browser, session, 100);
    const alarms = await fakeBrowser.alarms.getAll();
    const byName = Object.fromEntries(alarms.map((a) => [a.name, a]));
    const now = Date.now();
    expect(byName[`focus-${token.sessionId}-milestone-0-125`].scheduledTime).toBe(now + 25_000);
    expect(byName[`focus-${token.sessionId}-milestone-1-175`].scheduledTime).toBe(now + 75_000);
    expect(byName[`focus-${token.sessionId}-almost-247.5`].scheduledTime).toBe(now + 147_500);
    expect(byName[`focus-${token.sessionId}-complete-300`].scheduledTime).toBe(now + 200_000);
    expect(Object.keys(byName).length).toBe(4);
  });
});

describe("cancelNotifications", () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it("clears every alarm whose name starts with focus- and leaves other alarms alone", async () => {
    await fakeBrowser.alarms.create("focus-abc-almost-10", { when: Date.now() + 1000 });
    await fakeBrowser.alarms.create("schedule-check", { periodInMinutes: 1 });
    await fakeBrowser.alarms.create("clear-notif-focus-start-123", { when: Date.now() + 2000 });
    await cancelNotifications(fakeBrowser as unknown as Browser);
    const names = (await fakeBrowser.alarms.getAll()).map((a) => a.name).sort();
    expect(names).toEqual(["clear-notif-focus-start-123", "schedule-check"]);
  });
});

describe("prepareStartPayload", () => {
  it("returns a payload with valid id and content from milestone bank", () => {
    const token = createToken(300);
    const payload = prepareStartPayload(token);
    assertShape(payload);
    expect(payload.id).toBe(`focus-start-${token.startedAt}`);
    expect(payload.priority).toBe(2);
  });
});

describe("prepareMilestonePayload", () => {
  it("returns a payload with valid id and content from milestone bank", () => {
    const token = createToken(300);
    const payload = prepareMilestonePayload(token, 125);
    assertShape(payload);
    expect(payload.id).toBe(`focus-milestone-${token.startedAt}-${Math.round(125 * 100)}`);
    expect(payload.priority).toBe(1);
  });
});

describe("prepareAlmostPayload", () => {
  it("returns a payload with valid id and content from milestone bank", () => {
    const token = createToken(300);
    const payload = prepareAlmostPayload(token);
    assertShape(payload);
    expect(payload.id).toBe(`focus-almost-${token.startedAt}`);
    expect(payload.priority).toBe(2);
  });
});

describe("prepareCompletePayload", () => {
  it("returns payloads with matching ids for the same token regardless of targetReached", () => {
    const token = createToken(300);
    const reached = prepareCompletePayload(token, true);
    const notReached = prepareCompletePayload(token, false);
    expect(reached.id).toBe(notReached.id);
  });

  it("returns a payload with valid id and content from milestone bank", () => {
    const token = createToken(300);
    const payload = prepareCompletePayload(token, true);
    assertShape(payload);
    expect(payload.id).toBe(`focus-complete-${token.startedAt}`);
    expect(payload.priority).toBe(2);
  });
});

describe("notification IDs", () => {
  it("are unique across stages and deterministic for the same token", () => {
    const token = createToken(300);
    const schedule = buildNotificationSchedule(token);
    const ids = new Set<string>();

    ids.add(prepareStartPayload(token).id);
    schedule.milestoneTimes.forEach((milestoneTime) => {
      ids.add(prepareMilestonePayload(token, milestoneTime).id);
    });
    ids.add(prepareAlmostPayload(token).id);
    ids.add(prepareCompletePayload(token, true).id);
    ids.add(prepareCompletePayload(token, false).id);

    // start + milestone count + almost + complete (one ID for both targetReached states)
    expect(ids.size).toBe(1 + schedule.milestoneTimes.length + 1 + 1);
    expect(prepareStartPayload(token).id).toBe(prepareStartPayload(token).id);
    expect(prepareMilestonePayload(token, 125).id).toBe(
      prepareMilestonePayload(token, 125).id,
    );
  });
});

describe("onFocusAlarm", () => {
  let notifyFromPayloadSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fakeBrowser.reset();
    setSessionBrowserInstance(fakeBrowser as unknown as Browser);
    (fakeBrowser.notifications as any).getPermissionLevel = vi.fn().mockResolvedValue("granted");
    (fakeBrowser.notifications as any).create = vi.fn().mockResolvedValue("notif-id");
    vi.clearAllMocks();
    notifyFromPayloadSpy = vi.spyOn(notifications, "notifyFromPayload").mockResolvedValue(undefined);
  });

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

  function createRunningSession(trackers?: Partial<SessionTrackers>): StoredSession {
    const token = baseToken();
    const session: StoredSession = {
      token,
      trackers: {
        startFired: true,
        milestoneTimesFired: [],
        almostDoneFired: false,
        completeFired: false,
        ...trackers,
      },
    };
    return session;
  }

  it("fires milestone notification and updates tracker", async () => {
    const session = createRunningSession();
    await setStoredSession(session);

    await onFocusAlarm(
      fakeBrowser as unknown as import("webextension-polyfill").Browser,
      `focus-${session.token.sessionId}-milestone-0-125`,
    );

    expect(notifyFromPayloadSpy).toHaveBeenCalledTimes(1);
    const payload = notifyFromPayloadSpy.mock.calls[0][1] as NotificationPayload;
    expect(payload.id.startsWith("focus-milestone-")).toBe(true);
    const stored = (await fakeBrowser.storage.local.get("ff_active_session_v2"))["ff_active_session_v2"] as StoredSession;
    expect(stored.trackers.milestoneTimesFired).toContain(125);
  });

  it("fires almost notification once", async () => {
    const session = createRunningSession();
    await setStoredSession(session);

    await onFocusAlarm(
      fakeBrowser as unknown as import("webextension-polyfill").Browser,
      `focus-${session.token.sessionId}-almost-247.5`,
    );

    expect(notifyFromPayloadSpy).toHaveBeenCalledTimes(1);
    const payload = notifyFromPayloadSpy.mock.calls[0][1] as NotificationPayload;
    expect(payload.id.startsWith("focus-almost-")).toBe(true);

    notifyFromPayloadSpy.mockClear();
    await onFocusAlarm(
      fakeBrowser as unknown as import("webextension-polyfill").Browser,
      `focus-${session.token.sessionId}-almost-247.5`,
    );
    expect(notifyFromPayloadSpy).not.toHaveBeenCalled();
  });

  it("fires complete notification once and sets isRunning = false", async () => {
    const session = createRunningSession();
    session.token.elapsedActiveSeconds = 299;
    await setStoredSession(session);

    await onFocusAlarm(
      fakeBrowser as unknown as import("webextension-polyfill").Browser,
      `focus-${session.token.sessionId}-complete-300`,
    );

    expect(notifyFromPayloadSpy).toHaveBeenCalledTimes(1);
    const payload = notifyFromPayloadSpy.mock.calls[0][1] as NotificationPayload;
    expect(payload.id.startsWith("focus-complete-")).toBe(true);
    const stored = (await fakeBrowser.storage.local.get("ff_active_session_v2"))["ff_active_session_v2"] as StoredSession;
    expect(stored.trackers.completeFired).toBe(true);
    expect(stored.token.isRunning).toBe(false);

    notifyFromPayloadSpy.mockClear();
    await onFocusAlarm(
      fakeBrowser as unknown as import("webextension-polyfill").Browser,
      `focus-${session.token.sessionId}-complete-300`,
    );
    expect(notifyFromPayloadSpy).not.toHaveBeenCalled();
  });

  it("complete alarm too early does not fire and does not stop session", async () => {
    const session = createRunningSession();
    session.token.elapsedActiveSeconds = 100;
    await setStoredSession(session);

    await onFocusAlarm(
      fakeBrowser as unknown as import("webextension-polyfill").Browser,
      `focus-${session.token.sessionId}-complete-300`,
    );

    expect(notifyFromPayloadSpy).not.toHaveBeenCalled();
    const stored = (await fakeBrowser.storage.local.get("ff_active_session_v2"))["ff_active_session_v2"] as StoredSession;
    expect(stored.trackers.completeFired).toBe(false);
    expect(stored.token.isRunning).toBe(true);
  });

  it("ignores alarm with different sessionId", async () => {
    const session = createRunningSession();
    await setStoredSession(session);

    await onFocusAlarm(
      fakeBrowser as unknown as import("webextension-polyfill").Browser,
      "focus-old-session-almost-247.5",
    );

    expect(notifyFromPayloadSpy).not.toHaveBeenCalled();
  });

  it("ignores alarm when session is paused", async () => {
    const session = createRunningSession();
    session.token.isRunning = false;
    await setStoredSession(session);

    await onFocusAlarm(
      fakeBrowser as unknown as import("webextension-polyfill").Browser,
      `focus-${session.token.sessionId}-milestone-0-125`,
    );

    expect(notifyFromPayloadSpy).not.toHaveBeenCalled();
  });

  it("ignores duplicate milestone alarm", async () => {
    const session = createRunningSession({ milestoneTimesFired: [125] });
    await setStoredSession(session);

    await onFocusAlarm(
      fakeBrowser as unknown as import("webextension-polyfill").Browser,
      `focus-${session.token.sessionId}-milestone-0-125`,
    );

    expect(notifyFromPayloadSpy).not.toHaveBeenCalled();
  });
});
