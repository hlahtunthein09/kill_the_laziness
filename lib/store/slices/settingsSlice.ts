"use client";

import type { StateCreator } from "zustand";
import type { AppSettings } from "@/lib/types";
import type { FocusState } from "../useFocusStore";
import { DEFAULT_APP_SETTINGS, DEFAULT_FORBIDDEN_URLS } from "@/lib/constants";

export interface SettingsSlice {
  settings: AppSettings;

  updateSettings: (updates: Partial<AppSettings>) => void;
  addForbiddenUrl: (url: string) => void;
  removeForbiddenUrl: (url: string) => void;
  resetForbiddenUrls: () => void;
}

export const createSettingsSlice: StateCreator<FocusState, [], [], SettingsSlice> = (set) => ({
  settings: { ...DEFAULT_APP_SETTINGS },

  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates },
    }));
  },

  addForbiddenUrl: (url) => {
    const trimmed = url.trim().toLowerCase();
    if (!trimmed) return;
    set((state) => {
      if (state.settings.forbiddenUrls.includes(trimmed)) return state;
      return {
        settings: {
          ...state.settings,
          forbiddenUrls: [...state.settings.forbiddenUrls, trimmed],
        },
      };
    });
  },

  removeForbiddenUrl: (url) => {
    const trimmed = url.trim().toLowerCase();
    set((state) => ({
      settings: {
        ...state.settings,
        forbiddenUrls: state.settings.forbiddenUrls.filter((u) => u !== trimmed),
      },
    }));
  },

  resetForbiddenUrls: () => {
    set((state) => ({
      settings: {
        ...state.settings,
        forbiddenUrls: [...DEFAULT_FORBIDDEN_URLS],
      },
    }));
  },
});
