import { describe, it, expect, vi, beforeEach } from "vitest";
import { importStore } from "@/lib/sync";
import { useFocusStore } from "@/lib/store/useFocusStore";

vi.mock("@/lib/store/useFocusStore", () => ({
  useFocusStore: {
    setState: vi.fn(),
    getState: vi.fn(),
  },
}));

describe("importStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("loads valid JSON into store", () => {
    const validData = JSON.stringify({
      version: 1,
      projects: [
        {
          id: "p1",
          name: "Test Project",
          description: "desc",
          color: "mint",
          createdAt: 0,
          totalTimeSeconds: 0,
          targetTimeSeconds: 3600,
          status: "idle",
          fortressLevel: 1,
          fortressHealth: 100,
          xp: 0,
          subPieces: [],
        },
      ],
      settings: {
        forbiddenUrls: ["youtube.com/shorts"],
        strictMode: false,
        notificationsEnabled: true,
        soundEnabled: true,
        theme: "light",
        dailyFocusGoalMinutes: 60,
        todayFocusSeconds: 0,
        lastFocusDate: "",
        currentStreak: 0,
        longestStreak: 0,
        lastStreakDate: "",
      },
    });

    const result = importStore(validData);
    expect(result).toEqual({ ok: true });
    expect(useFocusStore.setState).toHaveBeenCalledWith({
      projects: expect.any(Array),
      settings: expect.any(Object),
    });
  });

  it("rejects invalid JSON string", () => {
    const result = importStore("not json at all");
    expect(result).toEqual({ ok: false, error: "Invalid backup file" });
    expect(useFocusStore.setState).not.toHaveBeenCalled();
  });

  it("rejects missing version", () => {
    const data = JSON.stringify({
      projects: [],
      settings: { forbiddenUrls: [] },
    });

    const result = importStore(data);
    expect(result).toEqual({ ok: false, error: "Invalid backup file" });
    expect(useFocusStore.setState).not.toHaveBeenCalled();
  });

  it("rejects projects without required fields", () => {
    const data = JSON.stringify({
      version: 1,
      projects: [{ name: "Missing ID" }],
      settings: { forbiddenUrls: [] },
    });

    const result = importStore(data);
    expect(result).toEqual({ ok: false, error: "Invalid backup file" });
    expect(useFocusStore.setState).not.toHaveBeenCalled();
  });
});
