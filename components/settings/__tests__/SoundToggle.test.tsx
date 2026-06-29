import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SoundToggle } from "../SoundToggle";
import { useFocusStore } from "@/lib/store/useFocusStore";

// Mock the store
vi.mock("@/lib/store/useFocusStore", () => ({
  useFocusStore: vi.fn(),
}));

describe("SoundToggle", () => {
  const mockUpdateSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Burmese label", () => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        settings: { soundEnabled: true },
        updateSettings: mockUpdateSettings,
      })
    );

    render(<SoundToggle />);

    expect(screen.getByText("အသံသတိပေးချက်များ (Sound Alerts)")).toBeInTheDocument();
  });

  it("renders English label", () => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        settings: { soundEnabled: true },
        updateSettings: mockUpdateSettings,
      })
    );

    render(<SoundToggle />);

    const heading = screen.getByRole("heading");
    expect(heading).toHaveTextContent("Sound Alerts");
  });

  it("toggle reflects soundEnabled state", () => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        settings: { soundEnabled: false },
        updateSettings: mockUpdateSettings,
      })
    );

    render(<SoundToggle />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("clicking toggle calls updateSettings with toggled value", () => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        settings: { soundEnabled: false },
        updateSettings: mockUpdateSettings,
      })
    );

    render(<SoundToggle />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(mockUpdateSettings).toHaveBeenCalledTimes(1);
    expect(mockUpdateSettings).toHaveBeenCalledWith({ soundEnabled: true });
  });

  it("does not use hardcoded light-only classes for dark mode compatibility", () => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        settings: { soundEnabled: true },
        updateSettings: mockUpdateSettings,
      })
    );

    const { container } = render(<SoundToggle />);
    const html = container.innerHTML;

    expect(html).not.toContain("bg-white");
    expect(html).not.toContain("bg-stone-300");
    expect(html).not.toContain("text-stone-900");
  });
});