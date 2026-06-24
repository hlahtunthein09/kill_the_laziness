import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import {
  renderPopup,
  setupStartButton,
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
  <button id="open-app-btn"></button>
</body>
</html>
`;

describe("popup-start.ts", () => {
  beforeEach(() => {
    fakeBrowser.reset();
    setPopupBrowserInstance(fakeBrowser as unknown as typeof import("wxt/browser").browser);
    document.body.innerHTML = popupHtml;
  });

  describe("setupStartButton", () => {
    it("sends START_TIMER message when clicked while session is paused", () => {
      const sendMessageMock = vi.fn().mockResolvedValue({});
      fakeBrowser.runtime.sendMessage = sendMessageMock;

      const state: ExtensionTimerState = {
        projectId: "proj-1",
        projectName: "Test Project",
        subPieceId: "sub-1",
        subPieceName: "Test Task",
        projectElapsed: 300,
        subPieceRemaining: 600,
        isRunning: false,
        savedAt: Date.now(),
      };

      setupStartButton(state);

      const btn = document.getElementById("start-btn");
      expect(btn!.style.display).toBe("block");

      btn!.click();

      expect(sendMessageMock).toHaveBeenCalledTimes(1);
      expect(sendMessageMock).toHaveBeenCalledWith({ action: "START_TIMER" });
    });

    it("hides the button when no session exists", () => {
      setupStartButton(null);

      const btn = document.getElementById("start-btn");
      expect(btn!.style.display).toBe("none");
    });

    it("shows the button when session exists and isRunning is false", () => {
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

      setupStartButton(state);

      const btn = document.getElementById("start-btn");
      expect(btn!.style.display).toBe("block");
    });

    it("hides the button when session is running", () => {
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

      setupStartButton(state);

      const btn = document.getElementById("start-btn");
      expect(btn!.style.display).toBe("none");
    });
  });

  describe("renderPopup integration", () => {
    it("calls setupStartButton with the provided state", () => {
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

      const btn = document.getElementById("start-btn");
      expect(btn!.style.display).toBe("block");
    });

    it("hides start button via renderPopup when state is null", () => {
      renderPopup(null);

      const btn = document.getElementById("start-btn");
      expect(btn!.style.display).toBe("none");
    });
  });
});
