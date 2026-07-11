import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import { setSettingsBrowserInstance } from "../settingsSync";
import {
  setFocusSyncBrowserInstance,
  syncExtensionSettings,
  readWebAppSession,
  buildDisplayState,
  startFocusSyncPolling,
  resetDisplayStateSync,
  type WebAppSession,
} from "../focusSync";

const STORE_KEY = "ff_focus_store";
const SESSION_KEY = "ff_active_session";

describe("focusSync.ts", () => {
  beforeEach(() => {
    setFocusSyncBrowserInstance(fakeBrowser);
    setSettingsBrowserInstance(fakeBrowser);
    resetDisplayStateSync();
    fakeBrowser.reset();
    vi.spyOn(fakeBrowser.storage.local, "set").mockResolvedValue(undefined);
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("syncExtensionSettings", () => {
    it("reads ff_focus_store and writes settings to extension storage", async () => {
      const store = {
        state: {},
        settings: {
          strictMode: true,
          forbiddenUrls: ["youtube.com/shorts", "tiktok.com"],
        },
      };
      localStorage.setItem(STORE_KEY, JSON.stringify(store));

      await syncExtensionSettings();

      expect(fakeBrowser.storage.local.set).toHaveBeenCalledTimes(1);
      expect(fakeBrowser.storage.local.set).toHaveBeenCalledWith({
        ff_extension_settings: {
          strictMode: true,
          forbiddenUrls: ["youtube.com/shorts", "tiktok.com"],
        },
      });
    });

    it("does not write settings when ff_focus_store is missing", async () => {
      await syncExtensionSettings();
      expect(fakeBrowser.storage.local.set).not.toHaveBeenCalled();
    });

    it("does not write settings when ff_focus_store is invalid JSON", async () => {
      localStorage.setItem(STORE_KEY, "not-json");
      await syncExtensionSettings();
      expect(fakeBrowser.storage.local.set).not.toHaveBeenCalled();
    });

    it("does not write settings when ff_focus_store has no settings key", async () => {
      localStorage.setItem(STORE_KEY, JSON.stringify({ state: {} }));
      await syncExtensionSettings();
      expect(fakeBrowser.storage.local.set).not.toHaveBeenCalled();
    });

    it("syncs partial settings (only strictMode)", async () => {
      const store = {
        state: {},
        settings: {
          strictMode: false,
        },
      };
      localStorage.setItem(STORE_KEY, JSON.stringify(store));

      await syncExtensionSettings();

      expect(fakeBrowser.storage.local.set).toHaveBeenCalledTimes(1);
      expect(fakeBrowser.storage.local.set).toHaveBeenCalledWith({
        ff_extension_settings: {
          strictMode: false,
          forbiddenUrls: undefined,
        },
      });
    });

    it("filters out non-string values from forbiddenUrls", async () => {
      const store = {
        state: {},
        settings: {
          strictMode: true,
          forbiddenUrls: ["youtube.com/shorts", 123, null, "tiktok.com"],
        },
      };
      localStorage.setItem(STORE_KEY, JSON.stringify(store));

      await syncExtensionSettings();

      expect(fakeBrowser.storage.local.set).toHaveBeenCalledTimes(1);
      expect(fakeBrowser.storage.local.set).toHaveBeenCalledWith({
        ff_extension_settings: {
          strictMode: true,
          forbiddenUrls: ["youtube.com/shorts", "tiktok.com"],
        },
      });
    });

    it("catches storage failure and does not throw", async () => {
      const store = {
        state: {},
        settings: {
          strictMode: true,
          forbiddenUrls: ["youtube.com/shorts"],
        },
      };
      localStorage.setItem(STORE_KEY, JSON.stringify(store));

      fakeBrowser.storage.local.set = vi.fn().mockRejectedValue(
        new Error("Storage failure")
      );

      await expect(syncExtensionSettings()).resolves.toBeUndefined();
    });
  });

  describe("readWebAppSession", () => {
    it("returns parsed session when ff_active_session is valid JSON", () => {
      const session: WebAppSession = {
        projectId: "proj-1",
        projectName: "FocusFlow",
        subPieceId: "sub-1",
        subPieceName: "Piece 1",
        projectElapsed: 120,
        subPieceRemaining: 600,
        targetTimeSeconds: 3600,
        isRunning: true,
        savedAt: Date.now(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      expect(readWebAppSession()).toEqual(session);
    });

    it("returns null when ff_active_session is missing", () => {
      expect(readWebAppSession()).toBeNull();
    });

    it("returns null when ff_active_session is invalid JSON", () => {
      localStorage.setItem(SESSION_KEY, "not-json");
      expect(readWebAppSession()).toBeNull();
    });
  });

  describe("buildDisplayState", () => {
    it("uses project mode when no subPieceId", () => {
      const session: WebAppSession = {
        projectId: "proj-1",
        projectName: "FocusFlow",
        projectElapsed: 120,
        targetTimeSeconds: 3600,
        isRunning: true,
      };

      expect(buildDisplayState(session)).toEqual({
        projectName: "FocusFlow",
        subPieceName: undefined,
        usedSeconds: 120,
        totalSeconds: 3600,
        isRunning: true,
        isCompleted: false,
      });
    });

    it("uses sub-piece mode when subPieceId is present", () => {
      const session: WebAppSession = {
        projectId: "proj-1",
        projectName: "FocusFlow",
        subPieceId: "sub-1",
        subPieceName: "Piece 1",
        projectElapsed: 300,
        subPieceRemaining: 60,
        allocatedMinutes: 5,
        targetTimeSeconds: 3600,
        isRunning: true,
      };

      // 5 min allocated = 300s total, 60s remaining = 240s used
      expect(buildDisplayState(session)).toEqual({
        projectName: "FocusFlow",
        subPieceName: "Piece 1",
        usedSeconds: 240,
        totalSeconds: 300,
        isRunning: true,
        isCompleted: false,
      });
    });

    it("detects sub-piece completion when remaining is 0 and not running", () => {
      const session: WebAppSession = {
        projectId: "proj-1",
        subPieceId: "sub-1",
        subPieceName: "Piece 1",
        allocatedMinutes: 2,
        subPieceRemaining: 0,
        isRunning: false,
      };

      const state = buildDisplayState(session);
      expect(state.usedSeconds).toBe(120);
      expect(state.totalSeconds).toBe(120);
      expect(state.isCompleted).toBe(true);
    });

    it("detects project completion when elapsed >= target and not running", () => {
      const session: WebAppSession = {
        projectId: "proj-1",
        projectName: "FocusFlow",
        projectElapsed: 3600,
        targetTimeSeconds: 3600,
        isRunning: false,
      };

      const state = buildDisplayState(session);
      expect(state.usedSeconds).toBe(3600);
      expect(state.totalSeconds).toBe(3600);
      expect(state.isCompleted).toBe(true);
    });

    it("does not mark as completed when still running", () => {
      const session: WebAppSession = {
        projectId: "proj-1",
        subPieceId: "sub-1",
        allocatedMinutes: 2,
        subPieceRemaining: 0,
        isRunning: true,
      };

      expect(buildDisplayState(session).isCompleted).toBe(false);
    });

    it("uses defaults for missing fields", () => {
      const session: WebAppSession = {};
      expect(buildDisplayState(session)).toEqual({
        projectName: undefined,
        subPieceName: undefined,
        usedSeconds: 0,
        totalSeconds: 0,
        isRunning: false,
        isCompleted: false,
      });
    });
  });

  describe("startFocusSyncPolling", () => {
    it("sends SYNC_DISPLAY_STATE when web-app session changes and skips unchanged", async () => {
      vi.useFakeTimers();
      const sendMessageSpy = vi
        .spyOn(fakeBrowser.runtime, "sendMessage")
        .mockResolvedValue(undefined);

      const session: WebAppSession = {
        projectId: "proj-1",
        projectName: "FocusFlow",
        projectElapsed: 120,
        targetTimeSeconds: 3600,
        isRunning: true,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      startFocusSyncPolling(5000);
      await vi.advanceTimersByTimeAsync(0);

      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
      expect(sendMessageSpy).toHaveBeenCalledWith({
        type: "SYNC_DISPLAY_STATE",
        payload: {
          projectName: "FocusFlow",
          subPieceName: undefined,
          usedSeconds: 120,
          totalSeconds: 3600,
          isRunning: true,
          isCompleted: false,
        },
      });

      await vi.advanceTimersByTimeAsync(5000);
      expect(sendMessageSpy).toHaveBeenCalledTimes(1);

      const changed: WebAppSession = { ...session, projectElapsed: 180 };
      localStorage.setItem(SESSION_KEY, JSON.stringify(changed));
      await vi.advanceTimersByTimeAsync(5000);
      expect(sendMessageSpy).toHaveBeenCalledTimes(2);
      expect(sendMessageSpy).toHaveBeenLastCalledWith({
        type: "SYNC_DISPLAY_STATE",
        payload: {
          projectName: "FocusFlow",
          subPieceName: undefined,
          usedSeconds: 180,
          totalSeconds: 3600,
          isRunning: true,
          isCompleted: false,
        },
      });

      sendMessageSpy.mockRestore();
    });
  });
});
