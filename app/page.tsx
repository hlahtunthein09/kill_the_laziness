"use client";

import { useRouter } from "next/navigation";
import { useFocusStore } from "@/lib/store/useFocusStore";
import { getLevelFromXp } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddProjectButton } from "@/components/projects/AddProjectButton";
import { DailyFocusGoal } from "@/components/analytics/DailyFocusGoal";
import { StreakCounter } from "@/components/analytics/StreakCounter";
import { QuickFocusInput } from "@/components/timer/QuickFocusInput";
import FortressSvg from "@/components/fortress/FortressSvg";
import {
  FolderKanban,
  Trophy,
  Plus,
  Shield,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const projects = useFocusStore((state) => state.projects);
  const activeProjectId = useFocusStore((state) => state.activeProjectId);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const fortressProject = activeProject ?? projects[0];

  const totalProjects = projects.length;

  const totalXp = projects.reduce((sum, project) => sum + project.xp, 0);
  const currentLevel = getLevelFromXp(totalXp);

  return (
    <div className="flex min-h-full flex-col gap-6 p-6 lg:p-8 bg-gradient-soft">
      {/* Greeting */}
      <div className="animate-fade-in mb-2">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          မင်္ဂလာပါ၊ ဒီနေ့လည်း focus လုပ်ကြမယ်
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ready to build your fortress?
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Projects */}
        <Card className="bg-card-glow">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-muted-foreground">
              <FolderKanban className="h-4 w-4 text-primary" />
              စုစုပေါင်း ပရောဂျက်များ
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-foreground">{totalProjects}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Total Projects</p>
          </CardContent>
        </Card>

        {/* Daily Focus Goal */}
        <DailyFocusGoal />

        {/* Streak Counter */}
        <StreakCounter />

        {/* Current Level */}
        <Card className="bg-card-glow">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4 text-emerald-500" />
              လက်ရှိ အဆင့်
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-foreground">{currentLevel}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Current Level</p>
          </CardContent>
        </Card>

        {/* Fortress */}
        <Card className="bg-card-glow">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              ခံတပ် (Fortress)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            {fortressProject ? (
              <FortressSvg level={fortressProject.fortressLevel} health={fortressProject.fortressHealth} />
            ) : (
              <p className="text-sm text-muted-foreground">ပရောဂျက်မရှိသေးပါ</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Focus */}
      <Card className="bg-card-glow">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2 text-muted-foreground">
            <Plus className="h-4 w-4 text-primary" />
            အခု focus လုပ်မယ်
          </CardDescription>
          <CardTitle className="text-sm font-normal text-muted-foreground">
            Quick Focus — jump straight into a 25-min sprint
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QuickFocusInput onStart={() => router.push("/timer")} />
        </CardContent>
      </Card>

      {/* Quick action */}
      <Card className="bg-card-glow border-dashed border-2 border-primary">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Plus className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="text-base font-medium text-foreground">
              ပရောဂျက်အသစ်ထည့်မယ်
            </p>
            <p className="text-sm text-muted-foreground">
              Add a new project to start building your fortress
            </p>
          </div>
          <AddProjectButton
            variant="default"
            size="default"
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            label="ပရောဂျက်အသစ်ထည့်မယ်"
            sublabel="Add New Project"
          />
        </CardContent>
      </Card>
    </div>
  );
}
