import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import { setBrowserInstance } from "../storage";
import { setScheduleAlarmBrowserInstance } from "../scheduleAlarm";
import * as messageHandler from "../messageHandler";
import * as timerEngine from "../timerEngine";
import type { ActiveSessionToken } from "../types";

vi.hoisted(() => {
  const fakeBrowser = require("@webext-core/fake-browser").fakeBrowser;
  fakeBrowser.runtime.id = "test-extension-id";
  (globalThis as any).browser = fakeBrowser;
});

const token: ActiveSessionToken = {
  sessionId: "abc12345",
  projectId: "proj-1",
  subPieceId: "sub-1",
  mode: "sub-piece",
  targetTimeSeconds: 3600,
  projectElapsedBaseline: 0,
  subPieceRemainingBaseline: 3600,
  isRunning: true,
  startedAt: 1,
  resumedAt: 1,
  elapsedActiveSeconds: 0,
};

describe("background.ts handleMessage", () => {
  beforeEach(() => {
    setBrowserInstance(fakeBrowser);
    fakeBrowser.reset();
    fakeBrowser.notifications.clear = vi.fn().mockResolvedValue(true);
    vi.clearAllMocks();
  });

  it("routes SET_ACTIVE_SESSION to timerEngine.startSession", async () => {
    const spy = vi.spyOn(timerEngine, "startSession").mockResolvedValue(undefined);

    const result = await messageHandler.handleMessage({ type: "SET_ACTIVE_SESSION", token });

    expect(result).toEqual({ ok: true });
    expect(spy).toHaveBeenCalledWith(token);
    spy.mockRestore();
  });

  it("rejects SET_ACTIVE_SESSION with invalid token", async () => {
    const spy = vi.spyOn(timerEngine, "startSession").mockResolvedValue(undefined);
    const message = {
      type: "SET_ACTIVE_SESSION",
      token: { projectId: "proj-1" },
    } as unknown as messageHandler.TimerMessage;

    const result = await messageHandler.handleMessage(message);

    expect(spy).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: false, error: "Invalid session token" });
    spy.mockRestore();
  });

  it("returns null token for GET_ACTIVE_SESSION when nothing is stored", async () => {
    const spy = vi.spyOn(timerEngine, "getActiveSession").mockResolvedValue(null);

    const result = await messageHandler.handleMessage({ type: "GET_ACTIVE_SESSION" });

    expect(result).toEqual({ ok: true, token: null });
    spy.mockRestore();
  });

  it("returns active token for GET_ACTIVE_SESSION", async () => {
    const spy = vi.spyOn(timerEngine, "getActiveSession").mockResolvedValue(token);

    const result = await messageHandler.handleMessage({ type: "GET_ACTIVE_SESSION" });

    expect(result).toEqual({ ok: true, token });
    spy.mockRestore();
  });

  it("returns error for unknown type", async () => {
    const message = { type: "UNKNOWN_ACTION" } as unknown as messageHandler.TimerMessage;

    const result = await messageHandler.handleMessage(message);

    expect(result).toEqual({ ok: false, error: "Unknown type" });
  });
});

describe("background.ts service worker", () => {
  let mod: typeof import("../../entrypoints/background");

  beforeAll(async () => {
    (globalThis as unknown as { defineBackground?: (fn: () => void) => { main: () => void } }).defineBackground = (
      fn: () => void,
    ) => ({ main: fn });
    mod = await import("../../entrypoints/background");
  });

  beforeEach(() => {
    setBrowserInstance(fakeBrowser);
    setScheduleAlarmBrowserInstance(fakeBrowser);
    mod.setBackgroundBrowserInstance(fakeBrowser);
    fakeBrowser.reset();
    fakeBrowser.notifications.clear = vi.fn().mockResolvedValue(true);
    vi.clearAllMocks();
  });

  it("calls restoreOnStartup on init", () => {
    const spy = vi.fn().mockResolvedValue(undefined);
    mod.setBackgroundRestoreOnStartup(spy);

    mod.default.main();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("routes runtime.onMessage to handleMessage", async () => {
    const message = { type: "GET_ACTIVE_SESSION" };
    const handler = vi.fn().mockResolvedValue({ ok: true });
    mod.setBackgroundMessageHandler(handler);

    mod.default.main();
    await fakeBrowser.runtime.onMessage.trigger(message, { id: "test-extension-id" } as any);

    expect(handler).toHaveBeenCalledWith(message);
  });

  it("routes focus-* alarm to notificationEngine.onFocusAlarm", async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    mod.setBackgroundFocusAlarmHandler(handler);

    mod.default.main();
    await fakeBrowser.alarms.onAlarm.trigger({ name: "focus-abc12345-milestone-0-125" } as any);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(fakeBrowser, "focus-abc12345-milestone-0-125");
  });

  it("clears notifications when a clear-notif-* alarm fires", async () => {
    mod.default.main();
    await fakeBrowser.alarms.onAlarm.trigger({ name: "clear-notif-focus-start-123" } as any);

    expect(fakeBrowser.notifications.clear).toHaveBeenCalledTimes(1);
    expect(fakeBrowser.notifications.clear).toHaveBeenCalledWith("focus-start-123");
  });
});
