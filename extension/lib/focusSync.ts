import type { Browser } from "webextension-polyfill";
import type { DisplayState } from "./types";
import { setExtensionSettings } from "./settingsSync";

const STORE_KEY = "ff_focus_store";
const WEB_APP_SESSION_KEY = "ff_active_session";

export interface WebAppSession {
  projectId?: string;
  projectName?: string;
  subPieceId?: string;
  subPieceName?: string;
  projectElapsed?: number;
  subPieceRemaining?: number;
  targetTimeSeconds?: number;
  allocatedMinutes?: number;
  isRunning?: boolean;
  savedAt?: number;
}

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

export function readWebAppSession(): WebAppSession | null {
  try {
    const raw = localStorage.getItem(WEB_APP_SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;

    return parsed as WebAppSession;
  } catch {
    return null;
  }
}

export function buildDisplayState(session: WebAppSession): DisplayState {
  const isSubPieceSession = session.subPieceId !== undefined;
  const allocatedSeconds = (session.allocatedMinutes ?? 0) * 60;

  const usedSeconds = isSubPieceSession
    ? Math.max(0, allocatedSeconds - (session.subPieceRemaining ?? allocatedSeconds))
    : (session.projectElapsed ?? 0);

  const totalSeconds = isSubPieceSession
    ? allocatedSeconds
    : (session.targetTimeSeconds ?? 0);

  const isCompleted =
    !session.isRunning &&
    totalSeconds > 0 &&
    usedSeconds >= totalSeconds;

  return {
    projectName: session.projectName,
    subPieceName: session.subPieceName,
    usedSeconds,
    totalSeconds,
    isRunning: session.isRunning ?? false,
    isCompleted,
  };
}

let lastSentDisplayState: DisplayState | null = null;

export function resetDisplayStateSync(): void {
  lastSentDisplayState = null;
}

function displayStateChanged(next: DisplayState): boolean {
  if (!lastSentDisplayState) return true;
  return (
    lastSentDisplayState.projectName !== next.projectName ||
    lastSentDisplayState.subPieceName !== next.subPieceName ||
    lastSentDisplayState.usedSeconds !== next.usedSeconds ||
    lastSentDisplayState.totalSeconds !== next.totalSeconds ||
    lastSentDisplayState.isRunning !== next.isRunning ||
    lastSentDisplayState.isCompleted !== next.isCompleted
  );
}

export async function syncDisplayState(): Promise<void> {
  const session = readWebAppSession();
  if (!session) return;

  const next = buildDisplayState(session);
  if (!displayStateChanged(next)) return;

  try {
    const browser = await getBrowser();
    await browser.runtime.sendMessage({
      type: "SYNC_DISPLAY_STATE",
      payload: next,
    });
    lastSentDisplayState = next;
  } catch (err) {
    console.error("[focusSync] Failed to sync display state:", err);
  }
}

export function startFocusSyncPolling(intervalMs = 5000): void {
  syncExtensionSettings();
  syncDisplayState();

  // Event-driven sync: web app pushes display updates on state transitions
  window.addEventListener("ff:display-sync", () => {
    void syncDisplayState();
  });

  setInterval(() => {
    syncExtensionSettings();
    syncDisplayState();
  }, intervalMs);
}
