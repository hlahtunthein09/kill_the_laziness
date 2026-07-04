import type { Browser } from "webextension-polyfill";
import type { ExtensionTimerState } from "./types";
import {
  getTimerState,
  setTimerState,
  getLastMilestone,
  setLastMilestone,
  clearLastMilestone,
} from "./storage";
import { notifyMilestone, notifySessionComplete, notifyStart } from "./notifications";

const FOCUS_ALARM = "focus-timer";
const KEEP_ALIVE_ALARM = "ff-keep-alive";
const MAX_DRIFT_SECONDS = 60 * 60; // 60 minutes
const MILESTONE_INTERVAL_SECONDS = 60; // testing value; production is 300

let _browser: Browser | null = null;

const targetNotifiedForProjectRef = { projectId: "", notified: false };

export function _resetTargetNotifiedRef(): void {
  targetNotifiedForProjectRef.projectId = "";
  targetNotifiedForProjectRef.notified = false;
}

export function setTimerEngineBrowserInstance(browser: Browser): void {
  _browser = browser;
}

async function getBrowser(): Promise<Browser> {
  if (!_browser) {
    const { browser } = await import("wxt/browser");
    _browser = browser;
  }
  return _browser!;
}

function isValidState(state: unknown): state is ExtensionTimerState {
  if (typeof state !== "object" || state === null) {
    return false;
  }
  const s = state as Partial<ExtensionTimerState>;
  return (
    typeof s.projectId === "string" &&
    s.projectId.length > 0 &&
    typeof s.projectElapsed === "number" &&
    typeof s.subPieceRemaining === "number" &&
    typeof s.isRunning === "boolean" &&
    typeof s.savedAt === "number"
  );
}

async function createFocusAlarm(browser: Browser): Promise<void> {
  await browser.alarms.create(FOCUS_ALARM, { periodInMinutes: 1 });
}

async function createKeepAliveAlarm(browser: Browser): Promise<void> {
  await browser.alarms.create(KEEP_ALIVE_ALARM, { periodInMinutes: 4 });
}

async function clearSessionAlarms(browser: Browser): Promise<void> {
  await browser.alarms.clear(FOCUS_ALARM);
  await browser.alarms.clear(KEEP_ALIVE_ALARM);
}

async function broadcastStateUpdated(
  browser: Browser,
  updatedState: ExtensionTimerState
): Promise<void> {
  try {
    await browser.runtime.sendMessage({
      action: "STATE_UPDATED",
      payload: updatedState,
    });
  } catch (err) {
    console.warn("[timerEngine] STATE_UPDATED broadcast failed:", err);
  }
}

export async function startSession(state?: ExtensionTimerState): Promise<void> {
  console.log("[timerEngine] startSession called");
  let nextState: ExtensionTimerState;

  if (state !== undefined) {
    if (!isValidState(state)) {
      throw new Error("[timerEngine] startSession called with invalid state");
    }
    nextState = state;
  } else {
    const stored = await getTimerState();
    if (!stored || !isValidState(stored)) {
      throw new Error("[timerEngine] startSession called with no stored state");
    }
    nextState = stored;
  }

  nextState.isRunning = true;
  nextState.savedAt = Date.now();

  if (nextState.projectElapsed < MILESTONE_INTERVAL_SECONDS) {
    await clearLastMilestone();
  }

  // Reset target-crossed notification on a fresh start.
  targetNotifiedForProjectRef.projectId = nextState.projectId;
  targetNotifiedForProjectRef.notified = false;

  const browser = await getBrowser();
  await notifyStart(browser, nextState);

  await setTimerState(nextState);

  await broadcastStateUpdated(browser, nextState);
  await createFocusAlarm(browser);
  await createKeepAliveAlarm(browser);
}

export async function pauseSession(): Promise<void> {
  let state = await getTimerState();
  if (!state) {
    return;
  }

  if (state.isRunning) {
    await tick();
    state = await getTimerState();
    if (!state) {
      return;
    }
  }

  const updated: ExtensionTimerState = {
    ...state,
    isRunning: false,
    savedAt: Date.now(),
  };

  await setTimerState(updated);

  const browser = await getBrowser();
  await broadcastStateUpdated(browser, updated);
  await clearSessionAlarms(browser);
}

export async function resetSession(): Promise<void> {
  const state = await getTimerState();
  if (!state) {
    return;
  }

  const updated: ExtensionTimerState = {
    ...state,
    isRunning: false,
    projectElapsed: 0,
    subPieceRemaining: (state.allocatedMinutes ?? 0) * 60,
    savedAt: Date.now(),
  };

  await clearLastMilestone();
  await setTimerState(updated);

  const browser = await getBrowser();
  await broadcastStateUpdated(browser, updated);
  await clearSessionAlarms(browser);
}

export async function tick(): Promise<void> {
  const state = await getTimerState();
  if (!state || !state.isRunning) {
    console.log("[timerEngine] tick skipped — no running state");
    return;
  }

  const now = Date.now();
  const rawDrift = Math.floor((now - state.savedAt) / 1000);
  const drift = Math.max(0, Math.min(MAX_DRIFT_SECONDS, rawDrift));

  console.log("[timerEngine] tick drift=", drift, "savedAt=", state.savedAt, "now=", now);

  if (drift <= 0) {
    return;
  }

  const appliedSeconds = drift;
  const nextProjectElapsed = state.projectElapsed + appliedSeconds;
  const nextSubPieceRemaining = state.subPieceId
    ? Math.max(0, state.subPieceRemaining - appliedSeconds)
    : 0;

  const crossedTarget =
    typeof state.targetTimeSeconds === "number" &&
    state.targetTimeSeconds > 0 &&
    state.projectElapsed < state.targetTimeSeconds &&
    nextProjectElapsed >= state.targetTimeSeconds;

  const subPieceComplete =
    Boolean(state.subPieceId) &&
    state.subPieceRemaining > 0 &&
    nextSubPieceRemaining === 0;

  const nextIsRunning = !subPieceComplete;
  const browser = await getBrowser();

  if (crossedTarget && !targetNotifiedForProjectRef.notified) {
    targetNotifiedForProjectRef.notified = true;
    targetNotifiedForProjectRef.projectId = state.projectId;
    console.log("[timerEngine] project target reached");
    await notifySessionComplete(browser, state, true);
  }

  if (subPieceComplete) {
    console.log("[timerEngine] sub-piece complete");
    // Target takes precedence: if both happen in the same tick the project-target
    // notification has already been sent above.
    if (!crossedTarget) {
      await notifySessionComplete(browser, state, false);
    }

    await clearSessionAlarms(browser);
    await clearLastMilestone();
  } else if (!crossedTarget) {
    const currentMilestone = Math.floor(nextProjectElapsed / MILESTONE_INTERVAL_SECONDS);
    const lastMilestone = (await getLastMilestone()) ?? 0;

    if (currentMilestone >= 1 && currentMilestone > lastMilestone) {
      console.log("[timerEngine] milestone reached:", currentMilestone);
      await notifyMilestone(browser, nextProjectElapsed, nextSubPieceRemaining);

      await setLastMilestone(currentMilestone);
    }
  }

  const updated: ExtensionTimerState = {
    ...state,
    projectElapsed: nextProjectElapsed,
    subPieceRemaining: nextSubPieceRemaining,
    isRunning: nextIsRunning,
    savedAt: now,
  };

  await setTimerState(updated);
  await broadcastStateUpdated(browser, updated);
}

export async function restoreOnStartup(): Promise<void> {
  const state = await getTimerState();
  if (!state || !state.isRunning) {
    return;
  }

  const browser = await getBrowser();
  await createFocusAlarm(browser);
  await createKeepAliveAlarm(browser);
  await tick();
}
