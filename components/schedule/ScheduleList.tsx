"use client";

import { useState } from "react";
import { useFocusStore } from "@/lib/store/useFocusStore";
import { ScheduleCard } from "./ScheduleCard";
import { ScheduleForm } from "./ScheduleForm";
import { CalendarX } from "lucide-react";
import type { FocusSessionSchedule } from "@/lib/types";

export function ScheduleList() {
  const schedules = useFocusStore((s) => s.schedules);
  const projects = useFocusStore((s) => s.projects);
  const toggleSchedule = useFocusStore((s) => s.toggleSchedule);
  const deleteSchedule = useFocusStore((s) => s.deleteSchedule);

  const [editingSchedule, setEditingSchedule] = useState<FocusSessionSchedule | undefined>(undefined);

  const sorted = [...schedules].sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
    return a.startTime.localeCompare(b.startTime);
  });

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
        <CalendarX className="h-8 w-8 text-muted-foreground" />
        <p className="text-base font-medium text-foreground">
          စီစဉ်ထားသော focus အချိန် မရှိသေးပါ
        </p>
        <p className="text-sm text-muted-foreground">No schedules yet — အသစ်ထည့်ပါ</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {sorted.map((schedule) => {
        const project = projects.find((p) => p.id === schedule.projectId);
        const subPiece = project?.subPieces.find(
          (sp) => sp.id === schedule.subPieceId
        );

        return (
          <ScheduleCard
            key={schedule.id}
            schedule={schedule}
            projectName={project?.name ?? "အမည်မသိ ပရောဂျက် (Unknown Project)"}
            subPieceName={subPiece?.name}
            onToggle={() => toggleSchedule(schedule.id)}
            onDelete={() => deleteSchedule(schedule.id)}
            onEdit={() => setEditingSchedule(schedule)}
          />
        );
      })}

      {editingSchedule && (
        <ScheduleForm
          schedule={editingSchedule}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingSchedule(undefined);
          }}
        />
      )}
    </div>
  );
}
