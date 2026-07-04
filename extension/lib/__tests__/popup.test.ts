import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import {
  renderPopup,
  initPopup,
  setupStartButton,
  setupOpenAppButton,
  renderNotificationStatus,
  setPopupBrowserInstance,
  TIMER_STATE_KEY,
  FOCUSFLOW_URL,
} from "../popup";
import type { ExtensionTimerState } from "../types";

interface FakeNotificationsWithPermission {
  getPermissionLevel(): Promise<string>;
  create(id: string, options: Record<string, unknown>): Promise<string>;
}

function getFakeNotifications(): FakeNotificationsWithPermission {
  return fakeBrowser.notifications as unknown as FakeNotificationsWithPermission;
}

const popupHtml = `
<!DOCTYPE html>
<html>
<body>
  <div id="popup-content">
    <div id="notification-status" class="notification-status-row"></div>
    <span id="status-dot"></span>
    <span id="status-label">---</span>
    <div id="project-name">---</div>
    <div id="subpiece-name">---</div>
    <div id="elapsed-time">0m</div>
    <div id="remaining-time">0m</div>
    <button id="start-btn" style="display: none;"></button>
    <button id="pause-btn" style="display: none;"></button>
    <button id="reset-btn" style="display: none;"></button>
  </div>
  <div id="empty-state" style="display: none;"></div>
  <button id="open-app-btn"></button>
  <button id="test-notif-btn"></button>
</body>
</html>
`;

describe("popup.ts", () => {
  beforeEach(() => {
    fakeBrowser.reset();
    setPopupBrowserInstance(fakeBrowser as unknown as typeof import("wxt/browser").browser);
    document.body.innerHTML = popupHtml;
    getFakeNotifications().getPermissionLevel = vi.fn().mockResolvedValue("granted");
    getFakeNotifications().create = vi.fn().mockResolvedValue("test-notif");
    (fakeBrowser.runtime as unknown as { getURL: (path: string) => string }).getURL = vi.fn(
      (path: string) => `chrome-extension://test${path}`
    );
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

  describe("notification status", () => {
    it("renders granted permission with green dot and On label", async () => {
      getFakeNotifications().getPermissionLevel = vi.fn().mockResolvedValue("granted");

      await renderNotificationStatus(fakeBrowser as unknown as typeof import("wxt/browser").browser);

      const status = document.getElementById("notification-status");
      expect(status!.querySelector(".status-dot")!.className).toContain("on");
      expect(status!.textContent).toContain("အသိပေးချက်ဖွင့်ထား (On)");
    });

    it("renders denied permission with red dot, Off label, and settings link", async () => {
      getFakeNotifications().getPermissionLevel = vi.fn().mockResolvedValue("denied");
      const createTabMock = vi.fn().mockResolvedValue({});
      fakeBrowser.tabs.create = createTabMock;

      await renderNotificationStatus(fakeBrowser as unknown as typeof import("wxt/browser").browser);

      const status = document.getElementById("notification-status");
      expect(status!.querySelector(".status-dot")!.className).toContain("off");
      expect(status!.textContent).toContain("အသိပေးချက်ပိတ်ထား (Off)");

      const link = document.getElementById("notif-settings-link");
      expect(link).not.toBeNull();
      expect(link!.textContent).toContain("ဖွင့်ရန် (Open settings)");

      link!.click();
      expect(createTabMock).toHaveBeenCalledTimes(1);
      expect(createTabMock).toHaveBeenCalledWith({ url: "chrome://settings/content/notifications" });
    });

    it("renders pending status with amber dot for unknown permission levels", async () => {
      getFakeNotifications().getPermissionLevel = vi.fn().mockResolvedValue("prompt");

      await renderNotificationStatus(fakeBrowser as unknown as typeof import("wxt/browser").browser);

      const status = document.getElementById("notification-status");
      expect(status!.querySelector(".status-dot")!.className).toContain("pending");
      expect(status!.textContent).toContain("ခွင့်ပြုချက်မရသေးပါ (Pending)");
    });
  });

  describe("start button", () => {
    it("shows the button when state exists and isRunning is false", () => {
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

      const btn = document.getElementById("start-btn") as HTMLButtonElement;
      expect(btn.style.display).toBe("block");
      expect(btn.textContent).toContain("စတင်");
    });

    it("sends START_TIMER when clicked and shows temporary feedback", () => {
      vi.useFakeTimers();
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
      const btn = document.getElementById("start-btn") as HTMLButtonElement;
      btn.click();

      expect(btn.textContent).toContain("စတင်နေပါပြီ");
      expect(btn.textContent).toContain("Starting");
      expect(btn.disabled).toBe(true);

      expect(sendMessageMock).toHaveBeenCalledTimes(1);
      const sent = sendMessageMock.mock.calls[0][0] as {
        action: string;
        payload: ExtensionTimerState;
      };
      expect(sent.action).toBe("START_TIMER");
      expect(sent.payload.isRunning).toBe(true);

      vi.advanceTimersByTime(1000);
      expect(btn.textContent).toContain("စတင်");
      expect(btn.disabled).toBe(false);

      vi.useRealTimers();
    });
  });

  describe("open app button", () => {
    it("calls browser.tabs.create with FocusFlow URL on click", () => {
      const createMock = vi.fn().mockResolvedValue({});
      fakeBrowser.tabs.create = createMock;

      setupOpenAppButton();

      const btn = document.getElementById("open-app-btn");
      if (!btn) throw new Error("Button not found");

      btn.click();

      expect(createMock).toHaveBeenCalledTimes(1);
      expect(createMock).toHaveBeenCalledWith({ url: FOCUSFLOW_URL });
    });
  });

  describe("notification diagnostics", () => {
    it("calls browser.notifications.create when test button is clicked", async () => {
      await initPopup();

      document.getElementById("test-notif-btn")!.click();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(getFakeNotifications().create).toHaveBeenCalledTimes(1);
      expect(getFakeNotifications().create).toHaveBeenCalledWith("test-notif", {
        type: "basic",
        iconUrl: "chrome-extension://test/icon/128.png",
        title: "FocusFlow AI — စမ်းသပ်ခြင်း",
        message: "အသိပေးချက်လုပ်ဆောင်နေသည် (Test notification working)",
      });
    });

    it("does not create notification when test button is absent", async () => {
      document.body.innerHTML = popupHtml.replace(
        /<button id="test-notif-btn".*?<\/button>/,
        ""
      );

      await initPopup();

      expect(getFakeNotifications().create).not.toHaveBeenCalled();
    });
  });
});
