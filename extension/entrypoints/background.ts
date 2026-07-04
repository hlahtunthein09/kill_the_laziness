import { browser } from "wxt/browser";
import { handleMessage } from "../lib/messageHandler";
import {
  tick as timerEngineTick,
  restoreOnStartup,
} from "../lib/timerEngine";
import {
  startScheduleAlarm,
  onScheduleAlarmTick,
} from "../lib/scheduleAlarm";
import {
  handleTabUpdate,
  setRedirectBrowserInstance,
} from "../lib/redirect";

interface AlarmEvent {
  name: string;
}

export default defineBackground(() => {
  console.log("FocusFlow AI background service worker started");

  setRedirectBrowserInstance(browser);
  startScheduleAlarm().catch((err: unknown) => {
    console.error("Failed to start schedule alarm:", err);
  });

  restoreOnStartup().catch((err: unknown) => {
    console.error("Failed to restore timer session on startup:", err);
  });

  browser.runtime.onMessage.addListener((message: unknown) => {
    const action = (message as { action?: string }).action;
    console.log("[background] received message:", action);
    return handleMessage(message as Parameters<typeof handleMessage>[0]);
  });

  browser.alarms.onAlarm.addListener((alarm: AlarmEvent) => {
    if (alarm.name === "focus-timer") {
      timerEngineTick().catch((err: unknown) => {
        console.error("Focus timer tick error:", err);
      });
    } else if (alarm.name === "schedule-check") {
      onScheduleAlarmTick().catch((err: unknown) => {
        console.error("Schedule alarm error:", err);
      });
    } else if (alarm.name === "ff-keep-alive") {
      console.log("[background] ff-keep-alive alarm fired");
    }
  });

  browser.tabs.onUpdated.addListener((tabId: number, changeInfo: { status?: string; url?: string }) => {
    handleTabUpdate(tabId, changeInfo).catch((err: unknown) => {
      console.error("FocusFlow tab redirect error:", err);
    });
  });
});
