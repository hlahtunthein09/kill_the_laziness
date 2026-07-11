import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import { handleMessage, setMessageHandlerBrowserInstance, type TimerMessage } from "../messageHandler";
import * as timerEngine from "../timerEngine";

const validToken = {
  sessionId: "abc12345",
  projectId: "proj-1",
  mode: "sub-piece" as const,
  subPieceId: "sub-1",
  targetTimeSeconds: 3600,
  projectElapsedBaseline: 0,
  subPieceRemainingBaseline: 3600,
  isRunning: true,
  startedAt: 1,
  resumedAt: 1,
  elapsedActiveSeconds: 0,
};

const projectToken = {
  sessionId: "def67890",
  projectId: "proj-2",
  mode: "project" as const,
  targetTimeSeconds: 7200,
  projectElapsedBaseline: 120,
  isRunning: false,
  startedAt: 2,
  resumedAt: 2,
  elapsedActiveSeconds: 60,
};

describe("controlMessage", () => {
  beforeEach(() => {
    setMessageHandlerBrowserInstance(fakeBrowser);
    fakeBrowser.reset();
    vi.spyOn(fakeBrowser.storage.local, "set").mockResolvedValue(undefined);
    vi.clearAllMocks();
  });

  describe("SET_ACTIVE_SESSION", () => {
    it("validates token and calls timerEngine.startSession", async () => {
      const spy = vi.spyOn(timerEngine, "startSession").mockResolvedValue(undefined);
      const message: TimerMessage = { type: "SET_ACTIVE_SESSION", token: validToken };
      const result = await handleMessage(message);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(validToken);
      expect(result).toEqual({ ok: true });
      spy.mockRestore();
    });

    it("returns error for invalid token", async () => {
      const spy = vi.spyOn(timerEngine, "startSession").mockResolvedValue(undefined);
      const message = { type: "SET_ACTIVE_SESSION", token: { projectId: "proj-1" } } as unknown as TimerMessage;
      const result = await handleMessage(message);

      expect(spy).not.toHaveBeenCalled();
      expect(result).toEqual({ ok: false, error: "Invalid session token" });
      spy.mockRestore();
    });
  });

  describe("START_SESSION", () => {
    it("calls startSession with token when provided", async () => {
      const spy = vi.spyOn(timerEngine, "startSession").mockResolvedValue(undefined);
      const message: TimerMessage = { type: "START_SESSION", token: validToken };
      const result = await handleMessage(message);

      expect(spy).toHaveBeenCalledWith(validToken);
      expect(result).toEqual({ ok: true });
      spy.mockRestore();
    });

    it("calls startSession with undefined when token is omitted", async () => {
      const spy = vi.spyOn(timerEngine, "startSession").mockResolvedValue(undefined);
      const message: TimerMessage = { type: "START_SESSION" };
      const result = await handleMessage(message);

      expect(spy).toHaveBeenCalledWith(undefined);
      expect(result).toEqual({ ok: true });
      spy.mockRestore();
    });
  });

  describe("RESUME_SESSION", () => {
    it("calls timerEngine.resumeSession", async () => {
      const spy = vi.spyOn(timerEngine, "resumeSession").mockResolvedValue(undefined);
      const message: TimerMessage = { type: "RESUME_SESSION" };
      const result = await handleMessage(message);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true });
      spy.mockRestore();
    });
  });

  describe("PAUSE_SESSION", () => {
    it("calls timerEngine.pauseSession", async () => {
      const spy = vi.spyOn(timerEngine, "pauseSession").mockResolvedValue(undefined);
      const message: TimerMessage = { type: "PAUSE_SESSION" };
      const result = await handleMessage(message);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true });
      spy.mockRestore();
    });
  });

  describe("RESET_SESSION", () => {
    it("calls timerEngine.resetSession", async () => {
      const spy = vi.spyOn(timerEngine, "resetSession").mockResolvedValue(undefined);
      const message: TimerMessage = { type: "RESET_SESSION" };
      const result = await handleMessage(message);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true });
      spy.mockRestore();
    });
  });

  describe("UPDATE_SESSION", () => {
    it("validates token and calls timerEngine.updateSession", async () => {
      const spy = vi.spyOn(timerEngine, "updateSession").mockResolvedValue(undefined);
      const message: TimerMessage = { type: "UPDATE_SESSION", token: projectToken };
      const result = await handleMessage(message);

      expect(spy).toHaveBeenCalledWith(projectToken);
      expect(result).toEqual({ ok: true });
      spy.mockRestore();
    });

    it("returns error for invalid token", async () => {
      const spy = vi.spyOn(timerEngine, "updateSession").mockResolvedValue(undefined);
      const message = { type: "UPDATE_SESSION", token: "bad" } as unknown as TimerMessage;
      const result = await handleMessage(message);

      expect(spy).not.toHaveBeenCalled();
      expect(result).toEqual({ ok: false, error: "Invalid session token" });
      spy.mockRestore();
    });
  });

  describe("GET_ACTIVE_SESSION", () => {
    it("returns the active token from the engine", async () => {
      const spy = vi.spyOn(timerEngine, "getActiveSession").mockResolvedValue(validToken);
      const message: TimerMessage = { type: "GET_ACTIVE_SESSION" };
      const result = await handleMessage(message);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true, token: validToken });
      spy.mockRestore();
    });

    it("returns null token when no session is active", async () => {
      const spy = vi.spyOn(timerEngine, "getActiveSession").mockResolvedValue(null);
      const message: TimerMessage = { type: "GET_ACTIVE_SESSION" };
      const result = await handleMessage(message);

      expect(result).toEqual({ ok: true, token: null });
      spy.mockRestore();
    });
  });

  describe("SYNC_DISPLAY_STATE", () => {
    it("stores payload under ff_display_state and returns ok", async () => {
      const message: TimerMessage = {
        type: "SYNC_DISPLAY_STATE",
        payload: {
          projectName: "FocusFlow",
          subPieceName: "Piece 1",
          usedSeconds: 120,
          totalSeconds: 3600,
          isRunning: true,
          isCompleted: false,
        },
      };
      const result = await handleMessage(message);

      expect(fakeBrowser.storage.local.set).toHaveBeenCalledTimes(1);
      expect(fakeBrowser.storage.local.set).toHaveBeenCalledWith({
        ff_display_state: {
          projectName: "FocusFlow",
          subPieceName: "Piece 1",
          usedSeconds: 120,
          totalSeconds: 3600,
          isRunning: true,
          isCompleted: false,
        },
      });
      expect(result).toEqual({ ok: true });
    });

    it("returns error for invalid display state payload", async () => {
      const message = {
        type: "SYNC_DISPLAY_STATE",
        payload: { usedSeconds: "not-a-number" },
      } as unknown as TimerMessage;
      const result = await handleMessage(message);

      expect(fakeBrowser.storage.local.set).not.toHaveBeenCalled();
      expect(result).toEqual({ ok: false, error: "Invalid display state" });
    });
  });

  describe("unknown message", () => {
    it("returns error for unknown type", async () => {
      const message = { type: "UNKNOWN_TYPE" } as unknown as TimerMessage;
      const result = await handleMessage(message);

      expect(result).toEqual({ ok: false, error: "Unknown type" });
    });
  });

  describe("engine error", () => {
    it("returns { ok: false, error } when engine throws", async () => {
      const spy = vi.spyOn(timerEngine, "pauseSession").mockRejectedValue(new Error("pause failed"));
      const message: TimerMessage = { type: "PAUSE_SESSION" };
      const result = await handleMessage(message);

      expect(result).toEqual({ ok: false, error: "pause failed" });
      spy.mockRestore();
    });
  });
});
