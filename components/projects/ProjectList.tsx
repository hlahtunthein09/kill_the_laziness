"use client";

import { useFocusStore } from "@/lib/store/useFocusStore";
import { ProjectCard } from "./ProjectCard";
import { FolderOpen } from "lucide-react";

export function ProjectList() {
  const projects = useFocusStore((s) => s.projects);
  const hasHydrated = useFocusStore((s) => s.hasHydrated);

  if (!hasHydrated) {
    return null;
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-500">
          <FolderOpen className="h-8 w-8" />
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-stone-700">
            ပရောဂျက်များ မရှိသေးပါ
          </p>
          <p className="text-sm text-stone-400 mt-1">
            No projects yet — ပရောဂျက်အသစ်ထည့်ရန် (Add a new project) နှင့် စတင်လိုက်ပါ
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
