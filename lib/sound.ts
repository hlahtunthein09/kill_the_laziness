import { useFocusStore } from "@/lib/store/useFocusStore";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function playTone(frequency: number, durationSeconds: number): void {
  if (!isBrowser()) return;

  const AudioCtx =
    window.AudioContext ||
    ((window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  osc.frequency.value = frequency;
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + durationSeconds);

  // Clean up the audio context after the tone finishes
  setTimeout(() => {
    ctx.close().catch(() => {
      // Ignore cleanup errors
    });
  }, durationSeconds * 1000 + 100);
}

export function playCompleteSound(): void {
  if (!isBrowser()) return;
  const { settings } = useFocusStore.getState();
  if (!settings.soundEnabled) return;
  playTone(880, 0.15);
}

export function playMilestoneSound(): void {
  if (!isBrowser()) return;
  const { settings } = useFocusStore.getState();
  if (!settings.soundEnabled) return;
  playTone(660, 0.1);
}
