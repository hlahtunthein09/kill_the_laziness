"use client";

import { useEffect, useRef, useState } from "react";
import { useFocusStore } from "@/lib/store/useFocusStore";
import type { FocusSessionSchedule } from "@/lib/types";

export interface UseScheduleWatcherResult {
  dueSchedule: FocusSessionSchedule | undefined;
}

export function useScheduleWatcher(): UseScheduleWatcherResult {
  const getNextDueSchedule = useFocusStore((s) => s.getNextDueSchedule);
  const schedules = useFocusStore((s) => s.schedules);

  const [dueSchedule, setDueSchedule] = useState<FocusSessionSchedule | undefined>(undefined);
  const lastNotifiedRef = useRef<{ id: string; minute: number } | null>(null);

  useEffect(() => {
    function check() {
      const next = getNextDueSchedule();
      const now = new Date();
      const currentMinute = now.getHours() * 60 + now.getMinutes();

      if (
        next &&
        (lastNotifiedRef.current?.id !== next.id ||
          lastNotifiedRef.current?.minute !== currentMinute)
      ) {
        lastNotifiedRef.current = { id: next.id, minute: currentMinute };
        setDueSchedule(next);
      } else {
        setDueSchedule(undefined);
      }
    }

    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [getNextDueSchedule, schedules?.length]);

  return { dueSchedule };
}
