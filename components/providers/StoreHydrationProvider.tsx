"use client";

import { useEffect } from "react";
import { useFocusStore } from "@/lib/store/useFocusStore";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";

export function StoreHydrationProvider({ children }: { children: React.ReactNode }) {
  const hasHydrated = useStoreHydrated();

  useEffect(() => {
    const rehydrate = useFocusStore.persist.rehydrate();
    if (rehydrate instanceof Promise) {
      rehydrate.then(() => {
        useFocusStore.setState({ hasHydrated: true });
      });
    } else {
      useFocusStore.setState({ hasHydrated: true });
    }
  }, []);

  if (!hasHydrated) {
    return null;
  }

  return <>{children}</>;
}
