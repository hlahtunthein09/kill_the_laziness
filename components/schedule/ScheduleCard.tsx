import { cn } from "@/lib/utils";
import type { FocusSessionSchedule } from "@/lib/types";
import { Pencil, Trash2 } from "lucide-react";

const DAY_LABELS = [
  "အိတ်ကို (Sun)",
  "တနင်္လာ (Mon)",
  "အင်္ဂါ (Tue)",
  "ဗုဒ္ဓဟူး (Wed)",
  "ကြာသပတေးနေ့ (Thu)",
  "သောကြာနေ့ (Fri)",
  "စနေနေ့ (Sat)",
];

interface ScheduleCardProps {
  schedule: FocusSessionSchedule;
  projectName: string;
  subPieceName?: string;
  onToggle: () => void;
  onDelete: () => void;
  onEdit?: () => void;
}

export function ScheduleCard({
  schedule,
  projectName,
  subPieceName,
  onToggle,
  onDelete,
  onEdit,
}: ScheduleCardProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{projectName}</p>
        <p className="text-sm text-muted-foreground truncate">
          {subPieceName ?? "အထွေထွေ focus (General Focus)"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {DAY_LABELS[schedule.dayOfWeek]} · {schedule.startTime} · {schedule.durationMinutes} min
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={schedule.enabled}
            onChange={onToggle}
            aria-label="Toggle schedule"
          />
          <div
            className={cn(
              "w-10 h-5 rounded-full transition-colors duration-200",
              schedule.enabled ? "bg-primary" : "bg-muted"
            )}
          />
          <div
            className={cn(
              "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform duration-200",
              schedule.enabled ? "translate-x-5" : "translate-x-0"
            )}
          />
        </label>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Edit schedule"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-destructive/20"
          aria-label="Delete schedule"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
