"use client";

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
import {
  FolderKanban,
  Timer,
  Trophy,
  Plus,
} from "lucide-react";

export default function Home() {
  const projects = useFocusStore((state) => state.projects);

  const totalProjects = projects.length;

  const todayFocusSeconds = projects.reduce(
    (sum, project) => sum + project.totalTimeSeconds,
    0
  );
  const todayFocusMinutes = Math.floor(todayFocusSeconds / 60);

  const totalXp = projects.reduce((sum, project) => sum + project.xp, 0);
  const currentLevel = getLevelFromXp(totalXp);

  return (
    <div className="flex min-h-full flex-col gap-6 p-6 lg:p-8 bg-gradient-soft">
      {/* Page heading */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-stone-900 md:text-3xl">
          ကျွမ်းကျင်မှုမြှင့်တင်ရေးအတွက် ပင်မစာမျက်နှာ
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Build your Dev-Fortress, one focused sprint at a time.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Projects */}
        <Card className="bg-card-glow">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-stone-500">
              <FolderKanban className="h-4 w-4 text-teal-500" />
              စုစုပေါင်း ပရောဂျက်များ
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-stone-900">{totalProjects}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-stone-400">Total Projects</p>
          </CardContent>
        </Card>

        {/* Today's Focus Time */}
        <Card className="bg-card-glow">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-stone-500">
              <Timer className="h-4 w-4 text-sky-500" />
              ယနေ့ focus အချိန်
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-stone-900">
              {todayFocusMinutes} <span className="text-lg font-normal text-stone-500">မိနစ်</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-stone-400">Today&apos;s Focus Time</p>
          </CardContent>
        </Card>

        {/* Current Level */}
        <Card className="bg-card-glow">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-stone-500">
              <Trophy className="h-4 w-4 text-emerald-500" />
              လက်ရှိ အဆင့်
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-stone-900">{currentLevel}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-stone-400">Current Level</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick action */}
      <Card className="bg-card-glow border-dashed border-2 border-teal-200">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-600">
            <Plus className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="text-base font-medium text-stone-700">
              ပရောဂျက်အသစ်ထည့်မယ်
            </p>
            <p className="text-sm text-stone-400">
              Add a new project to start building your fortress
            </p>
          </div>
          <AddProjectButton
            variant="default"
            size="default"
            className="gap-2 bg-teal-500 hover:bg-teal-600 text-white"
            label="ပရောဂျက်အသစ်ထည့်မယ်"
            sublabel="Add New Project"
          />
        </CardContent>
      </Card>
    </div>
  );
}
