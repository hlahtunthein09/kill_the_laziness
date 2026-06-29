"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFocusStore } from "@/lib/store/useFocusStore";

export function ForbiddenUrlsList() {
  const forbiddenUrls = useFocusStore((s) => s.settings.forbiddenUrls);
  const removeForbiddenUrl = useFocusStore((s) => s.removeForbiddenUrl);
  const resetForbiddenUrls = useFocusStore((s) => s.resetForbiddenUrls);

  return (
    <div>
      {forbiddenUrls.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          တားမြစ်ထားသော ဝဘ်ဆိုက်များ မရှိသေးပါ။ / No forbidden URLs yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {forbiddenUrls.map((url) => (
            <li
              key={url}
              className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-2"
            >
              <span className="text-sm text-foreground">{url}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeForbiddenUrl(url)}
                className={cn("text-destructive hover:bg-destructive/10 hover:text-destructive")}
                aria-label={`Remove ${url}`}
              >
                ဖယ်ရှား (Remove)
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={resetForbiddenUrls}
        className={cn("mt-4 w-full")}
      >
        မူလသတ်မှတ်ချက်များအရ ပြန်ထားရန် (Reset to Defaults)
      </Button>
    </div>
  );
}
