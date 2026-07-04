"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { getMotivation, type MotivationContext } from "@/lib/motivation";

export interface TimerToastProps {
  context: MotivationContext;
  trigger?: "start" | "milestone" | "complete";
  onShown?: () => void;
}

export function TimerToast({ context, trigger, onShown }: TimerToastProps) {
  const lastTriggerRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!trigger) {
      lastTriggerRef.current = undefined;
      return;
    }
    if (lastTriggerRef.current === trigger) return;

    lastTriggerRef.current = trigger;

    const motivation = getMotivation(context);

    if (trigger === "complete") {
      toast.success(motivation.my, {
        id: "timer-toast",
        description: motivation.en,
        duration: 6000,
      });
    } else {
      toast.info(motivation.my, {
        id: "timer-toast",
        description: motivation.en,
        duration: 4000,
      });
    }

    onShown?.();
  }, [trigger, context, onShown]);

  return null;
}
