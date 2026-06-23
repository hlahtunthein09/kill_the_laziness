import type { Browser } from "webextension-polyfill";
import { getTimerState, setTimerState, getLastMilestone, setLastMilestone, clearLastMilestone } from "./storage";
import { sessionCompleteNotification } from "../../lib/notifications";
import { getMotivation } from "./motivation";

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

    await clearLastMilestone();
    await stopFocusAlarm();
  } else {
    // Milestone notification logic (every 5 minutes of project elapsed time)
    const currentMilestone = Math.floor(updatedProjectElapsed / 300);
    const lastMilestone = (await getLastMilestone()) ?? 0;

    if (currentMilestone >= 1 && currentMilestone > lastMilestone) {
      const motivation = getMotivation({
        elapsedSeconds: updatedProjectElapsed,
        remainingSeconds: updatedSubPieceRemaining,
        isRunning: true,
        completedToday: 0,
      });

      const browser = await getBrowser();
      await browser.notifications.create("focus-milestone", {
        type: "basic",
        iconUrl: "/icon/128.png",
        title: "FocusFlow AI — ရှေ့ဆက်နေတယ်",
        message: `${motivation.my} (${motivation.en})`,
      });

      await setLastMilestone(currentMilestone);
    }
  }

  await setTimerState({
    ...state,
    projectElapsed: updatedProjectElapsed,
    subPieceRemaining: updatedSubPieceRemaining,
    isRunning: updatedIsRunning,
    savedAt: now,
  });
}
