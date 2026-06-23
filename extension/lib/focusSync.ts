import type { Browser } from "webextension-polyfill";
import type { ExtensionTimerState } from "./types";
import { setExtensionSettings } from "./settingsSync";

const SESSION_KEY = "ff_active_session";
const STORE_KEY = "ff_focus_store";

let _browser: Browser | null = null;
let _lastRawSession: string | null = null;

export function setFocusSyncBrowserInstance(browser: Browser): void {
  _browser = browser;
}

async function getBrowser(): Promise<Browser> {
  if (!_browser) {
    // In production, import from wxt/browser
    const { browser } = await import("wxt/browser");
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
    const browser = await getBrowser();
    await browser.runtime.sendMessage({
      action: "UPDATE_TIMER_STATE",
      payload: state,
    });
    _lastRawSession = raw;
  } catch {
    // Silently catch errors (e.g., extension context invalidated)
  }
}

export async function syncExtensionSettings(): Promise<void> {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return;

    const record = parsed as Record<string, unknown>;
    if (!("settings" in record)) return;

    const settings = record.settings as Record<string, unknown>;
    const strictMode =
      "strictMode" in settings ? Boolean(settings.strictMode) : undefined;
    const forbiddenUrls =
      "forbiddenUrls" in settings && Array.isArray(settings.forbiddenUrls)
        ? settings.forbiddenUrls.filter((u): u is string => typeof u === "string")
        : undefined;

    await setExtensionSettings({ strictMode, forbiddenUrls });
  } catch (err) {
    console.error("[focusSync] Failed to sync extension settings:", err);
  }
}

export function startFocusSyncPolling(intervalMs = 5000): void {
  syncFocusSession();
  syncExtensionSettings();
  setInterval(() => {
    syncFocusSession();
    syncExtensionSettings();
  }, intervalMs);
}
