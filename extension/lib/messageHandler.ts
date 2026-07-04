import {
  startSession,
  pauseSession,
  resetSession,
} from "./timerEngine";
import { setTimerState, getTimerState } from "./storage";
import type { ExtensionTimerState } from "./types";

export type TimerMessage =
  | { action: "UPDATE_TIMER_STATE"; payload: ExtensionTimerState }
  | { action: "GET_TIMER_STATE" }
  | { action: "START_TIMER"; payload: ExtensionTimerState }
  | { action: "PAUSE_TIMER" }
  | { action: "RESET_TIMER" };

function isValidTimerState(state: unknown): state is ExtensionTimerState {
  if (typeof state !== "object" || state === null) {
    return false;
  }
  const s = state as Partial<ExtensionTimerState>;
  return (
    typeof s.projectId === "string" &&
    s.projectId.length > 0 &&
    typeof s.projectElapsed === "number" &&
    typeof s.subPieceRemaining === "number" &&
    typeof s.isRunning === "boolean" &&
    typeof s.savedAt === "number"
  );
}

export async function handleMessage(
  message: TimerMessage
): Promise<unknown> {
  console.log("[messageHandler] action:", message.action);
  switch (message.action) {
    case "UPDATE_TIMER_STATE": {
      const payload = message.payload;
      if (
        !payload ||
        typeof payload.projectId !== "string" ||
        typeof payload.projectElapsed !== "number" ||
        typeof payload.subPieceRemaining !== "number" ||
        typeof payload.isRunning !== "boolean" ||
        typeof payload.savedAt !== "number" ||
        (payload.targetTimeSeconds !== undefined ? typeof payload.targetTimeSeconds !== "number" : false)
      ) {
        return { ok: false, error: "Invalid timer state payload" };
      }
      await setTimerState(payload);

      return { ok: true };
    }
    case "GET_TIMER_STATE": {
      const state = await getTimerState();
      return state ?? null;
    }
    case "START_TIMER": {
      if (!isValidTimerState(message.payload)) {
        return { ok: false, error: "Invalid timer state payload" };
      }
      await startSession(message.payload);
      return { ok: true };
    }
    case "PAUSE_TIMER": {
      await pauseSession();
      return { ok: true };
    }
    case "RESET_TIMER": {
      await resetSession();
      return { ok: true };
    }
    default: {
      const unknownAction = (message as Record<string, unknown>).action;
      console.warn("Unknown background message action:", unknownAction);
      return { ok: false, error: "Unknown action" };
    }
  }
}
