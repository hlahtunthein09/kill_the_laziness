import { describe, it, expect, beforeEach, vi } from "vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import {
  renderPopup,
  initPopup,
  setupOpenAppButton,
  setupStorageListener,
  renderNotificationStatus,
  setPopupBrowserInstance,
  FOCUSFLOW_URL,
} from "../popup";
import type { DisplayState } from "../types";

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
    <div id="used-total">0 / 0 min</div>
  </div>
  <div id="empty-state" style="display: none;"></div>
  <button id="open-app-btn"></button>
  <button id="test-notif-btn"></button>
</body>
</html>
`;

function displayState(overrides: Partial<DisplayState> = {}): DisplayState {
  return {
    projectName: "My Project",
    subPieceName: "My Task",
    usedSeconds: 0,
    totalSeconds: 0,
    isRunning: false,
    isCompleted: false,
    ...overrides,
  };
}

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
      renderPopup(displayState({ usedSeconds: 60, totalSeconds: 120 }));

      const contentEl = document.getElementById("popup-content");
      const emptyEl = document.getElementById("empty-state");

      expect(contentEl!.style.display).toBe("block");
      expect(emptyEl!.style.display).toBe("none");
    });

    it("renders running status with green dot and Burmese label", () => {
      renderPopup(displayState({ isRunning: true }));

      const dot = document.getElementById("status-dot");
      const label = document.getElementById("status-label");

      expect(dot!.className).toContain("running");
      expect(label!.textContent).toContain("အာရုံစိုက်နေသည်");
      expect(label!.textContent).toContain("Focusing");
    });

    it("renders paused status with amber dot and Burmese label", () => {
      renderPopup(displayState({ isRunning: false }));

      const dot = document.getElementById("status-dot");
      const label = document.getElementById("status-label");

      expect(dot!.className).toContain("paused");
      expect(label!.textContent).toContain("ခဏရပ်ထားသည်");
      expect(label!.textContent).toContain("Paused");
    });

    it("renders completed status with green dot and Burmese label", () => {
      renderPopup(displayState({ isCompleted: true, isRunning: false }));

      const dot = document.getElementById("status-dot");
      const label = document.getElementById("status-label");

      expect(dot!.className).toContain("completed");
      expect(label!.textContent).toContain("ပြီးဆုံးပါပြီ");
      expect(label!.textContent).toContain("Completed");
    });

    it("renders project and sub-piece names when provided", () => {
      renderPopup(
        displayState({ projectName: "Website Redesign", subPieceName: "Homepage Layout" })
      );

      expect(document.getElementById("project-name")!.textContent).toBe("Website Redesign");
      expect(document.getElementById("subpiece-name")!.textContent).toBe("Homepage Layout");
    });

    it("falls back to --- when names are not provided", () => {
      renderPopup({
        usedSeconds: 60,
        totalSeconds: 120,
        isRunning: false,
        isCompleted: false,
      });

      expect(document.getElementById("project-name")!.textContent).toBe("---");
      expect(document.getElementById("subpiece-name")!.textContent).toBe("---");
    });

    it("formats used and total seconds as minutes", () => {
      renderPopup(displayState({ usedSeconds: 720, totalSeconds: 1500 }));

      expect(document.getElementById("used-total")!.textContent).toBe("12 / 25 min");
    });

    it("handles zero times gracefully", () => {
      renderPopup(displayState({ usedSeconds: 0, totalSeconds: 0 }));

      expect(document.getElementById("used-total")!.textContent).toBe("0 / 0 min");
    });

    it("floors partial minutes", () => {
      renderPopup(displayState({ usedSeconds: 89, totalSeconds: 179 }));

      expect(document.getElementById("used-total")!.textContent).toBe("1 / 2 min");
    });
  });

  describe("initPopup", () => {
    it("reads ff_display_state from storage and renders it", async () => {
      const state: DisplayState = {
        projectName: "Synced Project",
        subPieceName: "Synced Task",
        usedSeconds: 600,
        totalSeconds: 1200,
        isRunning: true,
        isCompleted: false,
      };
      await fakeBrowser.storage.local.set({ ff_display_state: state });

      await initPopup();

      expect(document.getElementById("project-name")!.textContent).toBe("Synced Project");
      expect(document.getElementById("subpiece-name")!.textContent).toBe("Synced Task");
      expect(document.getElementById("used-total")!.textContent).toBe("10 / 20 min");
      expect(document.getElementById("status-dot")!.className).toContain("running");
    });

    it("renders empty state when ff_display_state is missing", async () => {
      await initPopup();

      const contentEl = document.getElementById("popup-content");
      const emptyEl = document.getElementById("empty-state");

      expect(contentEl!.style.display).toBe("none");
      expect(emptyEl!.style.display).toBe("block");
    });

    it("does not read ff_active_session_v2 for display state", async () => {
      await fakeBrowser.storage.local.set({
        ff_active_session_v2: {
          token: {
            sessionId: "abc",
            projectId: "proj-1",
            projectName: "Wrong Project",
            subPieceName: "Wrong Task",
            mode: "sub-piece",
            targetTimeSeconds: 600,
            projectElapsedBaseline: 0,
            subPieceRemainingBaseline: 600,
            isRunning: true,
            startedAt: Date.now(),
            resumedAt: Date.now(),
            elapsedActiveSeconds: 0,
          },
          trackers: {},
        },
      });

      await initPopup();

      expect(document.getElementById("project-name")!.textContent).toBe("---");
      expect(document.getElementById("empty-state")!.style.display).toBe("block");
    });
  });

  describe("storage listener", () => {
    it("re-renders when ff_display_state changes", () => {
      renderPopup(displayState({ projectName: "Old", usedSeconds: 60, totalSeconds: 120 }));

      const callbacks: Array<(changes: Record<string, { newValue?: unknown }>) => void> = [];
      vi.spyOn(fakeBrowser.storage.local.onChanged, "addListener").mockImplementation((cb) => {
        callbacks.push(cb as (changes: Record<string, { newValue?: unknown }>) => void);
      });

      setupStorageListener();

      expect(callbacks.length).toBe(1);

      callbacks[0]({
        ff_display_state: {
          newValue: {
            projectName: "Updated",
            subPieceName: "Updated Task",
            usedSeconds: 300,
            totalSeconds: 600,
            isRunning: true,
            isCompleted: false,
          },
        },
      });

      expect(document.getElementById("project-name")!.textContent).toBe("Updated");
      expect(document.getElementById("subpiece-name")!.textContent).toBe("Updated Task");
      expect(document.getElementById("used-total")!.textContent).toBe("5 / 10 min");
      expect(document.getElementById("status-dot")!.className).toContain("running");
    });

    it("ignores unrelated storage changes", () => {
      renderPopup(displayState({ projectName: "Old" }));

      const callbacks: Array<(changes: Record<string, { newValue?: unknown }>) => void> = [];
      vi.spyOn(fakeBrowser.storage.local.onChanged, "addListener").mockImplementation((cb) => {
        callbacks.push(cb as (changes: Record<string, { newValue?: unknown }>) => void);
      });

      setupStorageListener();

      callbacks[0]({ unrelated_key: { newValue: "ignore me" } });

      expect(document.getElementById("project-name")!.textContent).toBe("Old");
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
