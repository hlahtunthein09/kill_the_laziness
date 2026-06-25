"use client";

import type { StateCreator } from "zustand";
import type { FocusSessionSchedule } from "@/lib/types";
import type { FocusState } from "../useFocusStore";
import { generateId } from "@/lib/utils";

export interface ScheduleSlice {
  schedules: FocusSessionSchedule[];
  addSchedule: (
    schedule: Omit<FocusSessionSchedule, "id" | "createdAt" | "enabled">
  ) => FocusSessionSchedule;
  deleteSchedule: (id: string) => void;
  toggleSchedule: (id: string) => void;
  updateSchedule: (
    id: string,
    updates: Partial<Omit<FocusSessionSchedule, "id" | "createdAt">>
  ) => void;
  getSchedulesForDay: (dayOfWeek: number) => FocusSessionSchedule[];
  getNextDueSchedule: () => FocusSessionSchedule | undefined;
}

export const createScheduleSlice: StateCreator<FocusState, [], [], ScheduleSlice> = (set, get) => ({
  schedules: [],

  addSchedule: (schedule) => {
    const newSchedule: FocusSessionSchedule = {
      ...schedule,
      id: generateId(),
      createdAt: Date.now(),
      enabled: true,
    };
    set((state) => ({
      schedules: [...state.schedules, newSchedule],
    }));
    return newSchedule;
  },

  deleteSchedule: (id) => {
    set((state) => ({
      schedules: state.schedules.filter((s) => s.id !== id),
    }));
  },

  toggleSchedule: (id) => {
    set((state) => ({
      schedules: state.schedules.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      ),
    }));
  },

  updateSchedule: (id, updates) => {
    const safeUpdates = { ...updates } as Record<string, unknown>;
    delete safeUpdates.id;
    delete safeUpdates.createdAt;
    set((state) => ({
      schedules: state.schedules.map((s) =>
        s.id === id ? { ...s, ...safeUpdates } : s
      ),
    }));
  },

  getSchedulesForDay: (dayOfWeek) => {
    return get().schedules
      .filter((s) => s.enabled && s.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  },

  getNextDueSchedule: () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 Sun - 6 Sat
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const targetDay = (currentDay + dayOffset) % 7;
      const candidates = get().schedules
        .filter((s) => {
          if (!s.enabled || s.dayOfWeek !== targetDay) return false;
          if (dayOffset === 0) {
            const [h, m] = s.startTime.split(':').map(Number);
            const scheduleMinutes = h * 60 + m;
            return scheduleMinutes >= currentMinutes;
          }
          return true;
        })
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      if (candidates.length > 0) {
        return candidates[0];
      }
    }

    return undefined;
  },
});
