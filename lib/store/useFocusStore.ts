"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createProjectSlice, type ProjectSlice } from "./slices/projectSlice";
import { createSettingsSlice, type SettingsSlice } from "./slices/settingsSlice";
import { createDistractionSlice, type DistractionSlice } from "./slices/distractionSlice";

export interface HydrationSlice {
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export type FocusState = ProjectSlice & SettingsSlice & DistractionSlice & HydrationSlice;

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get, ...rest) => ({
      ...createProjectSlice(set, get, ...rest),
      ...createSettingsSlice(set, get, ...rest),
      ...createDistractionSlice(set, get, ...rest),
      hasHydrated: false,
      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),
    }),
    {
      name: "ff_focus_store",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
