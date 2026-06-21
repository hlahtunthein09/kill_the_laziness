import type { Browser } from "webextension-polyfill";
import type { ExtensionTimerState } from "./types";

const SESSION_KEY = "ff_active_session";

let _browser: Browser | null = null;
let _lastRawSession: string | null = null;

export function setFocusSyncBrowserInstance(browser: Browser): void {
  _browser = browser;
}

function getBrowser(): Browser {
  if (!_browser) {
    // In production, import from wxt/browser
    const { browser } = require("wxt/browser");
    _browser = browser;
  }
  return _browser!;
}

export function resetFocusSync(): void {
  _lastRawSession = null;
}

export function readFocusSession(): ExtensionTimerState | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;

    if (
      parsed &&
      typeof parsed === "object" &&
      "projectId" in parsed &&
      typeof (parsed as Record<string, unknown>).projectId === "string" &&
      "projectElapsed" in parsed &&
      typeof (parsed as Record<string, unknown>).projectElapsed === "number" &&
      "subPieceRemaining" in parsed &&
      typeof (parsed as Record<string, unknown>).subPieceRemaining === "number" &&
      "isRunning" in parsed &&
      typeof (parsed as Record<string, unknown>).isRunning === "boolean" &&
      "savedAt" in parsed &&
      typeof (parsed as Record<string, unknown>).savedAt === "number"
    ) {
      return parsed as ExtensionTimerState;
    }

    return null;
  } catch {
    return null;
  }
}

export async function syncFocusSession(): Promise<void> {
  const raw = localStorage.getItem(SESSION_KEY);

  if (!raw) {
    _lastRawSession = null;
    return;
  }

  if (raw === _lastRawSession) {
    return;
  }

  const state = readFocusSession();
  if (!state) {
    _lastRawSession = raw;
    return;
  }

  try {
    await getBrowser().runtime.sendMessage({
      action: "UPDATE_TIMER_STATE",
      payload: state,
    });
    _lastRawSession = raw;
  } catch {
    // Silently catch errors (e.g., extension context invalidated)
  }
}

export function startFocusSyncPolling(intervalMs = 5000): void {
  syncFocusSession();
  setInterval(() => {
    syncFocusSession();
  }, intervalMs);
}
