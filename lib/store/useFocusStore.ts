"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createProjectSlice, type ProjectSlice } from "./slices/projectSlice";
import { createSettingsSlice, type SettingsSlice } from "./slices/settingsSlice";
import { createDistractionSlice, type DistractionSlice } from "./slices/distractionSlice";

export type FocusState = ProjectSlice & SettingsSlice & DistractionSlice;

export const useFocusStore = create<FocusState>()(
  persist(
    (...args) => ({
      ...createProjectSlice(...args),
      ...createSettingsSlice(...args),
      ...createDistractionSlice(...args),
    }),
    {
      name: "ff_focus_store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
