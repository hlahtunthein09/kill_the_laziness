import { describe, it, expect, vi } from "vitest";
import { exportStore } from "@/lib/sync";
import { useFocusStore } from "@/lib/store/useFocusStore";

vi.mock("@/lib/store/useFocusStore", () => ({
  useFocusStore: {
    getState: vi.fn(),
  },
}));

describe("exportStore", () => {
  it("returns valid JSON", () => {
    vi.mocked(useFocusStore.getState).mockReturnValue({
      projects: [],
      settings: {},
    } as unknown as ReturnType<typeof useFocusStore.getState>);

    const result = exportStore();
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it("exported JSON contains projects array", () => {
    vi.mocked(useFocusStore.getState).mockReturnValue({
      projects: [{ id: "p1", name: "Test Project" }],
      settings: {},
    } as unknown as ReturnType<typeof useFocusStore.getState>);

    const parsed = JSON.parse(exportStore());
    expect(parsed.projects).toBeInstanceOf(Array);
    expect(parsed.projects).toHaveLength(1);
    expect(parsed.projects[0].name).toBe("Test Project");
  });

  it("exported JSON contains settings object", () => {
    vi.mocked(useFocusStore.getState).mockReturnValue({
      projects: [],
      settings: { strictMode: true, dailyFocusGoalMinutes: 120 },
    } as unknown as ReturnType<typeof useFocusStore.getState>);

    const parsed = JSON.parse(exportStore());
    expect(parsed.settings).toBeInstanceOf(Object);
    expect(parsed.settings.strictMode).toBe(true);
    expect(parsed.settings.dailyFocusGoalMinutes).toBe(120);
  });

  it("export includes version and exportedAt", () => {
    vi.mocked(useFocusStore.getState).mockReturnValue({
      projects: [],
      settings: {},
    } as unknown as ReturnType<typeof useFocusStore.getState>);

    const parsed = JSON.parse(exportStore());
    expect(parsed.version).toBe(1);
    expect(typeof parsed.exportedAt).toBe("number");
    expect(parsed.exportedAt).toBeGreaterThan(0);
  });
});
