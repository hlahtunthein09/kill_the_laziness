import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import {
  renderPopup,
  setupPauseResetButtons,
  setPopupBrowserInstance,
} from "../popup";
import type { ExtensionTimerState } from "../types";

const popupHtml = `
<!DOCTYPE html>
<html>
<body>
  <div id="popup-content"></div>
  <div id="empty-state" style="display: none;"></div>
  <span id="status-dot"></span>
  <span id="status-label">---</span>
  <div id="project-name">---</div>
  <div id="subpiece-name">---</div>
  <div id="elapsed-time">0m</div>
  <div id="remaining-time">0m</div>
  <button id="start-btn" style="display: none;"></button>
  <button id="pause-btn" style="display: none;"></button>
  <button id="reset-btn" style="display: none;"></button>
  <button id="open-app-btn"></button>
</body>
</html>
`;

describe("popup-pause-reset.ts", () => {
  beforeEach(() => {
    fakeBrowser.reset();
    setPopupBrowserInstance(fakeBrowser as unknown as typeof import("wxt/browser").browser);
    document.body.innerHTML = popupHtml;
  });

  describe("setupPauseResetButtons", () => {
    it("sends PAUSE_TIMER message when clicked while session is running", () => {
      const sendMessageMock = vi.fn().mockResolvedValue({});
      fakeBrowser.runtime.sendMessage = sendMessageMock;

      const state: ExtensionTimerState = {
        projectId: "proj-1",
        projectName: "Test Project",
        subPieceId: "sub-1",
        subPieceName: "Test Task",
        projectElapsed: 300,
        subPieceRemaining: 600,
        isRunning: true,
        savedAt: Date.now(),
      };

      setupPauseResetButtons(state);

      const pauseBtn = document.getElementById("pause-btn");
      expect(pauseBtn!.style.display).toBe("block");

      pauseBtn!.click();

      expect(sendMessageMock).toHaveBeenCalledTimes(1);
      expect(sendMessageMock).toHaveBeenCalledWith({ action: "PAUSE_TIMER" });
    });

    it("sends RESET_TIMER message when clicked while session is running", () => {
      const sendMessageMock = vi.fn().mockResolvedValue({});
      fakeBrowser.runtime.sendMessage = sendMessageMock;

      const state: ExtensionTimerState = {
        projectId: "proj-1",
        projectName: "Test Project",
        subPieceId: "sub-1",
        subPieceName: "Test Task",
        projectElapsed: 300,
        subPieceRemaining: 600,
        isRunning: true,
        savedAt: Date.now(),
      };

      setupPauseResetButtons(state);

      const resetBtn = document.getElementById("reset-btn");
      expect(resetBtn!.style.display).toBe("block");

      resetBtn!.click();

      expect(sendMessageMock).toHaveBeenCalledTimes(1);
      expect(sendMessageMock).toHaveBeenCalledWith({ action: "RESET_TIMER" });
    });

    it("hides buttons when no session exists", () => {
      setupPauseResetButtons(null);

      const pauseBtn = document.getElementById("pause-btn");
      const resetBtn = document.getElementById("reset-btn");
      expect(pauseBtn!.style.display).toBe("none");
      expect(resetBtn!.style.display).toBe("none");
    });

    it("hides buttons when session is paused (isRunning: false)", () => {
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        projectName: "Test Project",
        subPieceId: "sub-1",
        subPieceName: "Test Task",
        projectElapsed: 120,
        subPieceRemaining: 300,
        isRunning: false,
        savedAt: Date.now(),
      };

      setupPauseResetButtons(state);

      const pauseBtn = document.getElementById("pause-btn");
      const resetBtn = document.getElementById("reset-btn");
      expect(pauseBtn!.style.display).toBe("none");
      expect(resetBtn!.style.display).toBe("none");
    });
  });

  describe("renderPopup integration", () => {
    it("shows pause/reset buttons via renderPopup when isRunning is true", () => {
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        projectName: "Test Project",
        subPieceId: "sub-1",
        subPieceName: "Test Task",
        projectElapsed: 120,
        subPieceRemaining: 300,
        isRunning: true,
        savedAt: Date.now(),
      };

      renderPopup(state);

      const pauseBtn = document.getElementById("pause-btn");
      const resetBtn = document.getElementById("reset-btn");
      expect(pauseBtn!.style.display).toBe("block");
      expect(resetBtn!.style.display).toBe("block");
    });

    it("hides pause/reset buttons via renderPopup when isRunning is false", () => {
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        projectName: "Test Project",
        subPieceId: "sub-1",
        subPieceName: "Test Task",
        projectElapsed: 120,
        subPieceRemaining: 300,
        isRunning: false,
        savedAt: Date.now(),
      };

      renderPopup(state);

      const pauseBtn = document.getElementById("pause-btn");
      const resetBtn = document.getElementById("reset-btn");
      expect(pauseBtn!.style.display).toBe("none");
      expect(resetBtn!.style.display).toBe("none");
    });

    it("hides pause/reset buttons via renderPopup when state is null", () => {
      renderPopup(null);

      const pauseBtn = document.getElementById("pause-btn");
      const resetBtn = document.getElementById("reset-btn");
      expect(pauseBtn!.style.display).toBe("none");
      expect(resetBtn!.style.display).toBe("none");
    });
  });
});
