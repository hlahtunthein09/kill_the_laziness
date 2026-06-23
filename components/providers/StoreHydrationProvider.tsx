"use client";

import { useEffect } from "react";
import { useFocusStore } from "@/lib/store/useFocusStore";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";

export function StoreHydrationProvider({ children }: { children: React.ReactNode }) {
  const hasHydrated = useStoreHydrated();

  useEffect(() => {
    const rehydrate = useFocusStore.persist.rehydrate();
    const onRehydrated = () => {
      useFocusStore.setState({ hasHydrated: true });
      const state = useFocusStore.getState();
      if (state.projects.length === 0) {
        state.addProject({
          name: "နေ့စဥ် Focus နေရာ (Daily Focus)",
          description: "အလုပ်လုပ်ရန် အသင့်တော်ဆုံး နေရာပါ",
          color: "mint",
          targetTimeSeconds: 3600,
        });
      }
    };
    if (rehydrate instanceof Promise) {
      rehydrate.then(onRehydrated);
    } else {
      onRehydrated();
    }
  }, []);

  if (!hasHydrated) {
    return null;
  }

  return <>{children}</>;
}
