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
  const pauseBtn = document.getElementById("pause-btn");
  const resetBtn = document.getElementById("reset-btn");
  if (!pauseBtn || !resetBtn) return;

  if (!state || !state.isRunning) {
    pauseBtn.style.display = "none";
    resetBtn.style.display = "none";
    return;
  }

  pauseBtn.style.display = "block";
  resetBtn.style.display = "block";

  pauseBtn.addEventListener("click", () => {
    getBrowser().runtime.sendMessage({ action: "PAUSE_TIMER" });
  });

  resetBtn.addEventListener("click", () => {
    getBrowser().runtime.sendMessage({ action: "RESET_TIMER" });
  });
}

export function setupStartButton(state: ExtensionTimerState | null): void {
  const startBtn = document.getElementById("start-btn");
  if (!startBtn) return;

  if (!state || state.isRunning) {
    startBtn.style.display = "none";
    return;
  }

  startBtn.style.display = "block";
  startBtn.addEventListener("click", () => {
    getBrowser().runtime.sendMessage({ action: "START_TIMER" });
  });
}

export async function initPopup(): Promise<void> {
  const result = await getBrowser().storage.local.get(TIMER_STATE_KEY);
  const state = (result[TIMER_STATE_KEY] as ExtensionTimerState | undefined) ?? null;
  renderPopup(state);
}

function setupOpenAppButton(): void {
  const btn = document.getElementById("open-app-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    getBrowser().tabs.create({ url: FOCUSFLOW_URL });
  });
}

// Auto-init when DOM is ready
if (typeof document !== "undefined" && document.getElementById("popup-content")) {
  initPopup();
  setupOpenAppButton();
}
