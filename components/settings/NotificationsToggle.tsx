"use client";

import { cn } from "@/lib/utils";
import { useFocusStore } from "@/lib/store/useFocusStore";

export function NotificationsToggle() {
  const settings = useFocusStore((s) => s.settings);
  const updateSettings = useFocusStore((s) => s.updateSettings);

  const isChecked = settings.notificationsEnabled;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-foreground">
          အသိပေးချက်များ
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Notifications</p>
        <p className="text-sm text-muted-foreground mt-2">
          ပိတ်ထားပါက toast နှင့် desktop အသိပေးချက်များ ရောက်မလာတော့ပါ။
        </p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isChecked}
          onChange={() => updateSettings({ notificationsEnabled: !isChecked })}
          aria-label="Toggle notifications"
        />
        <div
          className={cn(
            "w-11 h-6 rounded-full transition-colors duration-200",
            "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring",
            isChecked ? "bg-primary" : "bg-muted"
          )}
        />
        <div
          className={cn(
            "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform duration-200",
            isChecked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </label>
    </div>
  );
}
