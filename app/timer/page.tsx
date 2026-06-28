import { TimerPanel } from "@/components/timer/TimerPanel";

export default function TimerPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          အချိန်မှတ်တမ်း (Timer)
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Focus on your current sub-piece and track your progress
        </p>
      </div>
      <TimerPanel />
    </div>
  );
}
