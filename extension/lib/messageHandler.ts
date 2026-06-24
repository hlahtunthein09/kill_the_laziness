import { setTimerState, getTimerState } from "../lib/storage";
import { startFocusAlarm, stopFocusAlarm } from "../lib/timerAlarm";
import type { ExtensionTimerState } from "../lib/types";
import type { Browser } from "webextension-polyfill";

let _browser: Browser | null = null;

export function setControlBrowserInstance(browser: Browser): void {
  _browser = browser;
}

async function getBrowser(): Promise<Browser> {
  if (!_browser) {
    const { browser } = await import("wxt/browser");
    _browser = browser;
  }
  return _browser!;
}

export type TimerMessage =
  | { action: "UPDATE_TIMER_STATE"; payload: ExtensionTimerState }
  | { action: "GET_TIMER_STATE" }
  | { action: "START_TIMER" }
  | { action: "PAUSE_TIMER" }
  | { action: "RESET_TIMER" };

export async function handleMessage(
  message: TimerMessage
): Promise<unknown> {
  switch (message.action) {
    case "UPDATE_TIMER_STATE": {
      const payload = message.payload;
      if (
        !payload ||
        typeof payload.projectId !== "string" ||
        typeof payload.projectElapsed !== "number" ||
        typeof payload.subPieceRemaining !== "number" ||
        typeof payload.isRunning !== "boolean" ||
        typeof payload.savedAt !== "number"
      ) {
        return { ok: false, error: "Invalid timer state payload" };
      }
      await setTimerState(payload);

      if (payload.isRunning) {
        await startFocusAlarm();
      } else {
        await stopFocusAlarm();
      }

      return { ok: true };
    }
    case "GET_TIMER_STATE": {
      const state = await getTimerState();
      return state ?? null;
    }
    case "START_TIMER": {
      const browser = await getBrowser();
      const tabs = await browser.tabs.query({ url: "http://localhost:3000/*" });
      const focusFlowTab = tabs[0];
      if (focusFlowTab && focusFlowTab.id !== undefined) {
        await browser.tabs.sendMessage(focusFlowTab.id, { action: "EXT_START_TIMER" });
        return { ok: true, forwarded: true };
      }
      return { ok: false, error: "No FocusFlow tab found" };
    }
    case "PAUSE_TIMER": {
      const browser = await getBrowser();
      const tabs = await browser.tabs.query({ url: "http://localhost:3000/*" });
      const focusFlowTab = tabs[0];
      if (focusFlowTab && focusFlowTab.id !== undefined) {
        await browser.tabs.sendMessage(focusFlowTab.id, { action: "EXT_PAUSE_TIMER" });
        return { ok: true, forwarded: true };
      }
      return { ok: false, error: "No FocusFlow tab found" };
    }
    case "RESET_TIMER": {
      const browser = await getBrowser();
      const tabs = await browser.tabs.query({ url: "http://localhost:3000/*" });
      const focusFlowTab = tabs[0];
      if (focusFlowTab && focusFlowTab.id !== undefined) {
        await browser.tabs.sendMessage(focusFlowTab.id, { action: "EXT_RESET_TIMER" });
        return { ok: true, forwarded: true };
      }
      return { ok: false, error: "No FocusFlow tab found" };
    }
    default: {
      const unknownAction = (message as Record<string, unknown>).action;
      console.warn("Unknown background message action:", unknownAction);
      return { ok: false, error: "Unknown action" };
    }
  }
}
