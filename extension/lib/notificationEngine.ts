import type { Browser } from "webextension-polyfill";
import type { ActiveSessionToken } from "./types";
import type { StoredSession } from "./sessionStorage";
import { getStoredSession, setStoredSession } from "./sessionStorage";
import { notifyFromPayload } from "./notifications";
import { buildStageSchedule } from "./stageScheduler";

export interface NotificationSchedule {
  startTime: number;
  milestoneTimes: number[];
  almostTime: number;
  completeTime: number;
}

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  priority?: number;
}

type FocusAlarmType = "milestone" | "almost" | "complete";

interface ParsedFocusAlarm {
  sessionId: string;
  type: FocusAlarmType;
  targetElapsed: number;
}

function parseFocusAlarmName(alarmName: string): ParsedFocusAlarm | null {
  if (!alarmName.startsWith("focus-")) return null;
  const rest = alarmName.slice("focus-".length);
  const firstDash = rest.indexOf("-");
  if (firstDash === -1) return null;
  const sessionId = rest.slice(0, firstDash);
  const typeAndRest = rest.slice(firstDash + 1);

  if (typeAndRest.startsWith("milestone-")) {
    const afterType = typeAndRest.slice("milestone-".length);
    const lastDash = afterType.lastIndexOf("-");
    if (lastDash === -1) return null;
    const targetElapsed = Number(afterType.slice(lastDash + 1));
    if (!Number.isFinite(targetElapsed)) return null;
    return { sessionId, type: "milestone", targetElapsed };
  }

  if (typeAndRest.startsWith("almost-")) {
    const targetElapsed = Number(typeAndRest.slice("almost-".length));
    if (!Number.isFinite(targetElapsed)) return null;
    return { sessionId, type: "almost", targetElapsed };
  }

  if (typeAndRest.startsWith("complete-")) {
    const targetElapsed = Number(typeAndRest.slice("complete-".length));
    if (!Number.isFinite(targetElapsed)) return null;
    return { sessionId, type: "complete", targetElapsed };
  }

  return null;
}

export async function onFocusAlarm(browser: Browser, alarmName: string): Promise<void> {
  const parsed = parseFocusAlarmName(alarmName);
  if (!parsed) return;

  const session = await getStoredSession();
  if (!session) return;
  if (session.token.sessionId !== parsed.sessionId) return;
  if (!session.token.isRunning) return;

  if (parsed.type === "milestone") {
    if (session.trackers.milestoneTimesFired.includes(parsed.targetElapsed)) return;
    const payload = prepareMilestonePayload(session.token, parsed.targetElapsed);
    await notifyFromPayload(browser, payload);
    session.trackers.milestoneTimesFired.push(parsed.targetElapsed);
  } else if (parsed.type === "almost") {
    if (session.trackers.almostDoneFired) return;
    const payload = prepareAlmostPayload(session.token);
    await notifyFromPayload(browser, payload);
    session.trackers.almostDoneFired = true;
  } else if (parsed.type === "complete") {
    if (session.trackers.completeFired) return;
    const schedule = buildNotificationSchedule(session.token);
    const elapsedActiveTime =
      session.token.elapsedActiveSeconds + (Date.now() - session.token.resumedAt) / 1000;
    if (elapsedActiveTime < schedule.completeTime - 1) return;
    const payload = prepareCompletePayload(session.token, true);
    await notifyFromPayload(browser, payload);
    session.trackers.completeFired = true;
    session.token.isRunning = false;
  }

  await setStoredSession(session);
}

export function getSessionDuration(token: ActiveSessionToken): number {
  if (token.mode === "sub-piece") {
    return token.subPieceRemainingBaseline ?? token.targetTimeSeconds;
  }
  return Math.max(0, token.targetTimeSeconds - token.projectElapsedBaseline);
}

export function buildNotificationSchedule(token: ActiveSessionToken): NotificationSchedule {
  const schedule = buildStageSchedule(getSessionDuration(token));
  return {
    startTime: schedule.startTime,
    milestoneTimes: schedule.milestoneTimes,
    almostTime: schedule.almostTime,
    completeTime: schedule.completeTime,
  };
}

export async function scheduleNotifications(
  browser: Browser,
  session: StoredSession,
  elapsed: number,
): Promise<void> {
  const token = session.token;
  const sessionId = token.sessionId;
  const schedule = buildNotificationSchedule(token);

  for (let i = 0; i < schedule.milestoneTimes.length; i++) {
    const targetElapsed = schedule.milestoneTimes[i];
    if (!session.trackers.milestoneTimesFired.includes(targetElapsed) && targetElapsed > elapsed) {
      const name = `focus-${sessionId}-milestone-${i}-${targetElapsed}`;
      const when = Date.now() + (targetElapsed - elapsed) * 1000;
      await browser.alarms.create(name, { when });
    }
  }

  if (!session.trackers.almostDoneFired && schedule.almostTime > elapsed) {
    const name = `focus-${sessionId}-almost-${schedule.almostTime}`;
    const when = Date.now() + (schedule.almostTime - elapsed) * 1000;
    await browser.alarms.create(name, { when });
  }

  if (!session.trackers.completeFired && schedule.completeTime > elapsed) {
    const name = `focus-${sessionId}-complete-${schedule.completeTime}`;
    const when = Date.now() + (schedule.completeTime - elapsed) * 1000;
    await browser.alarms.create(name, { when });
  }
}

export async function cancelNotifications(browser: Browser): Promise<void> {
  const alarms = await browser.alarms.getAll();
  const names = alarms
    .map((a) => a.name)
    .filter((n): n is string => typeof n === "string" && n.startsWith("focus-"));
  for (const name of names) {
    await browser.alarms.clear(name);
  }
}

function sessionName(token: ActiveSessionToken): string {
  return token.subPieceName || token.projectName || "Focus Session";
}

export function prepareStartPayload(token: ActiveSessionToken): NotificationPayload {
  const name = sessionName(token);
  const targetMinutes = Math.round(token.targetTimeSeconds / 60);
  return {
    id: `focus-start-${token.startedAt}`,
    title: "စ_Focus စတင်လိုက်ပြီ",
    message: `Starting ${name} for ${targetMinutes} minutes. Stay focused!`,
    priority: 2,
  };
}

export function prepareMilestonePayload(
  token: ActiveSessionToken,
  milestoneTime: number,
): NotificationPayload {
  const name = sessionName(token);
  const elapsedMinutes = (milestoneTime / 60).toFixed(1);
  return {
    id: `focus-milestone-${token.startedAt}-${Math.round(milestoneTime * 100)}`,
    title: "စ_ milestone ရောက်ပြီ",
    message: `${elapsedMinutes} minutes into ${name}. Keep going!`,
    priority: 1,
  };
}

export function prepareAlmostPayload(token: ActiveSessionToken): NotificationPayload {
  const name = sessionName(token);
  const remainingMinutes = (token.targetTimeSeconds * 0.175 / 60).toFixed(1);
  return {
    id: `focus-almost-${token.startedAt}`,
    title: "စ_ အနီးရှိပြီ",
    message: `Almost done with ${name}. About ${remainingMinutes} minutes left. Final push!`,
    priority: 2,
  };
}

export function prepareCompletePayload(
  token: ActiveSessionToken,
  targetReached: boolean,
): NotificationPayload {
  const name = sessionName(token);
  return {
    id: `focus-complete-${token.startedAt}`,
    title: "စ_ session ပြီးစီး",
    message: targetReached
      ? `Great job! ${name} completed. You reached your target.`
      : `Session ended for ${name}.`,
    priority: 2,
  };
}
