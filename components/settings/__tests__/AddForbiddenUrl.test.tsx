import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddForbiddenUrl } from "../AddForbiddenUrl";
import { useFocusStore } from "@/lib/store/useFocusStore";

vi.mock("@/lib/store/useFocusStore", () => ({
  useFocusStore: vi.fn(),
}));

describe("AddForbiddenUrl", () => {
  const mockAddForbiddenUrl = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders label, input, and add button", () => {
    (useFocusStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector({
          settings: { forbiddenUrls: ["youtube.com/shorts"] },
          addForbiddenUrl: mockAddForbiddenUrl,
        })
    );

    render(<AddForbiddenUrl />);

    expect(
      screen.getByText("တားမြစ်ထားသော ဝဘ်ဆိုက်များ")
    ).toBeInTheDocument();
    expect(screen.getByText("Forbidden URLs")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("ဥပမာ - instagram.com/reels")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Add forbidden URL")).toBeInTheDocument();
  });

  it("typing in input updates the input value", () => {
    (useFocusStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector({
          settings: { forbiddenUrls: [] },
          addForbiddenUrl: mockAddForbiddenUrl,
        })
    );

    render(<AddForbiddenUrl />);

    const input = screen.getByLabelText(
      "Forbidden URL input"
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "twitter.com" } });
    expect(input.value).toBe("twitter.com");
  });

  it("clicking add with valid URL calls addForbiddenUrl with trimmed value and clears input", () => {
    (useFocusStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector({
          settings: { forbiddenUrls: [] },
          addForbiddenUrl: mockAddForbiddenUrl,
        })
    );

    render(<AddForbiddenUrl />);

    const input = screen.getByLabelText(
      "Forbidden URL input"
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "  twitter.com  " } });

    const button = screen.getByLabelText("Add forbidden URL");
    fireEvent.click(button);

    expect(mockAddForbiddenUrl).toHaveBeenCalledTimes(1);
    expect(mockAddForbiddenUrl).toHaveBeenCalledWith("twitter.com");
    expect(input.value).toBe("");
  });

  it("clicking add with empty input does NOT call addForbiddenUrl", () => {
    (useFocusStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector({
          settings: { forbiddenUrls: [] },
          addForbiddenUrl: mockAddForbiddenUrl,
        })
    );

    render(<AddForbiddenUrl />);

    const button = screen.getByLabelText("Add forbidden URL");
    fireEvent.click(button);

    expect(mockAddForbiddenUrl).not.toHaveBeenCalled();
  });

  it("clicking add with duplicate URL shows Burmese error message and does NOT call addForbiddenUrl", () => {
    (useFocusStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector({
          settings: { forbiddenUrls: ["youtube.com/shorts"] },
          addForbiddenUrl: mockAddForbiddenUrl,
        })
    );

    render(<AddForbiddenUrl />);

    const input = screen.getByLabelText(
      "Forbidden URL input"
    ) as HTMLInputElement;
    fireEvent.change(input, {
      target: { value: "youtube.com/shorts" },
    });

    const button = screen.getByLabelText("Add forbidden URL");
    fireEvent.click(button);

    expect(mockAddForbiddenUrl).not.toHaveBeenCalled();
    expect(
      screen.getByText("ဤဝဘ်ဆိုက်ကို ရှိပြီးသားဖြစ်သည် — ထပ်ထည့်မရပါ။")
    ).toBeInTheDocument();
  });
});
