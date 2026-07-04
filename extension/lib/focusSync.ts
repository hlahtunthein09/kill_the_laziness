import type { Browser } from "webextension-polyfill";
import type { FocusSessionSchedule } from "@/lib/types";
import { setExtensionSettings } from "./settingsSync";

const STORE_KEY = "ff_focus_store";

let _browser: Browser | null = null;

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

function readSchedulesFromStore(): FocusSessionSchedule[] | undefined {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return undefined;

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return undefined;

    const record = parsed as Record<string, unknown>;
    if (!("state" in record)) return undefined;

    const state = record.state as Record<string, unknown>;
    if (!("schedules" in state) || !Array.isArray(state.schedules)) return undefined;

    return state.schedules as FocusSessionSchedule[];
  } catch {
    return undefined;
  }
}

// Timer state is now owned by the extension service worker (timerEngine.ts).
// The web app sends commands (START/PAUSE/RESET_TIMER) and reads state via
// GET_TIMER_STATE / STATE_UPDATED broadcasts. We no longer forward the web
// app's localStorage session here to avoid fighting with the engine.
export async function syncFocusSession(): Promise<void> {
  // Deprecated: extension owns active session state.
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
  syncExtensionSettings();
  setInterval(() => {
    syncExtensionSettings();
  }, intervalMs);
}
