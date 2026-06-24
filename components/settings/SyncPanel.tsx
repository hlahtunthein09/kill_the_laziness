"use client";

import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { exportStore, importStore } from "@/lib/sync";
import { useRef, useState } from "react";

export function SyncPanel() {
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    setIsExporting(true);
    const data = exportStore();
    if (!data) {
      setIsExporting(false);
      return;
    }

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `focusflow-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = importStore(reader.result as string);
      if (result.ok) {
        setStatus({
          type: "success",
          message: "ဆင့် ပြန်တင်ပြီးပါပြီ (Backup restored)",
        });
      } else {
        setStatus({
          type: "error",
          message: "ဆင့် မမှန်ပါ (Invalid backup file)",
        });
      }
    };
    reader.readAsText(file);

    // Clear input value to allow re-selecting same file
    event.target.value = "";
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-stone-900">
            ဆင်စစ်မှု (Backup & Restore)
          </h2>
          <p className="text-sm text-stone-500 mt-2">
            သင့်ဒေတာကို JSON ဖိုင်အဖြစ် ထုတ်ယူပါ
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
            data-testid="file-input"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="border-sky-500 text-sky-600 hover:bg-sky-50"
          >
            <Upload className="mr-2 h-4 w-4" />
            ဆင့် JSON ပြန်တင်ရန် (Restore Backup)
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isExporting}
            className="bg-teal-500 hover:bg-teal-600 text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            ဆင့် JSON ဆွဲချ ရန် (Download Backup)
          </Button>
        </div>
      </div>
      {status && (
        <p
          className={`mt-3 text-sm ${
            status.type === "success" ? "text-emerald-600" : "text-red-500"
          }`}
          data-testid="status-message"
        >
          {status.message}
        </p>
      )}
    </div>
  );
}
