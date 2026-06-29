import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StrictModeToggle } from "../StrictModeToggle";
import { useFocusStore } from "@/lib/store/useFocusStore";

// Mock the store
vi.mock("@/lib/store/useFocusStore", () => ({
  useFocusStore: vi.fn(),
}));

describe("StrictModeToggle", () => {
  const mockUpdateSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders label and unchecked by default", () => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        settings: { strictMode: false },
        updateSettings: mockUpdateSettings,
      })
    );

    render(<StrictModeToggle />);

    expect(screen.getByText("အထူးသတိပြုရန် မုဒ်")).toBeInTheDocument();
    expect(screen.getByText("Strict Mode")).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("renders checked when strictMode is true", () => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        settings: { strictMode: true },
        updateSettings: mockUpdateSettings,
      })
    );

    render(<StrictModeToggle />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("clicking toggle calls updateSettings with toggled value", () => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        settings: { strictMode: false },
        updateSettings: mockUpdateSettings,
      })
    );

    render(<StrictModeToggle />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(mockUpdateSettings).toHaveBeenCalledTimes(1);
    expect(mockUpdateSettings).toHaveBeenCalledWith({ strictMode: true });
  });

  it("does not contain hardcoded light-only classes", () => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        settings: { strictMode: false },
        updateSettings: mockUpdateSettings,
      })
    );

    const { container } = render(<StrictModeToggle />);
    const html = container.innerHTML;

    expect(html).not.toContain("bg-white");
    expect(html).not.toContain("bg-stone-300");
    expect(html).not.toContain("text-stone-900");
  });
});
