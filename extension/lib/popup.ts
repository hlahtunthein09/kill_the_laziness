import { browser } from "wxt/browser";
import type { DisplayState } from "./types";

export const FOCUSFLOW_URL = "http://localhost:3000/timer";
const DISPLAY_STATE_KEY = "ff_display_state";

let _browserInstance: typeof browser | null = null;

export function setPopupBrowserInstance(instance: typeof browser): void {
  _browserInstance = instance;
}

function getBrowser(): typeof browser {
  return _browserInstance ?? browser;
}

function formatUsedTotal(usedSeconds: number, totalSeconds: number): string {
  const used = Math.floor(usedSeconds / 60);
  const total = Math.floor(totalSeconds / 60);
  return `${used} / ${total} min`;
}

async function getDisplayState(): Promise<DisplayState | null> {
  try {
    const result = await getBrowser().storage.local.get(DISPLAY_STATE_KEY);
    const state = result[DISPLAY_STATE_KEY] as DisplayState | undefined;
    return state ?? null;
  } catch {
    return null;
  }
}

interface NotificationsWithPermission {
  getPermissionLevel(): Promise<string>;
}

function getNotifications(browserInstance: typeof browser): NotificationsWithPermission {
  return browserInstance.notifications as unknown as NotificationsWithPermission;
}

export function renderPopup(state: DisplayState | null): void {
  const contentEl = document.getElementById("popup-content");
  const emptyEl = document.getElementById("empty-state");
  const statusDot = document.getElementById("status-dot");
  const statusLabel = document.getElementById("status-label");
  const projectNameEl = document.getElementById("project-name");
  const subPieceNameEl = document.getElementById("subpiece-name");
  const usedTotalEl = document.getElementById("used-total");

  if (
    !contentEl ||
    !emptyEl ||
    !statusDot ||
    !statusLabel ||
    !projectNameEl ||
    !subPieceNameEl ||
    !usedTotalEl
  ) {
    return;
  }

  if (!state) {
    contentEl.style.display = "none";
    emptyEl.style.display = "block";
    return;
  }

  contentEl.style.display = "block";
  emptyEl.style.display = "none";

  if (state.isCompleted) {
    statusDot.className = "status-dot completed";
    statusLabel.textContent = "ပြီးဆုံးပါပြီ (Completed)";
  } else if (state.isRunning) {
    statusDot.className = "status-dot running";
    statusLabel.textContent = "အာရုံစိုက်နေသည် (Focusing)";
  } else {
    statusDot.className = "status-dot paused";
    statusLabel.textContent = "ခဏရပ်ထားသည် (Paused)";
  }

  projectNameEl.textContent = state.projectName || "---";
  subPieceNameEl.textContent = state.subPieceName || "---";
  usedTotalEl.textContent = formatUsedTotal(state.usedSeconds, state.totalSeconds);
}

export async function renderNotificationStatus(browserInstance: typeof browser): Promise<void> {
  const el = document.getElementById("notification-status");
  if (!el) return;

  const grantedMarkup =
    '<span class="status-dot on"></span><span class="notification-label">အသိပေးချက်ဖွင့်ထား (On)</span>';
  const pendingMarkup =
    '<span class="status-dot pending"></span><span class="notification-label">ခွင့်ပြုချက်မရသေးပါ (Pending)</span>';

  try {
    const level = await getNotifications(browserInstance).getPermissionLevel();
    if (level === "granted") {
      el.innerHTML = grantedMarkup;
    } else if (level === "denied") {
      el.innerHTML =
        '<span class="status-dot off"></span><span class="notification-label">အသိပေးချက်ပိတ်ထား (Off)</span><button id="notif-settings-link" class="link-btn" type="button">ဖွင့်ရန် (Open settings)</button>';
      const link = document.getElementById("notif-settings-link");
      link?.addEventListener("click", () => {
        browserInstance.tabs.create({ url: "chrome://settings/content/notifications" });
      });
    } else {
      el.innerHTML = pendingMarkup;
    }
  } catch {
    el.innerHTML = pendingMarkup;
  }
}

export function setupTestNotificationButton(): void {
  const btn = document.getElementById("test-notif-btn") as HTMLButtonElement | null;
  if (!btn) return;

  btn.onclick = async () => {
    const browserInstance = getBrowser();
    const iconUrl = browserInstance.runtime.getURL("/icon/128.png");
    await browserInstance.notifications.create("test-notif", {
      type: "basic",
      iconUrl,
      title: "FocusFlow AI — စမ်းသပ်ခြင်း",
      message: "အသိပေးချက်လုပ်ဆောင်နေသည် (Test notification working)",
    });
  };
}

export function setupOpenAppButton(): void {
  const btn = document.getElementById("open-app-btn") as HTMLButtonElement | null;
  if (!btn) return;

  btn.onclick = () => {
    getBrowser().tabs.create({ url: FOCUSFLOW_URL });
  };
}

export function setupStorageListener(): void {
  const browserInstance = getBrowser();
  browserInstance.storage.local.onChanged.addListener((changes: Record<string, { newValue?: unknown }>) => {
    if (changes[DISPLAY_STATE_KEY]) {
      const newState = changes[DISPLAY_STATE_KEY].newValue as DisplayState | undefined;
      renderPopup(newState ?? null);
    }
  });
}

export async function initPopup(): Promise<void> {
  const displayState = await getDisplayState();
  renderPopup(displayState);
  setupStorageListener();
  await renderNotificationStatus(getBrowser());
  setupTestNotificationButton();
  setupOpenAppButton();
}

// Auto-init when DOM is ready
if (typeof document !== "undefined" && document.getElementById("popup-content")) {
  initPopup();
}
