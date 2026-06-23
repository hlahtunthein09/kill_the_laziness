import { setTimerState, getTimerState } from "../lib/storage";
import { startFocusAlarm, stopFocusAlarm } from "../lib/timerAlarm";
import type { ExtensionTimerState } from "../lib/types";

export type TimerMessage =
  | { action: "UPDATE_TIMER_STATE"; payload: ExtensionTimerState }
  | { action: "GET_TIMER_STATE" };

export async function handleMessage(
  message: TimerMessage
): Promise<unknown> {
  switch (message.action) {
    case "UPDATE_TIMER_STATE": {
      const payload = message.payload;
      if (
        !payload ||
        typeof payload.projectId !== "string" ||
        typeof payload.projectElapsed !== "number" ||
        typeof payload.subPieceRemaining !== "number" ||
        typeof payload.isRunning !== "boolean" ||
        typeof payload.savedAt !== "number"
      ) {
        return { ok: false, error: "Invalid timer state payload" };
      }
      await setTimerState(payload);

      if (payload.isRunning) {
        await startFocusAlarm();
      } else {
        await stopFocusAlarm();
      }

      return { ok: true };
    }
    case "GET_TIMER_STATE": {
      const state = await getTimerState();
      return state ?? null;
    }
    default: {
      const unknownAction = (message as Record<string, unknown>).action;
      console.warn("Unknown background message action:", unknownAction);
      return { ok: false, error: "Unknown action" };
    }
  }
}
