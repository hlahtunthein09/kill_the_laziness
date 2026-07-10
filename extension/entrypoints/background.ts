import type { Browser } from "webextension-polyfill";
import { browser } from "wxt/browser";
import { handleMessage } from "../lib/messageHandler";
import { onFocusAlarm } from "../lib/notificationEngine";
import { restoreOnStartup } from "../lib/timerEngine";
import { startScheduleAlarm, onScheduleAlarmTick } from "../lib/scheduleAlarm";
import { handleTabUpdate, setRedirectBrowserInstance } from "../lib/redirect";

let _browser: Browser | null = null;
export const setBackgroundBrowserInstance = (b: Browser): void => { _browser = b; };
const getBrowser = (): Browser => _browser ?? (browser as Browser);

interface AlarmEvent { name: string; }

let _handleMessage = handleMessage;
export const setBackgroundMessageHandler = (h: typeof handleMessage): void => { _handleMessage = h; };

let _onFocusAlarm = onFocusAlarm;
export const setBackgroundFocusAlarmHandler = (h: typeof onFocusAlarm): void => { _onFocusAlarm = h; };

let _restoreOnStartup = restoreOnStartup;
export const setBackgroundRestoreOnStartup = (fn: typeof restoreOnStartup): void => { _restoreOnStartup = fn; };

export default defineBackground(() => {
  const b = getBrowser();

  setRedirectBrowserInstance(b);
  startScheduleAlarm().catch((err: unknown) => console.error("Failed to start schedule alarm:", err));
  _restoreOnStartup().catch((err: unknown) => console.error("Failed to restore timer session on startup:", err));

  b.runtime.onMessage.addListener((message: unknown) => {
    return _handleMessage(message as Parameters<typeof handleMessage>[0]);
  });

  b.alarms.onAlarm.addListener((alarm: AlarmEvent) => {
    if (alarm.name.startsWith("focus-")) {
      _onFocusAlarm(b, alarm.name).catch((err: unknown) => console.error("Focus stage alarm error:", err));
    } else if (alarm.name === "schedule-check") {
      onScheduleAlarmTick().catch((err: unknown) => console.error("Schedule alarm error:", err));
    } else if (alarm.name.startsWith("clear-notif-")) {
      const notificationId = alarm.name.slice("clear-notif-".length);
      b.notifications.clear(notificationId).catch((err: unknown) => console.error("[background] clear error", err));
    }
  });

  b.tabs.onUpdated.addListener((tabId: number, changeInfo: { status?: string; url?: string }) => {
    handleTabUpdate(tabId, changeInfo).catch((err: unknown) => {
      console.error("FocusFlow tab redirect error:", err);
    });
  });
});
