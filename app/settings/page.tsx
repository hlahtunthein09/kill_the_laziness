import { Settings } from "lucide-react";
import { StrictModeToggle } from "@/components/settings/StrictModeToggle";
import { AddForbiddenUrl } from "@/components/settings/AddForbiddenUrl";
import { ForbiddenUrlsList } from "@/components/settings/ForbiddenUrlsList";

const sections = [
  { burmese: "အသိပေးချက်များ", english: "Notifications" },
  { burmese: "အပြင်အဆင်", english: "Theme" },
];

export default function SettingsPage() {
  return (
    <div className="flex min-h-full flex-col gap-6 p-6 lg:p-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 md:text-3xl flex items-center gap-2">
          <Settings className="h-6 w-6 text-teal-500" />
          ဆက်တင်များ (Settings)
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          သငပြင်အဆင်များကို စီမံခန့်ခွဲပါ
        </p>
      </div>

      {/* Settings sections */}
      <div className="grid gap-4">
        {/* Strict Mode — live component */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <StrictModeToggle />
        </div>

        {/* Forbidden URLs — live component */}
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <AddForbiddenUrl />
          <div className="mt-6 pt-6 border-t border-stone-100">
            <ForbiddenUrlsList />
          </div>
        </div>

        {/* Placeholder sections */}
        {sections.map((section) => (
          <div
            key={section.english}
            className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-stone-900">
              {section.burmese}
            </h2>
            <p className="text-sm text-stone-500 mt-1">{section.english}</p>
            <div className="mt-4 h-8 rounded-md bg-stone-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
