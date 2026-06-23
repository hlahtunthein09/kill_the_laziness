"use client";

import { cn } from "@/lib/utils";
import { useFocusStore } from "@/lib/store/useFocusStore";

export function StrictModeToggle() {
  const settings = useFocusStore((s) => s.settings);
  const updateSettings = useFocusStore((s) => s.updateSettings);

  const isChecked = settings.strictMode;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-stone-900">
          အထူးသတိပြုရန် မုဒ်
        </h2>
        <p className="text-sm text-stone-500 mt-1">Strict Mode</p>
        <p className="text-sm text-stone-500 mt-2">
          အထူးသတိပြုရန် မုဒ်ဖွင့်ထားပါက တားမြစ်ထားသော ဝဘ်ဆိုက်များသို့
          ဝင်ရောက်လိုပါက အခြားစာမျက်နှာသို့ ပြန်ညွှန်းမည် ဖြစ်သည်။
        </p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isChecked}
          onChange={() => updateSettings({ strictMode: !isChecked })}
          aria-label="Toggle strict mode"
        />
        <div
          className={cn(
            "w-11 h-6 rounded-full transition-colors duration-200",
            "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300",
            isChecked ? "bg-teal-500" : "bg-stone-300"
          )}
        />
        <div
          className={cn(
            "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
            isChecked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </label>
    </div>
  );
}
