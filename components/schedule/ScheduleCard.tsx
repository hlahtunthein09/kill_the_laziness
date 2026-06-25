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
    <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-900 truncate">{projectName}</p>
        <p className="text-sm text-stone-500 truncate">
          {subPieceName ?? "အထွေထွေ focus (General Focus)"}
        </p>
        <p className="text-sm text-stone-600 mt-1">
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
              schedule.enabled ? "bg-teal-500" : "bg-stone-300"
            )}
          />
          <div
            className={cn(
              "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
              schedule.enabled ? "translate-x-5" : "translate-x-0"
            )}
          />
        </label>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-sky-50 hover:text-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            aria-label="Edit schedule"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
          aria-label="Delete schedule"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
