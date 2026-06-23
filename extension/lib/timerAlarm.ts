import type { Browser } from "webextension-polyfill";
import { getTimerState, setTimerState } from "./storage";
import { sessionCompleteNotification } from "../../lib/notifications";

const ALARM_NAME = "focus-timer";

let _browser: Browser | null = null;

export function setAlarmBrowserInstance(browser: Browser): void {
  _browser = browser;
}

async function getBrowser(): Promise<Browser> {
  if (!_browser) {
    const { browser } = await import("wxt/browser");
    _browser = browser;
  }
  return _browser!;
}

export async function startFocusAlarm(): Promise<void> {
  const browser = await getBrowser();
  browser.alarms.create(ALARM_NAME, { periodInMinutes: 1 });
}

export async function stopFocusAlarm(): Promise<void> {
  const browser = await getBrowser();
  browser.alarms.clear(ALARM_NAME);
}

export async function onAlarmTick(): Promise<void> {
  const state = await getTimerState();
  if (!state || !state.isRunning) {
    return;
  }

  const now = Date.now();
  const elapsedSinceSaveMs = now - state.savedAt;
  const elapsedSinceSaveSec = Math.floor(elapsedSinceSaveMs / 1000);

  if (elapsedSinceSaveSec <= 0) {
    return;
  }

  const updatedProjectElapsed = state.projectElapsed + elapsedSinceSaveSec;
  let updatedSubPieceRemaining = state.subPieceRemaining - elapsedSinceSaveSec;
  let updatedIsRunning = true;

  if (updatedSubPieceRemaining <= 0) {
    updatedSubPieceRemaining = 0;
    updatedIsRunning = false;

    const notif = sessionCompleteNotification;
    const browser = await getBrowser();
    await browser.notifications.create("session-complete", {
      type: "basic",
      iconUrl: "/icon/128.png",
      title: notif.title.my,
      message: notif.body.my,
    });

    await stopFocusAlarm();
  }

  await setTimerState({
    ...state,
    projectElapsed: updatedProjectElapsed,
    subPieceRemaining: updatedSubPieceRemaining,
    isRunning: updatedIsRunning,
    savedAt: now,
  });
}
