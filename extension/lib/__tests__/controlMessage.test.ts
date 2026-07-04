import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import { handleMessage, type TimerMessage } from "../messageHandler";
import { setBrowserInstance } from "../storage";
import * as timerEngine from "../timerEngine";

describe("controlMessage", () => {
  beforeEach(() => {
    fakeBrowser.reset();
    setBrowserInstance(fakeBrowser as unknown as typeof import("wxt/browser").browser);
    vi.clearAllMocks();
  });

  describe("START_TIMER", () => {
    it("validates payload and calls timerEngine.startSession", async () => {
      const spy = vi.spyOn(timerEngine, "startSession").mockResolvedValue(undefined);
      const state = {
        projectId: "proj-1",
        projectElapsed: 10,
        subPieceRemaining: 100,
        isRunning: true,
        savedAt: Date.now(),
      };

      const message: TimerMessage = { action: "START_TIMER", payload: state };
      const result = await handleMessage(message);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(state);
      expect(result).toEqual({ ok: true });
      spy.mockRestore();
    });

    it("returns error for invalid payload and does not call engine", async () => {
      const spy = vi.spyOn(timerEngine, "startSession").mockResolvedValue(undefined);
      const message = { action: "START_TIMER", payload: { projectId: "proj-1" } } as unknown as TimerMessage;
      const result = await handleMessage(message);

      expect(spy).not.toHaveBeenCalled();
      expect(result).toEqual({ ok: false, error: "Invalid timer state payload" });
      spy.mockRestore();
    });
  });

  describe("PAUSE_TIMER", () => {
    it("calls timerEngine.pauseSession", async () => {
      const spy = vi.spyOn(timerEngine, "pauseSession").mockResolvedValue(undefined);
      const message: TimerMessage = { action: "PAUSE_TIMER" };
      const result = await handleMessage(message);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true });
      spy.mockRestore();
    });
  });

  describe("RESET_TIMER", () => {
    it("calls timerEngine.resetSession", async () => {
      const spy = vi.spyOn(timerEngine, "resetSession").mockResolvedValue(undefined);
      const message: TimerMessage = { action: "RESET_TIMER" };
      const result = await handleMessage(message);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true });
      spy.mockRestore();
    });
  });

  describe("UPDATE_TIMER_STATE (backwards compatibility)", () => {
    it("still stores state and starts alarm when running", async () => {
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

    it("returns error for invalid payload", async () => {
      const message = { action: "UPDATE_TIMER_STATE", payload: { projectId: "proj-1" } } as unknown as TimerMessage;
      const result = await handleMessage(message);

      expect(result).toEqual({ ok: false, error: "Invalid timer state payload" });
    });
  });

  describe("GET_TIMER_STATE", () => {
    it("returns null when no state is stored", async () => {
      const message: TimerMessage = { action: "GET_TIMER_STATE" };
      const result = await handleMessage(message);

      expect(result).toBeNull();
    });
  });

  describe("unknown action", () => {
    it("returns error for unknown action", async () => {
      const message = { action: "UNKNOWN_ACTION" } as unknown as TimerMessage;
      const result = await handleMessage(message);

      expect(result).toEqual({ ok: false, error: "Unknown action" });
    });
  });
});
