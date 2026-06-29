import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DailyFocusGoalInput } from "../DailyFocusGoalInput";
import { useFocusStore } from "@/lib/store/useFocusStore";

vi.mock("@/lib/store/useFocusStore", () => ({
  useFocusStore: vi.fn(),
}));

describe("DailyFocusGoalInput", () => {
  const mockUpdateSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockStore = (dailyFocusGoalMinutes: number) => {
    // @ts-expect-error - mock return
    useFocusStore.mockImplementation((selector) =>
      selector({
        settings: { dailyFocusGoalMinutes },
        updateSettings: mockUpdateSettings,
      })
    );
  };

  it("renders current dailyFocusGoalMinutes value in disabled input", () => {
    mockStore(60);

    render(<DailyFocusGoalInput />);

    expect(screen.getByText("နေ့စဉ် focus ရည်မှန်းချိန်")).toBeInTheDocument();
    expect(screen.getByText("Daily Focus Goal (in minutes)")).toBeInTheDocument();

    const input = screen.getByLabelText("Daily focus goal in minutes");
    expect(input).toHaveValue(60);
    expect(input).toBeDisabled();
  });

  it("enables input and shows confirm button after clicking edit", () => {
    mockStore(60);

    render(<DailyFocusGoalInput />);

    const input = screen.getByLabelText("Daily focus goal in minutes");
    expect(input).toBeDisabled();

    fireEvent.click(screen.getByLabelText("Edit daily focus goal"));

    expect(input).not.toBeDisabled();
    expect(screen.getByLabelText("Confirm daily focus goal")).toBeInTheDocument();
  });

  it("updates store via updateSettings when confirming a new value", () => {
    mockStore(60);

    render(<DailyFocusGoalInput />);

    fireEvent.click(screen.getByLabelText("Edit daily focus goal"));

    const input = screen.getByLabelText("Daily focus goal in minutes");
    fireEvent.change(input, { target: { value: "120" } });
    fireEvent.click(screen.getByLabelText("Confirm daily focus goal"));

    expect(mockUpdateSettings).toHaveBeenCalledTimes(1);
    expect(mockUpdateSettings).toHaveBeenCalledWith({ dailyFocusGoalMinutes: 120 });
  });

  it("clamps value below 15 to 15 on confirm", () => {
    mockStore(60);

    render(<DailyFocusGoalInput />);

    fireEvent.click(screen.getByLabelText("Edit daily focus goal"));

    const input = screen.getByLabelText("Daily focus goal in minutes");
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.click(screen.getByLabelText("Confirm daily focus goal"));

    expect(mockUpdateSettings).toHaveBeenCalledWith({ dailyFocusGoalMinutes: 15 });
  });

  it("clamps value above 480 to 480 on confirm", () => {
    mockStore(60);

    render(<DailyFocusGoalInput />);

    fireEvent.click(screen.getByLabelText("Edit daily focus goal"));

    const input = screen.getByLabelText("Daily focus goal in minutes");
    fireEvent.change(input, { target: { value: "600" } });
    fireEvent.click(screen.getByLabelText("Confirm daily focus goal"));

    expect(mockUpdateSettings).toHaveBeenCalledWith({ dailyFocusGoalMinutes: 480 });
  });

  it("does not call updateSettings when value is unchanged", () => {
    mockStore(60);

    render(<DailyFocusGoalInput />);

    fireEvent.click(screen.getByLabelText("Edit daily focus goal"));
    fireEvent.click(screen.getByLabelText("Confirm daily focus goal"));

    expect(mockUpdateSettings).not.toHaveBeenCalled();
  });

  it("does not use hardcoded light-only classes", () => {
    mockStore(60);

    const { container } = render(<DailyFocusGoalInput />);

    const html = container.innerHTML;
    expect(html).not.toContain("bg-white");
    expect(html).not.toContain("text-stone-900");
    expect(html).not.toContain("border-stone-200");
  });
});
