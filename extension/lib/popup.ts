import { browser } from "wxt/browser";
import { formatDuration } from "../../lib/time";
import type { ExtensionTimerState } from "./types";

export const TIMER_STATE_KEY = "ff_extension_timer";
export const FOCUSFLOW_URL = "http://localhost:3000/timer";

let _browserInstance: typeof browser | null = null;

export function setPopupBrowserInstance(instance: typeof browser): void {
  _browserInstance = instance;
}

function getBrowser(): typeof browser {
  return _browserInstance ?? browser;
}

interface NotificationsWithPermission {
  getPermissionLevel(): Promise<string>;
}

function getNotifications(browserInstance: typeof browser): NotificationsWithPermission {
  return browserInstance.notifications as unknown as NotificationsWithPermission;
}

export function renderPopup(state: ExtensionTimerState | null): void {
  const contentEl = document.getElementById("popup-content");
  const emptyEl = document.getElementById("empty-state");
  const statusDot = document.getElementById("status-dot");
  const statusLabel = document.getElementById("status-label");
  const projectNameEl = document.getElementById("project-name");
  const subPieceNameEl = document.getElementById("subpiece-name");
  const elapsedEl = document.getElementById("elapsed-time");
  const remainingEl = document.getElementById("remaining-time");

  if (!contentEl || !emptyEl || !statusDot || !statusLabel || !projectNameEl || !subPieceNameEl || !elapsedEl || !remainingEl) {
    return;
  }

  if (!state) {
    contentEl.style.display = "none";
    emptyEl.style.display = "block";
    return;
  }

  contentEl.style.display = "block";
  emptyEl.style.display = "none";

  // Status
  if (state.isRunning) {
    statusDot.className = "status-dot running";
    statusLabel.textContent = "အာရုံစိုက်နေသည် (Focusing)";
  } else {
    statusDot.className = "status-dot paused";
    statusLabel.textContent = "ခဏရပ်ထားသည် (Paused)";
  }

  // Names
  projectNameEl.textContent = state.projectName || state.projectId;
  subPieceNameEl.textContent = state.subPieceName || state.subPieceId || "---";

  // Times
  elapsedEl.textContent = formatDuration(state.projectElapsed);
  remainingEl.textContent = formatDuration(state.subPieceRemaining);

  setupStartButton(state);
  setupPauseResetButtons(state);
}

export function setupPauseResetButtons(state: ExtensionTimerState | null): void {
  const pauseBtn = document.getElementById("pause-btn") as HTMLButtonElement | null;
  const resetBtn = document.getElementById("reset-btn") as HTMLButtonElement | null;
  if (!pauseBtn || !resetBtn) return;

  if (!state || !state.isRunning) {
    pauseBtn.style.display = "none";
    resetBtn.style.display = "none";
    pauseBtn.onclick = null;
    resetBtn.onclick = null;
    return;
  }

  pauseBtn.style.display = "block";
  resetBtn.style.display = "block";

  pauseBtn.onclick = () => {
    getBrowser().runtime.sendMessage({ action: "PAUSE_TIMER" });
  };

  resetBtn.onclick = () => {
    getBrowser().runtime.sendMessage({ action: "RESET_TIMER" });
  };
}

export function setupStartButton(state: ExtensionTimerState | null): void {
  const startBtn = document.getElementById("start-btn") as HTMLButtonElement | null;
  if (!startBtn) return;

  if (!state || state.isRunning) {
    startBtn.style.display = "none";
    startBtn.onclick = null;
    return;
  }

  startBtn.style.display = "block";
  startBtn.textContent = "စတင် (Start)";
  startBtn.disabled = false;

  startBtn.onclick = () => {
    if (!state) return;

    startBtn.textContent = "စတင်နေပါပြီ… (Starting…)";
    startBtn.disabled = true;

    window.setTimeout(() => {
      startBtn.textContent = "စတင် (Start)";
      startBtn.disabled = false;
    }, 1000);

    const payload: ExtensionTimerState = {
      ...state,
      isRunning: true,
      savedAt: Date.now(),
    };
    getBrowser().runtime.sendMessage({ action: "START_TIMER", payload });
  };
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

export async function initPopup(): Promise<void> {
  const result = await getBrowser().storage.local.get(TIMER_STATE_KEY);
  const state = (result[TIMER_STATE_KEY] as ExtensionTimerState | undefined) ?? null;
  renderPopup(state);
  await renderNotificationStatus(getBrowser());
  setupTestNotificationButton();
  setupOpenAppButton();
}

// Auto-init when DOM is ready
if (typeof document !== "undefined" && document.getElementById("popup-content")) {
  initPopup();
}
