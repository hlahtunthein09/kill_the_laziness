"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { FocusSessionSchedule } from "@/lib/types";

interface ScheduleToastProps {
  dueSchedule?: FocusSessionSchedule;
  projectName?: string;
  subPieceName?: string;
}

export function ScheduleToast({
  dueSchedule,
  projectName,
  subPieceName,
}: ScheduleToastProps) {
  const router = useRouter();
  const shownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!dueSchedule) return;
    if (shownRef.current.has(dueSchedule.id)) return;

    shownRef.current.add(dueSchedule.id);

    toast.info(
      `စီစဉ်ထားသော focus အချိန် ရောက်ပါပြီ (Scheduled Focus)`,
      {
        description: `${projectName ?? "ပရောဂျက်"} · ${subPieceName ?? "အထွေထွေ focus"} · ${dueSchedule.startTime}`,
        action: {
          label: "စတင်မယ် (Start)",
          onClick: () => router.push("/timer"),
        },
      }
    );
  }, [dueSchedule, projectName, subPieceName, router]);

  return null;
}
