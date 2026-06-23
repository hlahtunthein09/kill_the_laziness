import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { StoreHydrationProvider } from "../StoreHydrationProvider";
import { useFocusStore } from "@/lib/store/useFocusStore";

// Mock useStoreHydrated to return true so the provider renders children
vi.mock("@/hooks/useStoreHydrated", () => ({
  useStoreHydrated: () => true,
}));

describe("StoreHydrationProvider", () => {
  beforeEach(() => {
    // Reset store to empty state before each test
    useFocusStore.setState({
      projects: [],
      activeProjectId: null,
      hasHydrated: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates a default project when no projects exist after hydration", async () => {
    render(
      <StoreHydrationProvider>
        <div data-testid="child">Ready</div>
      </StoreHydrationProvider>
    );

    await waitFor(() => {
      const state = useFocusStore.getState();
      expect(state.projects.length).toBe(1);
    });

    const state = useFocusStore.getState();
    const project = state.projects[0];
    expect(project.name).toBe("နေ့စဥ် Focus နေရာ (Daily Focus)");
    expect(project.description).toBe("အလုပ်လုပ်ရန် အသင့်တော်ဆုံး နေရာပါ");
    expect(project.color).toBe("mint");
    expect(project.targetTimeSeconds).toBe(3600);
  });

  it("sets activeProjectId to the default project", async () => {
    render(
      <StoreHydrationProvider>
        <div data-testid="child">Ready</div>
      </StoreHydrationProvider>
    );

    await waitFor(() => {
      const state = useFocusStore.getState();
      expect(state.activeProjectId).not.toBeNull();
    });

    const state = useFocusStore.getState();
    expect(state.activeProjectId).toBe(state.projects[0].id);
  });

  it("does not add a default project when projects already exist", async () => {
    const existingProject = {
      id: "existing-123",
      name: "Existing Project",
      description: "Already here",
      color: "ocean" as const,
      createdAt: Date.now(),
      totalTimeSeconds: 0,
      targetTimeSeconds: 1800,
      status: "idle" as const,
      fortressLevel: 1,
      fortressHealth: 100,
      xp: 0,
      subPieces: [],
    };

    useFocusStore.setState({
      projects: [existingProject],
      activeProjectId: existingProject.id,
      hasHydrated: false,
    });

    render(
      <StoreHydrationProvider>
        <div data-testid="child">Ready</div>
      </StoreHydrationProvider>
    );

    await waitFor(() => {
      const state = useFocusStore.getState();
      expect(state.hasHydrated).toBe(true);
    });

    const state = useFocusStore.getState();
    expect(state.projects.length).toBe(1);
    expect(state.projects[0].name).toBe("Existing Project");
    expect(state.activeProjectId).toBe("existing-123");
  });
});
