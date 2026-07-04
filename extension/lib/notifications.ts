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

export async function notifyMilestone(
  browser: Browser,
  elapsedSeconds: number,
  remainingSeconds: number,
): Promise<void> {
  const clampedElapsed = Math.max(0, elapsedSeconds);
  const clampedRemaining = Math.max(0, remainingSeconds);

  const msg = getMotivation({
    elapsedSeconds: clampedElapsed,
    remainingSeconds: clampedRemaining,
    isRunning: true,
    completedToday: 0,
  });

  const iconUrl = getIconUrl(browser);
  const id = nextId("focus-milestone");

  console.log("[notifications] notifyMilestone elapsed=", clampedElapsed, "remaining=", clampedRemaining);

  await withPermission(browser, async () => {
    await browser.notifications.create(id, {
      type: "basic",
      iconUrl: iconUrl ?? browser.runtime.getURL("/icon/128.png"),
      title: msg.my,
      message: msg.en,
      priority: 2,
      requireInteraction: true,
    });
  });
}

export async function notifyStart(
  browser: Browser,
  state: ExtensionTimerState,
): Promise<void> {
  const msg = getMotivation({
    elapsedSeconds: 0,
    remainingSeconds: state.subPieceRemaining,
    isRunning: true,
    completedToday: 0,
  });

  const iconUrl = getIconUrl(browser);
  const id = nextId("focus-start");

  console.log("[notifications] notifyStart project=", state.projectName ?? state.projectId);

  await withPermission(browser, async () => {
    await browser.notifications.create(id, {
      type: "basic",
      iconUrl: iconUrl ?? browser.runtime.getURL("/icon/128.png"),
      title: msg.my,
      message: msg.en,
      priority: 2,
      requireInteraction: true,
    });
  });
}

export async function notifySessionComplete(
  browser: Browser,
  state: ExtensionTimerState,
  targetReached: boolean,
): Promise<void> {
  const name = targetReached
    ? (state.projectName ?? "ပရောဂျက်")
    : (state.subPieceName ?? "အထွေထွေ focus");

  const msg = getMotivation({
    elapsedSeconds: state.projectElapsed,
    remainingSeconds: 0,
    isRunning: false,
    completedToday: 0,
  });

  const iconUrl = getIconUrl(browser);
  const id = nextId("session-complete");

  console.log("[notifications] notifySessionComplete targetReached=", targetReached, "project=", state.projectName ?? state.projectId);

  await withPermission(browser, async () => {
    await browser.notifications.create(id, {
      type: "basic",
      iconUrl: iconUrl ?? browser.runtime.getURL("/icon/128.png"),
      title: `${name} အတွက် အချိန် ပြည့်ပါပြီ`,
      message: `${msg.my} — ${msg.en}`,
      priority: 2,
      requireInteraction: true,
    });
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
