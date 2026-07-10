import {
  startSession,
  resumeSession,
  pauseSession,
  resetSession,
  updateSession,
  getActiveSession,
} from "./timerEngine";
import type { ActiveSessionToken } from "./types";

export type TimerMessage =
  | { type: "SET_ACTIVE_SESSION"; token: ActiveSessionToken }
  | { type: "START_SESSION"; token?: ActiveSessionToken }
  | { type: "RESUME_SESSION" }
  | { type: "PAUSE_SESSION" }
  | { type: "RESET_SESSION" }
  | { type: "UPDATE_SESSION"; token: ActiveSessionToken }
  | { type: "GET_ACTIVE_SESSION" };

function isValidToken(token: unknown): token is ActiveSessionToken {
  if (typeof token !== "object" || token === null) return false;
  const t = token as Partial<ActiveSessionToken>;
  return (
    typeof t.sessionId === "string" &&
    t.sessionId.length > 0 &&
    typeof t.projectId === "string" &&
    t.projectId.length > 0 &&
    (t.mode === "sub-piece" || t.mode === "project") &&
    typeof t.targetTimeSeconds === "number" &&
    typeof t.projectElapsedBaseline === "number" &&
    typeof t.isRunning === "boolean" &&
    typeof t.startedAt === "number" &&
    typeof t.resumedAt === "number" &&
    typeof t.elapsedActiveSeconds === "number"
  );
}

export async function handleMessage(
  message: TimerMessage
): Promise<unknown> {
  console.log("[messageHandler] type:", message.type);
  try {
    switch (message.type) {
      case "SET_ACTIVE_SESSION":
      case "UPDATE_SESSION": {
        if (!isValidToken(message.token)) {
          return { ok: false, error: "Invalid session token" };
        }
        if (message.type === "SET_ACTIVE_SESSION") {
          await startSession(message.token);
        } else {
          await updateSession(message.token);
        }
        return { ok: true };
      }
      case "START_SESSION": {
        if (message.token && !isValidToken(message.token)) {
          return { ok: false, error: "Invalid session token" };
        }
        await startSession(message.token);
        return { ok: true };
      }
      case "RESUME_SESSION": {
        await resumeSession();
        return { ok: true };
      }
      case "PAUSE_SESSION": {
        await pauseSession();
        return { ok: true };
      }
      case "RESET_SESSION": {
        await resetSession();
        return { ok: true };
      }
      case "GET_ACTIVE_SESSION": {
        const token = await getActiveSession();
        return { ok: true, token };
      }
      default: {
        const unknownType = (message as Record<string, unknown>).type;
        console.warn("Unknown background message type:", unknownType);
        return { ok: false, error: "Unknown type" };
      }
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
