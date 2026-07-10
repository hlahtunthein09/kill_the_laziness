import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import {
  renderPopup,
  initPopup,
  setupOpenAppButton,
  renderNotificationStatus,
  setPopupBrowserInstance,
  FOCUSFLOW_URL,
} from "../popup";
import type { ExtensionTimerState, ActiveSessionToken } from "../types";

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
  <div id="popup-content" style="display: none;">
    <div id="notification-status" class="notification-status-row"></div>
    <span id="status-dot"></span>
    <span id="status-label">---</span>
    <div id="project-name">---</div>
    <div id="subpiece-name">---</div>
    <div id="elapsed-label">Elapsed</div>
    <div id="elapsed-time">0m</div>
    <div id="remaining-label">Remaining</div>
    <div id="remaining-time">0m</div>
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

    it("renders completed status for a finished sub-piece", () => {
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        projectName: "Test Project",
        subPieceId: "sub-1",
        subPieceName: "Test Task",
        projectElapsed: 300,
        subPieceRemaining: 0,
        isRunning: false,
        savedAt: Date.now(),
      };

      renderPopup(state);

      const dot = document.getElementById("status-dot");
      const label = document.getElementById("status-label");

      expect(dot!.className).toContain("completed");
      expect(label!.textContent).toContain("ပြီးစီး");
      expect(label!.textContent).toContain("Completed");
    });

    it("renders completed status for a finished project", () => {
      const state: ExtensionTimerState = {
        projectId: "proj-1",
        projectName: "Test Project",
        projectElapsed: 3600,
        subPieceRemaining: 0,
        targetTimeSeconds: 3600,
        isRunning: false,
        savedAt: Date.now(),
      };

      renderPopup(state);

      const dot = document.getElementById("status-dot");
      const label = document.getElementById("status-label");

      expect(dot!.className).toContain("completed");
      expect(label!.textContent).toContain("Completed");
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
        projectElapsed: 3665, // 1h 1m 5s
        subPieceRemaining: 0,
        targetTimeSeconds: 3850, // remaining 185s → 3m 5s
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

    it("falls back to stored session when GET_ACTIVE_SESSION returns null", async () => {
      const token: ActiveSessionToken = {
        sessionId: "abc12345",
        projectId: "proj-1",
        projectName: "Stored Project",
        subPieceId: "sub-1",
        subPieceName: "Stored Task",
        mode: "sub-piece",
        targetTimeSeconds: 600,
        projectElapsedBaseline: 120,
        subPieceRemainingBaseline: 300,
        isRunning: true,
        startedAt: Date.now(),
        resumedAt: Date.now(),
        elapsedActiveSeconds: 0,
      };

      await fakeBrowser.storage.local.set({ "ff_active_session_v2": { token, trackers: {} } });

      await initPopup();

      expect(document.getElementById("project-name")!.textContent).toBe("Stored Project");
      expect(document.getElementById("status-dot")!.className).toContain("running");
    });

    it("adds live drift to running session display", async () => {
      const now = 1_000_000;
      vi.spyOn(Date, "now").mockImplementation(() => now);
      const token: ActiveSessionToken = {
        sessionId: "abc12345",
        projectId: "proj-1",
        projectName: "Project",
        subPieceId: "sub-1",
        subPieceName: "Task",
        mode: "sub-piece",
        targetTimeSeconds: 600,
        projectElapsedBaseline: 600,
        subPieceRemainingBaseline: 300,
        isRunning: true,
        startedAt: now - 10_000,
        resumedAt: now - 5_000,
        elapsedActiveSeconds: 100,
      };

      await fakeBrowser.storage.local.set({ "ff_active_session_v2": { token, trackers: {} } });

      await initPopup();

      // sub-piece elapsed = baseline - remaining = 300 - (300 - 105) = 105
      expect(document.getElementById("elapsed-time")!.textContent).toBe("1m 45s");
      // sub-piece remaining = 300 - 105 = 195
      expect(document.getElementById("remaining-time")!.textContent).toBe("3m 15s");
      expect(document.getElementById("elapsed-label")!.textContent).toContain("Sub-piece elapsed");
      expect(document.getElementById("remaining-label")!.textContent).toContain("Sub-piece remaining");
    });

    it("does not add drift to paused session display", async () => {
      const now = 1_000_000;
      vi.spyOn(Date, "now").mockImplementation(() => now);
      const token: ActiveSessionToken = {
        sessionId: "abc12345",
        projectId: "proj-1",
        projectName: "Project",
        subPieceId: "sub-1",
        subPieceName: "Task",
        mode: "sub-piece",
        targetTimeSeconds: 600,
        projectElapsedBaseline: 600,
        subPieceRemainingBaseline: 300,
        isRunning: false,
        startedAt: now - 10_000,
        resumedAt: now - 5_000,
        elapsedActiveSeconds: 100,
      };

      await fakeBrowser.storage.local.set({ "ff_active_session_v2": { token, trackers: {} } });

      await initPopup();

      expect(document.getElementById("elapsed-time")!.textContent).toBe("1m 40s");
      expect(document.getElementById("remaining-time")!.textContent).toBe("3m 20s");
    });

    it("shows project elapsed and remaining in project-only mode", async () => {
      const token: ActiveSessionToken = {
        sessionId: "abc12345",
        projectId: "proj-1",
        projectName: "Project",
        mode: "project",
        targetTimeSeconds: 3600,
        projectElapsedBaseline: 1500,
        isRunning: true,
        startedAt: Date.now(),
        resumedAt: Date.now(),
        elapsedActiveSeconds: 0,
      };

      await fakeBrowser.storage.local.set({ "ff_active_session_v2": { token, trackers: {} } });

      await initPopup();

      expect(document.getElementById("elapsed-time")!.textContent).toBe("25m");
      expect(document.getElementById("remaining-time")!.textContent).toBe("35m");
      expect(document.getElementById("elapsed-label")!.textContent).toContain("Project elapsed");
      expect(document.getElementById("remaining-label")!.textContent).toContain("Project remaining");
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
