// WXT auto-imports globals for entrypoints during its build.
// This file provides minimal declarations so root tsc can check entrypoints.

declare function defineBackground(fn: () => void): { main: () => void };
declare function defineContentScript(
  definition: Record<string, unknown>
): Record<string, unknown>;
declare function definePopup(
  fn: () => void
): { main: () => void };
