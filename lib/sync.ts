import { useFocusStore } from "./store/useFocusStore";

export function exportStore(): string {
  const state = useFocusStore.getState();

  const exportData = {
    version: 1,
    exportedAt: Date.now(),
    projects: state.projects ?? [],
    settings: state.settings ?? {},
  };

  return JSON.stringify(exportData, null, 2);
}

export function importStore(
  json: string
): { ok: true } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(json);

    if (typeof parsed.version !== "number") {
      return { ok: false, error: "Invalid backup file" };
    }
    if (!Array.isArray(parsed.projects)) {
      return { ok: false, error: "Invalid backup file" };
    }
    if (!parsed.settings || typeof parsed.settings !== "object") {
      return { ok: false, error: "Invalid backup file" };
    }

    for (const project of parsed.projects) {
      if (typeof project.id !== "string" || typeof project.name !== "string") {
        return { ok: false, error: "Invalid backup file" };
      }
    }

    if (!Array.isArray(parsed.settings.forbiddenUrls)) {
      return { ok: false, error: "Invalid backup file" };
    }

    useFocusStore.setState({
      projects: parsed.projects,
      settings: parsed.settings,
    });

    return { ok: true };
  } catch {
    return { ok: false, error: "Invalid backup file" };
  }
}
