import { AddProjectButton } from "@/components/projects/AddProjectButton";
import { ProjectList } from "@/components/projects/ProjectList";
import { FolderKanban } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="flex min-h-full flex-col gap-6 p-6 lg:p-8 bg-gradient-soft">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-primary" />
            ပရောဂျက်များ (Projects)
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            သင့်ပရောဂျက်များကို စီမံခန့်ခွဲပြီး focus အချိန်ကို စီမံခန့်ခွဲပါ
          </p>
        </div>
        <AddProjectButton
          variant="default"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
        />
      </div>

      {/* Project list */}
      <ProjectList />
    </div>
  );
}
