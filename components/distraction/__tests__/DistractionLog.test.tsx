import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DistractionLog } from "../DistractionLog";

const mockClearLogs = vi.fn();

const createMockStore = (logs: any[]) => ({
  logs,
  clearLogs: mockClearLogs,
});

vi.mock("@/lib/store/useFocusStore", () => ({
  useFocusStore: vi.fn(),
}));

import { useFocusStore } from "@/lib/store/useFocusStore";

describe("DistractionLog", () => {
  beforeEach(() => {
    mockClearLogs.mockClear();
    vi.mocked(useFocusStore).mockImplementation((selector: any) => {
      const state = createMockStore([
        { id: "1", timestamp: Date.now() - 60000, url: "youtube.com/shorts", action: "blocked" as const, projectId: "p1" },
        { id: "2", timestamp: Date.now() - 300000, url: "reddit.com", action: "warned" as const, projectId: "p1" },
      ]);
      return selector(state);
    });
  });

  it("renders Burmese title", () => {
    render(<DistractionLog />);
    expect(screen.getByText("အာရုံစားသမျှမှတ်တမ်း")).toBeInTheDocument();
    expect(screen.getByText("Distraction Log")).toBeInTheDocument();
  });

  it("renders log entries with URL and action", () => {
    render(<DistractionLog />);
    expect(screen.getByText("youtube.com/shorts")).toBeInTheDocument();
    expect(screen.getByText("reddit.com")).toBeInTheDocument();
    expect(screen.getByText("တားမြစ်ခဲ့သည် (Blocked)")).toBeInTheDocument();
    expect(screen.getByText("သတိပေးခဲ့သည် (Warned)")).toBeInTheDocument();
  });

  it("does not contain hardcoded light-only classes", () => {
    const { container } = render(<DistractionLog />);
    const html = container.innerHTML;
    expect(html).not.toMatch(/\bbg-white\b/);
    expect(html).not.toMatch(/\btext-stone-900\b/);
    expect(html).not.toMatch(/\bborder-stone-200\b/);
  });

  it("calls clearLogs when clear button clicked", () => {
    render(<DistractionLog />);
    const clearBtn = screen.getByRole("button", { name: /Clear/ });
    fireEvent.click(clearBtn);
    expect(mockClearLogs).toHaveBeenCalledTimes(1);
  });
});

describe("DistractionLog empty state", () => {
  it("renders empty state when logs array is empty", () => {
    vi.mocked(useFocusStore).mockImplementation((selector: any) => {
      const state = createMockStore([]);
      return selector(state);
    });
    render(<DistractionLog />);
    expect(screen.getByText(/No distractions logged yet/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Clear/ })).not.toBeInTheDocument();
  });
});
