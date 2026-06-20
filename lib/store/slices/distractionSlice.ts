"use client";

import type { StateCreator } from "zustand";
import type { AntiDistractionLog } from "@/lib/types";
import type { FocusState } from "../useFocusStore";
import { generateId } from "@/lib/utils";

export interface DistractionSlice {
  logs: AntiDistractionLog[];

  addLog: (log: Omit<AntiDistractionLog, "id" | "timestamp">) => AntiDistractionLog;
  clearLogs: () => void;
  getLogsForProject: (projectId: string) => AntiDistractionLog[];
  getTodayAttemptCount: () => number;
}

function getStartOfDay(): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

export const createDistractionSlice: StateCreator<FocusState, [], [], DistractionSlice> = (
  set,
  get
) => ({
  logs: [],

  addLog: (log) => {
    const newLog: AntiDistractionLog = {
      id: generateId(),
      timestamp: Date.now(),
      url: log.url,
      action: log.action,
      projectId: log.projectId,
    };
    set((state) => ({
      logs: [...state.logs, newLog],
    }));
    return newLog;
  },

  clearLogs: () => {
    set({ logs: [] });
  },

  getLogsForProject: (projectId) => {
    return get().logs.filter((log) => log.projectId === projectId);
  },

  getTodayAttemptCount: () => {
    const startOfDay = getStartOfDay();
    return get().logs.filter((log) => log.timestamp >= startOfDay).length;
  },
});
