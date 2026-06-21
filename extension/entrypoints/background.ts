import { browser } from "wxt/browser";
import { handleMessage } from "../lib/messageHandler";
import { onAlarmTick } from "../lib/timerAlarm";
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

  browser.runtime.onMessage.addListener((message: unknown) => {
    return handleMessage(message as Parameters<typeof handleMessage>[0]);
  });

  browser.alarms.onAlarm.addListener((alarm: AlarmEvent) => {
    if (alarm.name === "focus-timer") {
      onAlarmTick();
    }
  });

  browser.tabs.onUpdated.addListener((tabId: number, changeInfo: { status?: string; url?: string }) => {
    handleTabUpdate(tabId, changeInfo).catch((err: unknown) => {
      console.error("FocusFlow tab redirect error:", err);
    });
  });
});
