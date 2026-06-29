import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationsToggle } from "../NotificationsToggle";
import { useFocusStore } from "@/lib/store/useFocusStore";

// Mock the store
vi.mock("@/lib/store/useFocusStore", () => ({
  useFocusStore: vi.fn(),
}));

describe("NotificationsToggle", () => {
  const mockUpdateSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders label and checked by default", () => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        settings: { notificationsEnabled: true },
        updateSettings: mockUpdateSettings,
      })
    );

    render(<NotificationsToggle />);

    expect(screen.getByText("အသိပေးချက်များ")).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("renders unchecked when notificationsEnabled is false", () => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        settings: { notificationsEnabled: false },
        updateSettings: mockUpdateSettings,
      })
    );

    render(<NotificationsToggle />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("clicking toggle calls updateSettings with toggled value", () => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        settings: { notificationsEnabled: false },
        updateSettings: mockUpdateSettings,
      })
    );

    render(<NotificationsToggle />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(mockUpdateSettings).toHaveBeenCalledTimes(1);
    expect(mockUpdateSettings).toHaveBeenCalledWith({ notificationsEnabled: true });
  });

  it("does not use hardcoded light-only classes on the toggle track or knob", () => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        settings: { notificationsEnabled: true },
        updateSettings: mockUpdateSettings,
      })
    );

    const { container } = render(<NotificationsToggle />);
    const html = container.innerHTML;

    expect(html).not.toContain("bg-white");
    expect(html).not.toContain("bg-stone-300");
    expect(html).not.toContain("text-stone-900");
  });
});