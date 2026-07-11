"use client";

import { useMemo, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/time";
import type { Project } from "@/lib/types";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Pencil, Trash2 } from "lucide-react";
import { AddSubPieceButton } from "./AddSubPieceButton";
import { SubPieceList } from "./SubPieceList";
import { ProjectCompletedDialog } from "./ProjectCompletedDialog";
import { useRouter } from "next/navigation";
import { useFocusStore } from "@/lib/store/useFocusStore";
import { Button } from "@/components/ui/button";
import { Crosshair } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ProjectCardProps {
  project: Project;
}

const COLOR_MAP: Record<string, { dot: string; badge: string; progress: string }> = {
  mint: {
    dot: "bg-teal-400",
    badge: "bg-primary/10 text-primary border-primary/30",
    progress: "bg-primary",
  },
  ocean: {
    dot: "bg-sky-400",
    badge: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    progress: "bg-sky-500",
  },
  sand: {
    dot: "bg-amber-300",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    progress: "bg-amber-500",
  },
  forest: {
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    progress: "bg-emerald-500",
  },
  coral: {
    dot: "bg-rose-400",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    progress: "bg-rose-500",
  },
};

const STATUS_LABELS: Record<string, { label: string; en: string }> = {
  idle: { label: "မပြီးပြတ်သေးပါ", en: "Idle" },
  running: { label: "လုပ်ဆောင်နေသည်", en: "Running" },
  paused: { label: "ခဏရပ်ထား", en: "Paused" },
  completed: { label: "ပြီးစီး", en: "Completed" },
};

const STATUS_COLORS: Record<string, string> = {
  idle: "bg-muted text-muted-foreground border-border",
  running: "bg-primary/10 text-primary border-primary/30",
  paused: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const colorStyle = COLOR_MAP[project.color] ?? COLOR_MAP.mint;
  const statusInfo = STATUS_LABELS[project.status] ?? STATUS_LABELS.idle;
  const statusColor = STATUS_COLORS[project.status] ?? STATUS_COLORS.idle;

  const progressPercent = useMemo(() => {
    if (project.targetTimeSeconds <= 0) return 0;
    return Math.min(100, Math.round((project.totalTimeSeconds / project.targetTimeSeconds) * 100));
  }, [project.totalTimeSeconds, project.targetTimeSeconds]);

  const activeProjectId = useFocusStore((s) => s.activeProjectId);
  const setActiveProject = useFocusStore((s) => s.setActiveProject);
  const deleteProject = useFocusStore((s) => s.deleteProject);
  const isActive = project.id === activeProjectId;
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [targetHours, setTargetHours] = useState(() => project.targetTimeSeconds / 3600);

  const openTargetDialog = useCallback(() => {
    setTargetHours(project.targetTimeSeconds / 3600);
    setIsTargetDialogOpen(true);
  }, [project.targetTimeSeconds]);

  const allocatedHours = useMemo(() => {
    return project.subPieces.reduce((sum, sp) => sum + sp.allocatedMinutes, 0) / 60;
  }, [project.subPieces]);

  const formattedTime = useMemo(() => formatDuration(project.totalTimeSeconds), [project.totalTimeSeconds]);
  const formattedTarget = useMemo(() => formatDuration(project.targetTimeSeconds), [project.targetTimeSeconds]);

  const description = project.description?.trim();

  const isTargetReached =
    project.targetTimeSeconds > 0 && project.totalTimeSeconds >= project.targetTimeSeconds;

  const handleFocusClick = () => {
    if (isTargetReached) {
      setIsDialogOpen(true);
    } else {
      setActiveProject(project.id);
      router.push("/timer");
    }
  };

  const handleRestart = () => {
    useFocusStore.getState().restartProject(project.id);
    setActiveProject(project.id);
    router.push("/timer");
    setIsDialogOpen(false);
  };

  const handleExtend = (additionalMinutes: number) => {
    useFocusStore.getState().updateProject(project.id, {
      targetTimeSeconds: project.targetTimeSeconds + additionalMinutes * 60,
    });
    setActiveProject(project.id);
    router.push("/timer");
    setIsDialogOpen(false);
  };

  return (
    <Card id={`project-${project.id}`} className={cn(
      "group h-full bg-card-glow border border-border hover:shadow-md transition-shadow duration-200",
      isActive && "ring-2 ring-primary border-primary",
      !isActive && isTargetReached && "border-emerald-500"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className={cn("size-3 rounded-full shrink-0", colorStyle.dot)} />
          <CardTitle className="text-base font-semibold text-foreground truncate">
            {project.name}
          </CardTitle>
          <button
            type="button"
            onClick={openTargetDialog}
            className="inline-flex items-center justify-center rounded-full p-1 text-primary bg-primary/10 hover:bg-primary/20 hover:ring-1 hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            aria-label="ပစ်မှတ်အချိန် ပြင်ရန် (Edit target)"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="ml-auto inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            aria-label="ပရောဂျက်ဖျက်ရန် (Delete project)"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        {description && (
          <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {description}
          </CardDescription>
        )}
        <div className="mt-2 flex flex-col items-start gap-1.5">
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", statusColor)}
          >
            {statusInfo.label} ({statusInfo.en})
          </Badge>
          {isActive && (
            <Badge className="text-xs font-medium bg-primary text-primary-foreground">
              လက်ရှိ focus လုပ်နေသည် (Currently focusing)
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-2 flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Target className="h-3 w-3" />
            {progressPercent}%
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="font-semibold text-primary">{formattedTime}</span>
            <span className="text-muted-foreground">/ {formattedTarget}</span>
            <button
              type="button"
              onClick={openTargetDialog}
              className="inline-flex items-center justify-center rounded-full p-1 text-primary bg-primary/10 hover:bg-primary/20 hover:ring-1 hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
              aria-label="ပစ်မှတ်အချိန် ပြင်ရန် (Edit target)"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </span>
        </div>
        <Progress value={progressPercent} className="w-full">
          <ProgressTrack>
            <ProgressIndicator className={cn("transition-all duration-500", colorStyle.progress)} />
          </ProgressTrack>
        </Progress>

        <div className="mt-3">
          <SubPieceList subPieces={project.subPieces} />
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-border flex flex-col gap-2 bg-card mt-auto">
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground w-full bg-card border border-border rounded-md px-3 py-2">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span>
            အသုံးပြုပြီးသောအချိန် (Time used):{" "}
            <span className="font-semibold text-primary">{formattedTime}</span>
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleFocusClick}
          className={cn(
            "text-xs gap-1 w-full whitespace-normal leading-tight h-auto py-2 bg-card border-border hover:bg-card hover:text-primary hover:border-primary/50 hover:shadow-[0_0_10px_rgba(198,241,53,0.12)]",
            isActive && "border-primary text-primary bg-card shadow-[0_0_10px_rgba(198,241,53,0.15)]"
          )}
          aria-pressed={isActive}
        >
          <Crosshair className="h-3 w-3 shrink-0" />
          <span>ပရောဂျက်တစ်ခုလုံးကို focus လုပ်မယ် (Focus whole project)</span>
        </Button>
        <div className="w-full">
          <AddSubPieceButton projectId={project.id} className="w-full bg-card border-border hover:bg-card hover:text-primary hover:border-primary/50 hover:shadow-[0_0_10px_rgba(198,241,53,0.12)]" />
        </div>
      </CardFooter>
      <ProjectCompletedDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectName={project.name}
        totalTimeSeconds={project.totalTimeSeconds}
        targetTimeSeconds={project.targetTimeSeconds}
        onRestart={handleRestart}
        onExtend={handleExtend}
      />
      <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen} dismissible={false}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ပစ်မှတ်အချိန် ပြင်ရန် (Edit Target)</DialogTitle>
            <DialogDescription>
              ပရောဂျက်အတွက် ပစ်မှတ်အချိန်ကို အနည်းဆုံး {allocatedHours} နာရီအထိ ထားရပါမည်။
              <br />
              Target must be at least {allocatedHours}h because sub-pieces already use that time.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const hours = Number.isFinite(targetHours) ? targetHours : allocatedHours;
              const next = Math.max(allocatedHours, Math.round(hours * 10) / 10);
              useFocusStore.getState().updateProject(project.id, {
                targetTimeSeconds: Math.round(next * 3600),
              });
              setIsTargetDialogOpen(false);
            }}
            className="flex flex-col gap-4 py-2"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="target-hours" className="text-sm font-medium">
                ပစ်မှတ်အချိန် (နာရီ) / Target (hours)
              </label>
              <Input
                id="target-hours"
                type="number"
                step={0.5}
                min={allocatedHours}
                value={targetHours}
                onChange={(e) => setTargetHours(parseFloat(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Allocated from sub-pieces: {allocatedHours}h
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTargetDialogOpen(false)}>
                ပယ်ဖျက်ရန် (Cancel)
              </Button>
              <Button type="submit">သိမ်းဆည်းရန် (Save)</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} dismissible={false}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ပရောဂျက်ဖျက်ရန်သေချာပါသလား? (Delete Project?)</DialogTitle>
            <DialogDescription>
              {project.name} နှင့် sub piece အားလုံးကို ဖျက်မှာ သေချာပါသလား။ ဒီဟာကို ပြန်restore မလုပ်နိုင်ပါ။
              <br />
              This will permanently delete &ldquo;{project.name}&rdquo; and all its sub-pieces.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              မလုပ်ပါ (Cancel)
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteProject(project.id);
                setIsDeleteDialogOpen(false);
              }}
            >
              ဖျက်မယ် (Delete)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
