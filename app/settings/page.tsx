import { NotificationsToggle } from "@/components/settings/NotificationsToggle";
import { SoundToggle } from "@/components/settings/SoundToggle";
import { Settings } from "lucide-react";
import { StrictModeToggle } from "@/components/settings/StrictModeToggle";
import { AddForbiddenUrl } from "@/components/settings/AddForbiddenUrl";
import { ForbiddenUrlsList } from "@/components/settings/ForbiddenUrlsList";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { DailyFocusGoalInput } from "@/components/settings/DailyFocusGoalInput";
import { DistractionLog } from "@/components/distraction/DistractionLog";
import { SyncPanel } from "@/components/settings/SyncPanel";
import { ScheduleForm } from "@/components/schedule/ScheduleForm";
import { ScheduleList } from "@/components/schedule/ScheduleList";

export default function SettingsPage() {
  return (
    <div className="flex min-h-full flex-col gap-6 px-6 lg:px-8 pb-6 lg:pb-8 pt-0 lg:pt-1">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          ဆက်တင်များ (Settings)
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ဆက်တင်များကို စိတ်ကြိုက်ပြင်ဆင်ပါ
        </p>
      </div>

      {/* Settings sections */}
      <div className="grid gap-4">
        {/* Daily Focus Goal — live component */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <DailyFocusGoalInput />
        </div>

        {/* Strict Mode — live component */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <StrictModeToggle />
        </div>

        {/* Notifications toggle — live component */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <NotificationsToggle />
        </div>

        {/* Sound toggle — live component */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <SoundToggle />
        </div>

        {/* Forbidden URLs — live component */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <AddForbiddenUrl />
          <div className="mt-6 pt-6 border-t border-border">
            <ForbiddenUrlsList />
          </div>
        </div>

        {/* Theme selector — live component */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <ThemeSelector />
        </div>

        {/* Sync Panel — backup & restore */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <SyncPanel />
        </div>

        {/* Distraction Log — live component */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <DistractionLog />
        </div>

        {/* Scheduled Focus Sessions */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                စီစဉ်ထားသော focus အချိန်များ (Scheduled Focus)
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                ပုံမှန်စီစဉ်ထားသော focus အချိန်များကို စီမံခန့်ခွဲပါ
              </p>
            </div>
            <ScheduleForm />
          </div>
          <ScheduleList />
        </div>
      </div>
    </div>
  );
}
