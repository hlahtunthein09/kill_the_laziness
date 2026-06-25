"use client";

import { useState } from "react";
import { useFocusStore } from "@/lib/store/useFocusStore";
import { DEFAULT_SCHEDULE_DURATION_MINUTES } from "@/lib/constants";
import type { FocusSessionSchedule } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

const DAY_OPTIONS = [
  { value: 0, label: "အိတ်ကို (Sun)" },
  { value: 1, label: "တနင်္လာ (Mon)" },
  { value: 2, label: "အင်္ဂါ (Tue)" },
  { value: 3, label: "ဗုဒ္ဓဟူး (Wed)" },
  { value: 4, label: "ကြာသပတေးနေ့ (Thu)" },
  { value: 5, label: "သောကြာနေ့ (Fri)" },
  { value: 6, label: "စနေနေ့ (Sat)" },
];

interface ScheduleFormProps {
  schedule?: FocusSessionSchedule;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ScheduleForm({ schedule, open, onOpenChange }: ScheduleFormProps) {
  const projects = useFocusStore((s) => s.projects);
  const addSchedule = useFocusStore((s) => s.addSchedule);
  const updateSchedule = useFocusStore((s) => s.updateSchedule);

  const isEditing = Boolean(schedule);
  const isControlled = open !== undefined;

  const [internalOpen, setInternalOpen] = useState(false);
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

  const [projectId, setProjectId] = useState(schedule?.projectId ?? "");
  const [subPieceId, setSubPieceId] = useState(schedule?.subPieceId ?? "");
  const [dayOfWeek, setDayOfWeek] = useState(schedule?.dayOfWeek ?? 1);
  const [startTime, setStartTime] = useState(schedule?.startTime ?? "09:00");
  const [durationMinutes, setDurationMinutes] = useState(
    schedule?.durationMinutes ?? DEFAULT_SCHEDULE_DURATION_MINUTES
  );

  const selectedProject = projects.find((p) => p.id === projectId);
  const incompleteSubPieces = selectedProject?.subPieces.filter((sp) => sp.status !== "completed") ?? [];

  const handleProjectChange = (value: string) => {
    setProjectId(value);
    setSubPieceId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    const duration = Math.max(5, durationMinutes);
    const payload = {
      projectId,
      subPieceId: subPieceId || undefined,
      dayOfWeek,
      startTime,
      durationMinutes: duration,
    };
    if (isEditing && schedule) {
      updateSchedule(schedule.id, payload);
    } else {
      addSchedule(payload);
    }
    setDialogOpen?.(false);
    setProjectId("");
    setSubPieceId("");
    setDayOfWeek(1);
    setStartTime("09:00");
    setDurationMinutes(DEFAULT_SCHEDULE_DURATION_MINUTES);
  };

  const dialogTitle = isEditing
    ? "အချိန်စဉ် ပြန်ပြင်ရန် (Edit Schedule)"
    : "အချိန်စဉ် အသစ်ထည့်ရန် (Add Schedule)";

  const triggerButtonText = isEditing
    ? "အချိန်စဉ် ပြန်ပြင်ရန် (Edit Schedule)"
    : "အချိန်စဉ် အသစ်ထည့်ရန် (Add Schedule)";

  const submitButtonText = isEditing
    ? "သိမ်းဆည်းရန် (Update)"
    : "စီစဉ်ရန် (Save Schedule)";

  const dialogContent = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{dialogTitle}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
        <div className="grid gap-1.5">
          <label htmlFor="project" className="text-sm font-medium text-stone-700">ပရောဂျက် (Project)</label>
          <select
            id="project"
            value={projectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="h-8 w-full rounded-lg border border-stone-200 bg-white px-2.5 text-sm outline-none focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/20"
          >
            <option value="">ပရောဂျက် ရွေးပါ (Select project)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="subPiece" className="text-sm font-medium text-stone-700">အခန်းကဏ္ဍ (Sub-piece)</label>
          <select
            id="subPiece"
            value={subPieceId}
            onChange={(e) => setSubPieceId(e.target.value)}
            disabled={!projectId}
            className="h-8 w-full rounded-lg border border-stone-200 bg-white px-2.5 text-sm outline-none focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/20 disabled:opacity-50"
          >
            <option value="">မရွေးပါ (None)</option>
            {incompleteSubPieces.map((sp) => (
              <option key={sp.id} value={sp.id}>{sp.name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="day" className="text-sm font-medium text-stone-700">နေ့ (Day)</label>
          <select
            id="day"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className="h-8 w-full rounded-lg border border-stone-200 bg-white px-2.5 text-sm outline-none focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/20"
          >
            {DAY_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="startTime" className="text-sm font-medium text-stone-700">စတင်ချိန် (Start Time)</label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="duration" className="text-sm font-medium text-stone-700">ကြာချိန် မိနစ် (Duration min)</label>
          <Input
            id="duration"
            type="number"
            min={5}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
          />
        </div>

        <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white mt-2">
          {submitButtonText}
        </Button>
      </form>
    </DialogContent>
  );

  if (isControlled) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-teal-500 hover:bg-teal-600 text-white">
          <Plus className="mr-2 h-4 w-4" />
          {triggerButtonText}
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
