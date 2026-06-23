"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useFocusStore } from "@/lib/store/useFocusStore";
import { cn } from "@/lib/utils";

const themeOptions = [
  { value: "light" as const, label: "လင်းရောင်", icon: Sun },
  { value: "dark" as const, label: "မှောင်ရောင်", icon: Moon },
  { value: "system" as const, label: "စက်အလိုက်", icon: Monitor },
];

export function ThemeSelector() {
  const settings = useFocusStore((s) => s.settings);
  const updateSettings = useFocusStore((s) => s.updateSettings);
  const { setTheme } = useTheme();

  const currentTheme = settings.theme ?? "system";

  function handleChange(value: string) {
    const theme = value as "light" | "dark" | "system";
    updateSettings({ theme });
    setTheme(theme);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-900">အပြင်အဆင်</h2>
      <p className="text-sm text-stone-500 mt-1">Theme</p>
      <p className="text-sm text-stone-500 mt-2">
        အက်ပပြင်အဆင်ကို ပြောင်းလဲရန် ရွေးချယ်ပါ
      </p>
      <div className="mt-4">
        <div className="relative">
          <select
            value={currentTheme}
            onChange={(e) => handleChange(e.target.value)}
            aria-label="Theme selector"
            className={cn(
              "w-full appearance-none rounded-lg border border-stone-200 bg-white px-3 py-2.5 pr-10 text-sm text-stone-900",
              "focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20",
              "dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            )}
          >
            {themeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            {(() => {
              const Icon =
                themeOptions.find((o) => o.value === currentTheme)?.icon ??
                Monitor;
              return <Icon className="h-4 w-4 text-stone-500" />;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
