"use client";

import { useFocusStore } from "@/lib/store/useFocusStore";

export function useStoreHydrated(): boolean {
  return useFocusStore((s) => s.hasHydrated);
}
