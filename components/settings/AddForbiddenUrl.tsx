"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFocusStore } from "@/lib/store/useFocusStore";

export function AddForbiddenUrl() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const forbiddenUrls = useFocusStore((s) => s.settings.forbiddenUrls);
  const addForbiddenUrl = useFocusStore((s) => s.addForbiddenUrl);

  const handleSubmit = () => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return;
    if (forbiddenUrls.includes(trimmed)) {
      setError("ဤဝဘ်ဆိုက်ကို ရှိပြီးသားဖြစ်သည် — ထပ်ထည့်မရပါ။");
      return;
    }
    setError("");
    addForbiddenUrl(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">
        တားမြစ်ထားသော ဝဘ်ဆိုက်များ
      </h2>
      <p className="text-sm text-muted-foreground mt-1">Forbidden URLs</p>
      <p className="text-sm text-muted-foreground mt-2">
        အောက်ပါဝဘ်ဆိုက်များသို့ ဝင်ရောက်ခြင်းကို တားမြစ်ထားမည် ဖြစ်သည်။
        တားမြစ်ထားသော ဝဘ်ဆိုက်များသို့ ဝင်ရောက်လိုပါက သတိပေးချက်ကို
        ပြသမည် (သို့) အခြားစာမျက်နှာသို့ ပြန်ညွှန်းမည် ဖြစ်သည်။
      </p>

      <div className="mt-4 flex items-start gap-2">
        <div className="flex-1">
          <Input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="ဥပမာ - instagram.com/reels"
            aria-label="Forbidden URL input"
          />
          {error && (
            <p className="mt-1 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
        <Button
          onClick={handleSubmit}
          aria-label="Add forbidden URL"
        >
          ထည့်မယ် (Add)
        </Button>
      </div>

      {forbiddenUrls.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {forbiddenUrls.map((url) => (
            <li
              key={url}
              className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
            >
              {url}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
