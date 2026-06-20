import { AddProjectButton } from "@/components/projects/AddProjectButton";
import { ProjectList } from "@/components/projects/ProjectList";
import { FolderKanban } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="flex min-h-full flex-col gap-6 p-6 lg:p-8 bg-gradient-soft">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 md:text-3xl flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-teal-500" />
            ပရောဂျက်များ (Projects)
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            သင့်ပရောဂျက်များကို စီမံခန့်ခွဲပြီး focus အချိန်ကို ခြေရာခွဲပါ
          </p>
        </div>
        <AddProjectButton
          variant="default"
          className="gap-2 bg-teal-500 hover:bg-teal-600 text-white shrink-0"
        />
      </div>

      {/* Project list */}
      <ProjectList />
    </div>
  );
}
