import { browser } from "wxt/browser";
import { formatDuration } from "../../lib/time";
import type { ExtensionTimerState, ActiveSessionToken } from "./types";

export const FOCUSFLOW_URL = "http://localhost:3000/timer";
const ACTIVE_SESSION_KEY = "ff_active_session_v2";

let _browserInstance: typeof browser | null = null;

export function setPopupBrowserInstance(instance: typeof browser): void {
  _browserInstance = instance;
}

function getBrowser(): typeof browser {
  return _browserInstance ?? browser;
}

async function getActiveSessionToken(): Promise<ActiveSessionToken | null> {
  try {
    const response = (await getBrowser().runtime.sendMessage({
      type: "GET_ACTIVE_SESSION",
    })) as { ok: boolean; token: ActiveSessionToken | null } | undefined;
    return response?.ok ? (response.token ?? null) : null;
  } catch {
    return null;
  }
}

async function getStoredSessionToken(): Promise<ActiveSessionToken | null> {
  try {
    const result = await getBrowser().storage.local.get(ACTIVE_SESSION_KEY);
    const stored = (result[ACTIVE_SESSION_KEY] as { token?: ActiveSessionToken } | undefined)?.token;
    return stored ?? null;
  } catch {
    return null;
  }
}

function tokenToDisplayState(token: ActiveSessionToken): ExtensionTimerState {
  const drift = token.isRunning
    ? Math.min(60 * 60, (Date.now() - token.resumedAt) / 1000)
    : 0;
  const elapsedActive = token.elapsedActiveSeconds + drift;
  const projectElapsed = token.projectElapsedBaseline + elapsedActive;
  const subPieceRemaining =
    token.subPieceRemainingBaseline !== undefined
      ? Math.max(0, token.subPieceRemainingBaseline - elapsedActive)
      : Math.max(0, token.targetTimeSeconds - elapsedActive);

  return {
    projectId: token.projectId,
    subPieceId: token.subPieceId,
    projectName: token.projectName,
    subPieceName: token.subPieceName,
    projectElapsed,
    subPieceRemaining,
    targetTimeSeconds: token.targetTimeSeconds,
    isRunning: token.isRunning,
    savedAt: Date.now(),
    projectElapsedBaseline: token.projectElapsedBaseline,
    subPieceRemainingBaseline: token.subPieceRemainingBaseline,
  };
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
  const elapsedLabel = document.getElementById("elapsed-label");
  const remainingLabel = document.getElementById("remaining-label");

  if (!contentEl || !emptyEl || !statusDot || !statusLabel || !projectNameEl || !subPieceNameEl || !elapsedEl || !remainingEl || !elapsedLabel || !remainingLabel) {
    return;
  }

  if (!state) {
    contentEl.style.display = "none";
    emptyEl.style.display = "block";
    return;
  }

  contentEl.style.display = "block";
  emptyEl.style.display = "none";

  const isCompleted = state.subPieceId
    ? state.subPieceRemaining <= 0
    : (state.targetTimeSeconds ?? 0) > 0 && state.projectElapsed >= (state.targetTimeSeconds ?? 0);

  // Status
  if (isCompleted) {
    statusDot.className = "status-dot completed";
    statusLabel.textContent = "ပြီးစီး (Completed)";
  } else if (state.isRunning) {
    statusDot.className = "status-dot running";
    statusLabel.textContent = "အာရုံစိုက်နေသည် (Focusing)";
  } else {
    statusDot.className = "status-dot paused";
    statusLabel.textContent = "ခဏရပ်ထားသည် (Paused)";
  }

  // Names
  projectNameEl.textContent = state.projectName || state.projectId;
  subPieceNameEl.textContent = state.subPieceName || state.subPieceId || "---";

  // Scope elapsed/remaining to the active focus mode
  const isSubPiece = !!state.subPieceId;
  const elapsedSeconds = isSubPiece
    ? Math.max(0, (state.subPieceRemainingBaseline ?? state.subPieceRemaining) - state.subPieceRemaining)
    : state.projectElapsed;
  const remainingSeconds = isSubPiece
    ? state.subPieceRemaining
    : Math.max(0, (state.targetTimeSeconds ?? 0) - state.projectElapsed);

  elapsedLabel.textContent = isSubPiece
    ? "အစိတ်အပိုင်း ကြာချိန် (Sub-piece elapsed)"
    : "ပရောဂျက် ကြာချိန် (Project elapsed)";
  remainingLabel.textContent = isSubPiece
    ? "အစိတ်အပိုင်း ကျန်ချိန် (Sub-piece remaining)"
    : "ပရောဂျက် ကျန်ချိန် (Project remaining)";

  elapsedEl.textContent = formatDuration(elapsedSeconds);
  remainingEl.textContent = formatDuration(remainingSeconds);
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
  const token = await getActiveSessionToken();
  console.log("[popup] token from message:", token);
  const displayToken = token ?? (await getStoredSessionToken());
  console.log("[popup] display token:", displayToken);
  const displayState = displayToken ? tokenToDisplayState(displayToken) : null;
  renderPopup(displayState);
  await renderNotificationStatus(getBrowser());
  setupTestNotificationButton();
  setupOpenAppButton();
}

// Auto-init when DOM is ready
if (typeof document !== "undefined" && document.getElementById("popup-content")) {
  initPopup();
}
