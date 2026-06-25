import { browser } from "wxt/browser";
import { handleMessage } from "../lib/messageHandler";
import { onAlarmTick } from "../lib/timerAlarm";
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

  browser.runtime.onMessage.addListener((message: unknown) => {
    return handleMessage(message as Parameters<typeof handleMessage>[0]);
  });

  browser.alarms.onAlarm.addListener((alarm: AlarmEvent) => {
    if (alarm.name === "focus-timer") {
      onAlarmTick();
    } else if (alarm.name === "schedule-check") {
      onScheduleAlarmTick().catch((err: unknown) => {
        console.error("Schedule alarm error:", err);
      });
    }
  });

  browser.tabs.onUpdated.addListener((tabId: number, changeInfo: { status?: string; url?: string }) => {
    handleTabUpdate(tabId, changeInfo).catch((err: unknown) => {
      console.error("FocusFlow tab redirect error:", err);
    });
  });
});
