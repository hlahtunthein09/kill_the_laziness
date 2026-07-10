import { browser } from "wxt/browser";
import type { Browser } from "webextension-polyfill";
import type { ActiveSessionToken, ExtensionTimerState } from "./types";
import { getStoredSession, setStoredSession, clearStoredSession, setSessionBrowserInstance, type StoredSession } from "./sessionStorage";
import { prepareStartPayload, prepareCompletePayload, scheduleNotifications, cancelNotifications, getSessionDuration } from "./notificationEngine";
import { notifyFromPayload } from "./notifications";

export interface SessionTrackers {
  startFired: boolean;
  milestoneTimesFired: number[];
  almostDoneFired: boolean;
  completeFired: boolean;
}

const defaultTrackers = (): SessionTrackers => ({ startFired: false, milestoneTimesFired: [], almostDoneFired: false, completeFired: false });

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const arr = new Uint8Array(4);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return Math.random().toString(16).slice(2, 10).padEnd(8, "0");
}

const toToken = (s: ExtensionTimerState): ActiveSessionToken => ({
  sessionId: generateSessionId(),
  projectId: s.projectId, subPieceId: s.subPieceId, projectName: s.projectName, subPieceName: s.subPieceName,
  mode: s.subPieceId ? "sub-piece" : "project",
  targetTimeSeconds: s.targetTimeSeconds ?? (s.allocatedMinutes ? s.allocatedMinutes * 60 : 3600),
  projectElapsedBaseline: s.projectElapsedBaseline ?? s.projectElapsed,
  subPieceRemainingBaseline: s.subPieceId ? (s.subPieceRemainingBaseline ?? s.subPieceRemaining) : undefined,
  isRunning: true, startedAt: Date.now(), resumedAt: Date.now(), elapsedActiveSeconds: 0,
});

let _browser: Browser | null = null;
function getBrowser(): Browser { return _browser ?? (browser as Browser); }

async function fireStartNotification(session: StoredSession): Promise<void> {
  if (session.trackers.startFired) return;
  const payload = prepareStartPayload(session.token);
  await notifyFromPayload(getBrowser(), payload);
  session.trackers.startFired = true;
  await setStoredSession(session);
}

export async function onStageAlarm(_alarmName: string): Promise<void> {
  // No-op stub: focus-* alarm handling has moved to notificationEngine.onFocusAlarm.
}

export async function startSession(input?: ActiveSessionToken | ExtensionTimerState): Promise<void> {
  if (!input) return;
  const now = Date.now(), token = "mode" in input ? input : toToken(input);
  const session: StoredSession = { token: { ...token, sessionId: generateSessionId(), isRunning: true, startedAt: now, resumedAt: now, elapsedActiveSeconds: 0 }, trackers: defaultTrackers() };
  await setStoredSession(session);
  await fireStartNotification(session);
  await scheduleNotifications(getBrowser(), session, 0);
}

export async function resumeSession(): Promise<void> {
  const session = await getStoredSession();
  if (!session || session.token.isRunning) return;
  session.token.isRunning = true;
  session.token.resumedAt = Date.now();
  await setStoredSession(session);
  await cancelNotifications(getBrowser());           // defensive: clear any leftover alarms
  await scheduleNotifications(getBrowser(), session, await getSessionElapsed());
}

export async function pauseSession(): Promise<void> {
  const session = await getStoredSession();
  if (!session || !session.token.isRunning) return;
  session.token.elapsedActiveSeconds += (Date.now() - session.token.resumedAt) / 1000;
  session.token.isRunning = false;
  await setStoredSession(session);
  await cancelNotifications(getBrowser());
}

export async function resetSession(): Promise<void> {
  await cancelNotifications(getBrowser());
  await clearStoredSession();
}

export async function updateSession(token: ActiveSessionToken): Promise<void> {
  const session = await getStoredSession();
  if (session && session.token.projectId === token.projectId && session.token.subPieceId === token.subPieceId) {
    await setStoredSession({ token: { ...token, sessionId: session.token.sessionId }, trackers: session.trackers });
  } else {
    await startSession(token);
  }
}

export async function getSessionElapsed(): Promise<number> {
  const session = await getStoredSession();
  if (!session) return 0;
  const active = session.token.isRunning ? (Date.now() - session.token.resumedAt) / 1000 : 0;
  return session.token.elapsedActiveSeconds + active;
}

export async function getActiveSession(): Promise<ActiveSessionToken | null> {
  const session = await getStoredSession();
  return session?.token ?? null;
}

export async function restoreOnStartup(): Promise<void> {
  const session = await getStoredSession();
  if (!session || !session.token.isRunning) return;

  await cancelNotifications(getBrowser());

  const rawDrift = (Date.now() - session.token.resumedAt) / 1000;
  const drift = Math.min(rawDrift, 60 * 60);
  const elapsed = session.token.elapsedActiveSeconds + drift;

  session.token.elapsedActiveSeconds = elapsed;
  session.token.resumedAt = Date.now();

  const targetDuration = getSessionDuration(session.token);

  if (elapsed >= targetDuration) {
    if (!session.trackers.completeFired) {
      const payload = prepareCompletePayload(session.token, true);
      await notifyFromPayload(getBrowser(), payload);
      session.trackers.completeFired = true;
    }
    session.token.isRunning = false;
    await setStoredSession(session);
  } else {
    await scheduleNotifications(getBrowser(), session, elapsed);
  }
}

export function setTimerEngineBrowserInstance(b: Browser): void { _browser = b; setSessionBrowserInstance(b); }
export async function tick(): Promise<void> {}
export async function updateScheduleInputs(_payload: { projectId: string; subPieceId?: string; allocatedMinutes?: number; targetTimeSeconds?: number }): Promise<void> {}
