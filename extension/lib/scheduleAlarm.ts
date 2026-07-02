import type { Browser } from "webextension-polyfill";
import { getTimerState } from "./storage";

const SCHEDULE_ALARM_NAME = "schedule-check";

let _browser: Browser | null = null;

export function setScheduleAlarmBrowserInstance(browser: Browser): void {
  _browser = browser;
}

async function getBrowser(): Promise<Browser> {
  if (!_browser) {
    const { browser } = await import("wxt/browser");
    _browser = browser;
  }
  return _browser!;
}

export async function startScheduleAlarm(): Promise<void> {
  const browser = await getBrowser();
  browser.alarms.create(SCHEDULE_ALARM_NAME, { periodInMinutes: 1 });
}

export async function stopScheduleAlarm(): Promise<void> {
  const browser = await getBrowser();
  browser.alarms.clear(SCHEDULE_ALARM_NAME);
}

const lastNotifiedRef = { id: "", minute: -1 };

export function _resetLastNotifiedRef(): void {
  lastNotifiedRef.id = "";
  lastNotifiedRef.minute = -1;
}

export async function onScheduleAlarmTick(): Promise<void> {
  const state = await getTimerState();
  if (!state?.schedules || state.schedules.length === 0) return;

  const now = new Date();
  const currentDay = now.getDay();
  const currentMinute = now.getHours() * 60 + now.getMinutes();

  const due = state.schedules.find((s) => {
    if (!s.enabled || s.dayOfWeek !== currentDay) return false;
    const [h, m] = s.startTime.split(":").map(Number);
    const scheduleMinute = h * 60 + m;
    return scheduleMinute === currentMinute;
  });

  if (!due) return;
  if (lastNotifiedRef.id === due.id && lastNotifiedRef.minute === currentMinute) return;

  lastNotifiedRef.id = due.id;
  lastNotifiedRef.minute = currentMinute;

  const browser = await getBrowser();
  const iconUrl = browser.runtime.getURL("/icon/128.png");
  try {
    await browser.notifications.create("schedule-due", {
      type: "basic",
      iconUrl,
      title: "FocusFlow AI — စီစဉ်ထားသော focus အချိန် ရောက်ပါပြီ",
      message: `${state.projectName ?? "ပရောဂျက်"} · ${state.subPieceName ?? "အထွေထွေ focus"} · ${due.startTime}`,
    });
  } catch (err) {
    console.error("[scheduleAlarm] Failed to show schedule notification:", err);
  }
}
