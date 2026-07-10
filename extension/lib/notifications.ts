/**
 * FocusFlow AI — Shared Extension Notification Service
 *
 * Single safe path for all native OS notifications from the extension.
 * Checks permission, catches all errors, and guarantees unique IDs.
 */

import type { Browser } from "webextension-polyfill";
import type { FocusSessionSchedule } from "../../lib/types";
import { getMotivation } from "./motivation";
import type { ExtensionTimerState } from "./types";
import type { NotificationPayload } from "./notificationEngine";

declare module "webextension-polyfill" {
  namespace Notifications {
    interface CreateNotificationOptions {
      requireInteraction?: boolean;
    }
  }
}

interface NotificationsWithPermission {
  getPermissionLevel(): Promise<string>;
}

let idCounter = 0;

export function getIconUrl(browser: Browser): string | undefined {
  try {
    return browser.runtime.getURL("/icon/128.png");
  } catch (err) {
    console.error("[notifications] failed to resolve icon URL", err);
    return undefined;
  }
}

export async function withPermission(
  browser: Browser,
  create: () => Promise<void>,
): Promise<void> {
  try {
    const notifications = browser.notifications as unknown as NotificationsWithPermission;
    const level = await notifications.getPermissionLevel();
    console.log("[notifications] permission level:", level);
    if (level !== "granted") {
      console.warn("[notifications] permission not granted; skipping notification");
      return;
    }
    console.log("[notifications] creating notification");
    await create();
  } catch (err) {
    console.error("[notifications] permission/create error", err);
  }
}

export function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++idCounter}`;
}

function suffix(body: string, persistent: boolean): string {
  return persistent ? `${body} — (tap to dismiss)` : `${body} — (auto-dismiss)`;
}

export const NOTIF_CLEAR_ALARM_PREFIX = "clear-notif-";

export async function scheduleNotificationClear(
  browser: Browser,
  notificationId: string,
  delayMs: number,
): Promise<void> {
  try {
    const when = Date.now() + delayMs;
    console.log(
      "[notifications] scheduleNotificationClear",
      notificationId,
      "alarmName=",
      `${NOTIF_CLEAR_ALARM_PREFIX}${notificationId}`,
      "when=",
      when,
      "now=",
      Date.now(),
    );
    await browser.alarms.create(`${NOTIF_CLEAR_ALARM_PREFIX}${notificationId}`, {
      when,
    });
  } catch {
    // Silently ignore failures so a clear-schedule problem never crashes the flow.
  }
}

export async function notifyFromPayload(
  browser: Browser,
  payload: NotificationPayload,
): Promise<void> {
  const persistent =
    payload.id.startsWith("focus-almost-") || payload.id.startsWith("focus-complete-");
  const iconUrl = getIconUrl(browser);

  await withPermission(browser, async () => {
    await browser.notifications.create(payload.id, {
      type: "basic",
      iconUrl: iconUrl ?? browser.runtime.getURL("/icon/128.png"),
      title: payload.title,
      message: suffix(payload.message, persistent),
      priority: payload.priority ?? 2,
      requireInteraction: persistent,
    });
    if (!persistent) {
      await scheduleNotificationClear(browser, payload.id, 3000);
    }
  });
}

export async function notifyScheduleDue(
  browser: Browser,
  state: ExtensionTimerState,
  schedule: FocusSessionSchedule,
): Promise<void> {
  const remainingSeconds = Math.max(0, schedule.durationMinutes * 60);

  const msg = getMotivation({
    elapsedSeconds: 0,
    remainingSeconds,
    isRunning: false,
    completedToday: 0,
  });

  const projectName = state.projectName ?? "ပရောဂျက်";
  const iconUrl = getIconUrl(browser);
  const id = nextId("schedule-due");

  console.log("[notifications] notifyScheduleDue schedule=", schedule.id, "project=", projectName);

  await withPermission(browser, async () => {
    await browser.notifications.create(id, {
      type: "basic",
      iconUrl: iconUrl ?? browser.runtime.getURL("/icon/128.png"),
      title: "FocusFlow AI — စီစဉ်ထားသော focus အချိန် ရောက်ပါပြီ",
      message: `${msg.my} — ${msg.en} · ${projectName} · ${schedule.startTime}`,
      priority: 2,
      requireInteraction: true,
    });
  });
}

export async function notifyDistractionBlocked(
  browser: Browser,
  _url?: string,
): Promise<void> {
  const iconUrl = getIconUrl(browser);
  const id = nextId("distraction-blocked");

  console.log("[notifications] notifyDistractionBlocked");

  await withPermission(browser, async () => {
    await browser.notifications.create(id, {
      type: "basic",
      iconUrl: iconUrl ?? browser.runtime.getURL("/icon/128.png"),
      title: "Distraction Blocked — Focus Protected",
      message:
        "Your time is valuable. We blocked a distracting site so you can stay focused.",
      requireInteraction: true,
    });
  });
}
