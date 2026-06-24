import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import { handleMessage, setControlBrowserInstance, type TimerMessage } from "../messageHandler";
import { setBrowserInstance } from "../storage";
import { setAlarmBrowserInstance } from "../timerAlarm";

describe("controlMessage — START_TIMER", () => {
  beforeEach(() => {
    fakeBrowser.reset();
    setControlBrowserInstance(fakeBrowser as unknown as typeof import("wxt/browser").browser);
    setBrowserInstance(fakeBrowser as unknown as typeof import("wxt/browser").browser);
    setAlarmBrowserInstance(fakeBrowser as unknown as typeof import("wxt/browser").browser);
    vi.clearAllMocks();
  });

  it("finds FocusFlow tab and sends EXT_START_TIMER", async () => {
    const sendMessageMock = vi.fn().mockResolvedValue(undefined);
    fakeBrowser.tabs.query = vi.fn().mockResolvedValue([
      { id: 42, url: "http://localhost:3000/timer" },
    ]);
    fakeBrowser.tabs.sendMessage = sendMessageMock;

    const message: TimerMessage = { action: "START_TIMER" };
    const result = await handleMessage(message);

    expect(fakeBrowser.tabs.query).toHaveBeenCalledTimes(1);
    expect(fakeBrowser.tabs.query).toHaveBeenCalledWith({ url: "http://localhost:3000/*" });
    expect(sendMessageMock).toHaveBeenCalledTimes(1);
    expect(sendMessageMock).toHaveBeenCalledWith(42, { action: "EXT_START_TIMER" });
    expect(result).toEqual({ ok: true, forwarded: true });
  });

  it("returns error when no FocusFlow tab exists", async () => {
    fakeBrowser.tabs.query = vi.fn().mockResolvedValue([]);

    const message: TimerMessage = { action: "START_TIMER" };
    const result = await handleMessage(message);

    expect(fakeBrowser.tabs.query).toHaveBeenCalledTimes(1);
    expect(fakeBrowser.tabs.query).toHaveBeenCalledWith({ url: "http://localhost:3000/*" });
    expect(result).toEqual({ ok: false, error: "No FocusFlow tab found" });
  });

  it("existing UPDATE_TIMER_STATE still works", async () => {
    const state = {
      projectId: "proj-1",
      projectElapsed: 120,
      subPieceRemaining: 300,
      isRunning: true,
      savedAt: Date.now(),
    };

    const message: TimerMessage = { action: "UPDATE_TIMER_STATE", payload: state };
    const result = await handleMessage(message);

    expect(result).toEqual({ ok: true });
  });
});

describe("controlMessage — PAUSE_TIMER", () => {
  beforeEach(() => {
    fakeBrowser.reset();
    setControlBrowserInstance(fakeBrowser as unknown as typeof import("wxt/browser").browser);
    setBrowserInstance(fakeBrowser as unknown as typeof import("wxt/browser").browser);
    setAlarmBrowserInstance(fakeBrowser as unknown as typeof import("wxt/browser").browser);
    vi.clearAllMocks();
  });

  it("finds FocusFlow tab and sends EXT_PAUSE_TIMER", async () => {
    const sendMessageMock = vi.fn().mockResolvedValue(undefined);
    fakeBrowser.tabs.query = vi.fn().mockResolvedValue([
      { id: 42, url: "http://localhost:3000/timer" },
    ]);
    fakeBrowser.tabs.sendMessage = sendMessageMock;

    const message: TimerMessage = { action: "PAUSE_TIMER" };
    const result = await handleMessage(message);

    expect(fakeBrowser.tabs.query).toHaveBeenCalledTimes(1);
    expect(fakeBrowser.tabs.query).toHaveBeenCalledWith({ url: "http://localhost:3000/*" });
    expect(sendMessageMock).toHaveBeenCalledTimes(1);
    expect(sendMessageMock).toHaveBeenCalledWith(42, { action: "EXT_PAUSE_TIMER" });
    expect(result).toEqual({ ok: true, forwarded: true });
  });

  it("returns error when no FocusFlow tab exists", async () => {
    fakeBrowser.tabs.query = vi.fn().mockResolvedValue([]);

    const message: TimerMessage = { action: "PAUSE_TIMER" };
    const result = await handleMessage(message);

    expect(fakeBrowser.tabs.query).toHaveBeenCalledTimes(1);
    expect(fakeBrowser.tabs.query).toHaveBeenCalledWith({ url: "http://localhost:3000/*" });
    expect(result).toEqual({ ok: false, error: "No FocusFlow tab found" });
  });
});

describe("controlMessage — RESET_TIMER", () => {
  beforeEach(() => {
    fakeBrowser.reset();
    setControlBrowserInstance(fakeBrowser as unknown as typeof import("wxt/browser").browser);
    setBrowserInstance(fakeBrowser as unknown as typeof import("wxt/browser").browser);
    setAlarmBrowserInstance(fakeBrowser as unknown as typeof import("wxt/browser").browser);
    vi.clearAllMocks();
  });

  it("finds FocusFlow tab and sends EXT_RESET_TIMER", async () => {
    const sendMessageMock = vi.fn().mockResolvedValue(undefined);
    fakeBrowser.tabs.query = vi.fn().mockResolvedValue([
      { id: 42, url: "http://localhost:3000/timer" },
    ]);
    fakeBrowser.tabs.sendMessage = sendMessageMock;

    const message: TimerMessage = { action: "RESET_TIMER" };
    const result = await handleMessage(message);

    expect(fakeBrowser.tabs.query).toHaveBeenCalledTimes(1);
    expect(fakeBrowser.tabs.query).toHaveBeenCalledWith({ url: "http://localhost:3000/*" });
    expect(sendMessageMock).toHaveBeenCalledTimes(1);
    expect(sendMessageMock).toHaveBeenCalledWith(42, { action: "EXT_RESET_TIMER" });
    expect(result).toEqual({ ok: true, forwarded: true });
  });

  it("returns error when no FocusFlow tab exists", async () => {
    fakeBrowser.tabs.query = vi.fn().mockResolvedValue([]);

    const message: TimerMessage = { action: "RESET_TIMER" };
    const result = await handleMessage(message);

    expect(fakeBrowser.tabs.query).toHaveBeenCalledTimes(1);
    expect(fakeBrowser.tabs.query).toHaveBeenCalledWith({ url: "http://localhost:3000/*" });
    expect(result).toEqual({ ok: false, error: "No FocusFlow tab found" });
  });
});
