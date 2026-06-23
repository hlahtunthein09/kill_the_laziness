import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeSelector } from "../ThemeSelector";
import { useFocusStore } from "@/lib/store/useFocusStore";
// @ts-expect-error mock export not in real types
import { mockSetTheme } from "next-themes";

// Mock the store
vi.mock("@/lib/store/useFocusStore", () => ({
  useFocusStore: vi.fn(),
}));

describe("ThemeSelector", () => {
  const mockUpdateSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetTheme.mockClear();
  });

  it("renders label and current theme from store", () => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        settings: { theme: "light" },
        updateSettings: mockUpdateSettings,
      })
    );

    render(<ThemeSelector />);

    expect(screen.getByText("အပြင်အဆင်")).toBeInTheDocument();
    expect(screen.getByText("Theme")).toBeInTheDocument();
  });

  it("selecting a theme calls both updateSettings and setTheme", () => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        settings: { theme: "light" },
        updateSettings: mockUpdateSettings,
      })
    );

    render(<ThemeSelector />);

    const select = screen.getByLabelText("Theme selector");
    fireEvent.change(select, { target: { value: "dark" } });

    expect(mockUpdateSettings).toHaveBeenCalledTimes(1);
    expect(mockUpdateSettings).toHaveBeenCalledWith({ theme: "dark" });
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });
});
