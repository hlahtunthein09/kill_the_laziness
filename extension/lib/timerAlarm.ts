import type { Browser } from "webextension-polyfill";
import { getTimerState, setTimerState, getLastMilestone, setLastMilestone, clearLastMilestone } from "./storage";
import { getMotivation } from "./motivation";

const ALARM_NAME = "focus-timer";
// Set to 60s for rapid extension testing; restore to 300s (5 min) for daily use.
const MILESTONE_INTERVAL_SECONDS = 60;

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

    const isProjectComplete =
      typeof state.targetTimeSeconds === "number" &&
      state.targetTimeSeconds > 0 &&
      updatedProjectElapsed >= state.targetTimeSeconds;

    const name = isProjectComplete
      ? (state.projectName ?? "ပရောဂျက်")
      : (state.subPieceName ?? "အထွေထွေ focus");

    const title = isProjectComplete
      ? `${name} အတွက် အချိန်ပြည့်ပါပြီ`
      : `${name} အတွက် အချိန် ပြည့်ပါပြီ`;

    const message = isProjectComplete
      ? `${name} target reached. Proud of your focus.`
      : `${name} is complete. Let's move on to the next one.`;

    const browser = await getBrowser();
    const iconUrl = browser.runtime.getURL("/icon/128.png");
    try {
      await browser.notifications.create("session-complete", {
        type: "basic",
        iconUrl,
        title,
        message,
      });
    } catch (err) {
      console.error("[timerAlarm] Failed to show session-complete notification:", err);
    }

    await clearLastMilestone();
    await stopFocusAlarm();
  } else {
    // Milestone notification logic (every N seconds of project elapsed time)
    const currentMilestone = Math.floor(updatedProjectElapsed / MILESTONE_INTERVAL_SECONDS);
    const lastMilestone = (await getLastMilestone()) ?? 0;

    if (currentMilestone >= 1 && currentMilestone > lastMilestone) {
      const motivation = getMotivation({
        elapsedSeconds: updatedProjectElapsed,
        remainingSeconds: updatedSubPieceRemaining,
        isRunning: true,
        completedToday: 0,
      });

      const browser = await getBrowser();
      const iconUrl = browser.runtime.getURL("/icon/128.png");
      try {
        await browser.notifications.create("focus-milestone", {
          type: "basic",
          iconUrl,
          title: "FocusFlow AI — ရှေ့ဆက်နေတယ်",
          message: `${motivation.my} (${motivation.en})`,
        });
      } catch (err) {
        console.error("[timerAlarm] Failed to show milestone notification:", err);
      }

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
