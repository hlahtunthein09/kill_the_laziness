import { browser } from "wxt/browser";
import { handleMessage } from "../lib/messageHandler";
import { onAlarmTick } from "../lib/timerAlarm";

interface AlarmEvent {
  name: string;
}

export default defineBackground(() => {
  console.log("FocusFlow AI background service worker started");

  browser.runtime.onMessage.addListener((message: unknown) => {
    return handleMessage(message as Parameters<typeof handleMessage>[0]);
  });

  browser.alarms.onAlarm.addListener((alarm: AlarmEvent) => {
    if (alarm.name === "focus-timer") {
      onAlarmTick();
    }
  });
});
