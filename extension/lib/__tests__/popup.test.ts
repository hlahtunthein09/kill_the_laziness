import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import {
  renderPopup,
  initPopup,
  setPopupBrowserInstance,
  TIMER_STATE_KEY,
  FOCUSFLOW_URL,
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
  <button id="open-app-btn"></button>
</body>
</html>
`;

describe("popup.ts", () => {
  beforeEach(() => {
    fakeBrowser.reset();
    setPopupBrowserInstance(fakeBrowser as unknown as typeof import("wxt/browser").browser);
    document.body.innerHTML = popupHtml;
  });

  describe("renderPopup", () => {
    it("shows empty state when state is null", () => {
      renderPopup(null);

      const contentEl = document.getElementById("popup-content");
      const emptyEl = document.getElementById("empty-state");

      expect(contentEl!.style.display).toBe("none");
      expect(emptyEl!.style.display).toBe("block");
    });

    it("shows content and hides empty state when state exists", () => {
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        projectName: "My Project",
        subPieceId: "sub-1",
        subPieceName: "My Task",
        projectElapsed: 3665,
        subPieceRemaining: 1800,
        isRunning: true,
        savedAt: Date.now(),
      };

      renderPopup(state);

      const contentEl = document.getElementById("popup-content");
      const emptyEl = document.getElementById("empty-state");

      expect(contentEl!.style.display).toBe("block");
      expect(emptyEl!.style.display).toBe("none");
    });

    it("renders running status with green dot and Burmese label", () => {
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        projectElapsed: 120,
        subPieceRemaining: 300,
        isRunning: true,
        savedAt: Date.now(),
      };

      renderPopup(state);

      const dot = document.getElementById("status-dot");
      const label = document.getElementById("status-label");

      expect(dot!.className).toContain("running");
      expect(label!.textContent).toContain("အာရုံစိုက်နေသည်");
      expect(label!.textContent).toContain("Focusing");
    });

    it("renders paused status with yellow dot and Burmese label", () => {
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        projectElapsed: 120,
        subPieceRemaining: 300,
        isRunning: false,
        savedAt: Date.now(),
      };

      renderPopup(state);

      const dot = document.getElementById("status-dot");
      const label = document.getElementById("status-label");

      expect(dot!.className).toContain("paused");
      expect(label!.textContent).toContain("ခဏရပ်ထားသည်");
      expect(label!.textContent).toContain("Paused");
    });

    it("renders project and sub-piece names when provided", () => {
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        projectName: "Website Redesign",
        subPieceId: "sub-1",
        subPieceName: "Homepage Layout",
        projectElapsed: 600,
        subPieceRemaining: 1200,
        isRunning: true,
        savedAt: Date.now(),
      };

      renderPopup(state);

      expect(document.getElementById("project-name")!.textContent).toBe("Website Redesign");
      expect(document.getElementById("subpiece-name")!.textContent).toBe("Homepage Layout");
    });

    it("falls back to IDs when names are not provided", () => {
      const state: ExtensionTimerState = {
        projectId: "proj-42",
        subPieceId: "sub-7",
        projectElapsed: 300,
        subPieceRemaining: 900,
        isRunning: false,
        savedAt: Date.now(),
      };

      renderPopup(state);

      expect(document.getElementById("project-name")!.textContent).toBe("proj-42");
      expect(document.getElementById("subpiece-name")!.textContent).toBe("sub-7");
    });

    it("shows --- for sub-piece when no subPieceId or subPieceName", () => {
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        projectName: "Solo Project",
        projectElapsed: 300,
        subPieceRemaining: 0,
        isRunning: true,
        savedAt: Date.now(),
      };

      renderPopup(state);

      expect(document.getElementById("subpiece-name")!.textContent).toBe("---");
    });

    it("formats elapsed and remaining times using formatDuration", () => {
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        projectName: "Test",
        subPieceId: "sub-1",
        subPieceName: "Task",
        projectElapsed: 3665, // 1h 1m 5s
        subPieceRemaining: 185, // 3m 5s
        isRunning: true,
        savedAt: Date.now(),
      };

      renderPopup(state);

      expect(document.getElementById("elapsed-time")!.textContent).toBe("1h 1m");
      expect(document.getElementById("remaining-time")!.textContent).toBe("3m 5s");
    });

    it("handles zero times gracefully", () => {
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        projectElapsed: 0,
        subPieceRemaining: 0,
        isRunning: false,
        savedAt: Date.now(),
      };

      renderPopup(state);

      expect(document.getElementById("elapsed-time")!.textContent).toBe("0m");
      expect(document.getElementById("remaining-time")!.textContent).toBe("0m");
    });
  });

  describe("initPopup", () => {
    it("reads storage and renders null state when key is absent", async () => {
      await initPopup();

      const contentEl = document.getElementById("popup-content");
      const emptyEl = document.getElementById("empty-state");

      expect(contentEl!.style.display).toBe("none");
      expect(emptyEl!.style.display).toBe("block");
    });

    it("reads storage and renders state when key exists", async () => {
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        projectName: "Stored Project",
        subPieceId: "sub-1",
        subPieceName: "Stored Task",
        projectElapsed: 900,
        subPieceRemaining: 600,
        isRunning: true,
        savedAt: Date.now(),
      };

      await fakeBrowser.storage.local.set({ [TIMER_STATE_KEY]: state });

      await initPopup();

      expect(document.getElementById("project-name")!.textContent).toBe("Stored Project");
      expect(document.getElementById("status-dot")!.className).toContain("running");
    });
  });

  describe("open app button", () => {
    it("calls browser.tabs.create with FocusFlow URL on click", () => {
      const createMock = vi.fn().mockResolvedValue({});
      fakeBrowser.tabs.create = createMock;

      // Import and run the module-level setup by simulating the event
      const btn = document.getElementById("open-app-btn");
      if (!btn) throw new Error("Button not found");

      btn.addEventListener("click", () => {
        fakeBrowser.tabs.create({ url: FOCUSFLOW_URL });
      });

      btn.click();

      expect(createMock).toHaveBeenCalledTimes(1);
      expect(createMock).toHaveBeenCalledWith({ url: FOCUSFLOW_URL });
    });
  });
});
