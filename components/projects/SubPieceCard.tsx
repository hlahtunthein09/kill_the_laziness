"use client";

import { cn } from "@/lib/utils";
import type { SubPiece } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, PauseCircle, PlayCircle, Circle } from "lucide-react";

interface SubPieceCardProps {
  subPiece: SubPiece;
}

const STATUS_CONFIG: Record<string, { label: string; en: string; icon: React.ReactNode; badgeClass: string }> = {
  idle: {
    label: "စောင့်ဆိုင်းနေသည်",
    en: "Idle",
    icon: <Circle className="h-3.5 w-3.5 text-stone-400" />,
    badgeClass: "bg-stone-100 text-stone-600 border-stone-200",
  },
  running: {
    label: "လုပ်ဆောင်နေသည်",
    en: "Running",
    icon: <PlayCircle className="h-3.5 w-3.5 text-teal-500" />,
    badgeClass: "bg-teal-100 text-teal-700 border-teal-200",
  },
  paused: {
    label: "ခဏရပ်ထား",
    en: "Paused",
    icon: <PauseCircle className="h-3.5 w-3.5 text-amber-500" />,
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
  },
  completed: {
    label: "ပြီးစီး",
    en: "Completed",
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
};

export function SubPieceCard({ subPiece }: SubPieceCardProps) {
  const status = STATUS_CONFIG[subPiece.status] ?? STATUS_CONFIG.idle;

  return (
    <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-white/60 border border-stone-100 hover:bg-white/90 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        {status.icon}
        <span className="text-sm font-medium text-stone-800 truncate">
          {subPiece.name}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="flex items-center gap-1 text-xs text-stone-500">
          <Clock className="h-3 w-3" />
          {subPiece.allocatedMinutes} မိနစ်
        </span>
        <Badge
          variant="outline"
          className={cn("text-[10px] font-medium px-1.5 py-0", status.badgeClass)}
        >
          {status.label} ({status.en})
        </Badge>
      </div>
    </div>
  );
}
