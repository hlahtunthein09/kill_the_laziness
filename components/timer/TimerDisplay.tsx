"use client";

import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/time";
import { Badge } from "@/components/ui/badge";

interface TimerDisplayProps {
  projectElapsed: number;
  subPieceRemaining: number;
  isRunning: boolean;
}

export function TimerDisplay({
  projectElapsed,
  subPieceRemaining,
  isRunning,
}: TimerDisplayProps) {
  const statusLabel = isRunning
    ? { label: "လုပ်ဆောင်နေသည်", en: "Running", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
    : { label: "ခဏရပ်ထား", en: "Paused", color: "bg-amber-100 text-amber-700 border-amber-200" };

  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-white border border-stone-200 shadow-sm">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={cn("text-xs font-medium", statusLabel.color)}>
          {statusLabel.label} ({statusLabel.en})
        </Badge>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-stone-500">ပရောဂျက် အချိန် (Project Time)</span>
        <span className="text-4xl font-bold text-stone-900 tabular-nums">
          {formatDuration(projectElapsed)}
        </span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-stone-500">လက်ကျန် အချိန် (Remaining)</span>
        <span className={cn(
          "text-2xl font-semibold tabular-nums",
          subPieceRemaining <= 60 && subPieceRemaining > 0 ? "text-rose-600" : "text-stone-700"
        )}>
          {formatDuration(subPieceRemaining)}
        </span>
      </div>
    </div>
  );
}
