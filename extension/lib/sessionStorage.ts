import { browser } from "wxt/browser";
import type { Browser } from "webextension-polyfill";
import type { ActiveSessionToken } from "./types";

const ACTIVE_SESSION_KEY = "ff_active_session_v2";

export interface SessionTrackers {
  startFired: boolean;
  milestoneTimesFired: number[];
  almostDoneFired: boolean;
  completeFired: boolean;
}

export interface StoredSession {
  token: ActiveSessionToken;
  trackers: SessionTrackers;
}

function defaultTrackers(): SessionTrackers {
  return {
    startFired: false,
    milestoneTimesFired: [],
    almostDoneFired: false,
    completeFired: false,
  };
}

let _browser: Browser | null = null;

export function setSessionBrowserInstance(instance: Browser): void {
  _browser = instance;
}

function getBrowser(): Browser {
  return _browser ?? (browser as Browser);
}

export async function getStoredSession(): Promise<StoredSession | null> {
  const result = await getBrowser().storage.local.get(ACTIVE_SESSION_KEY);
  return (result[ACTIVE_SESSION_KEY] as StoredSession | undefined) ?? null;
}

export async function setStoredSession(session: StoredSession): Promise<void> {
  await getBrowser().storage.local.set({ [ACTIVE_SESSION_KEY]: session });
}

export async function clearStoredSession(): Promise<void> {
  await getBrowser().storage.local.remove(ACTIVE_SESSION_KEY);
}

export async function getActiveSession(): Promise<ActiveSessionToken | null> {
  const session = await getStoredSession();
  return session?.token ?? null;
}

export async function setActiveSession(token: ActiveSessionToken): Promise<void> {
  await setStoredSession({ token, trackers: defaultTrackers() });
}

export async function clearActiveSession(): Promise<void> {
  await clearStoredSession();
}
