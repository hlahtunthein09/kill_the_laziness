"use client";

import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/time";
import { Badge } from "@/components/ui/badge";

interface TimerDisplayProps {
  projectElapsed: number;
  subPieceRemaining: number;
  isRunning: boolean;
  allocatedMinutes?: number;
  subPieceName?: string;
}

export function TimerDisplay({
  projectElapsed,
  subPieceRemaining,
  isRunning,
  allocatedMinutes,
  subPieceName,
}: TimerDisplayProps) {
  const statusLabel = isRunning
    ? { label: "လုပ်ဆောင်နေသည်", en: "Running", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
    : { label: "ခဏရပ်ထား", en: "Paused", color: "bg-amber-100 text-amber-700 border-amber-200" };

  const showRemaining = allocatedMinutes && allocatedMinutes > 0;

  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-white border border-stone-200 shadow-sm">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={cn("text-xs font-medium", statusLabel.color)}>
          {statusLabel.label} ({statusLabel.en})
        </Badge>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-stone-500">ပရောဂျက်တစ်ခုလုံး၏ အချိန် (Project Time)</span>
        <span className="text-4xl font-bold text-stone-900 tabular-nums px-4 py-1 rounded-lg border border-teal-200 bg-teal-50/50 ring-1 ring-teal-100">
          {formatDuration(projectElapsed)}
        </span>
      </div>

      {showRemaining && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-stone-500" data-testid="remaining-label">
            {subPieceName ? (
              <>
                <span className="font-semibold text-teal-600">{subPieceName}</span>
                {" "}အတွက် လက်ကျန် အချိန်
              </>
            ) : (
              "လက်ကျန် အချိန်"
            )}
            {" "}(Remaining)
          </span>
          <span className={cn(
            "text-2xl font-semibold tabular-nums px-3 py-0.5 rounded-lg border ring-1",
            subPieceRemaining <= 60 && subPieceRemaining > 0
              ? "text-rose-600 border-rose-200 bg-rose-50/50 ring-rose-100"
              : "text-stone-700 border-stone-200 bg-stone-50/50 ring-stone-100"
          )}>
            {formatDuration(subPieceRemaining)}
          </span>
        </div>
      )}
    </div>
  );
}
