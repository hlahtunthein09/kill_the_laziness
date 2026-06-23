import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ForbiddenUrlsList } from "../ForbiddenUrlsList";
import { useFocusStore } from "@/lib/store/useFocusStore";

vi.mock("@/lib/store/useFocusStore", () => ({
  useFocusStore: vi.fn(),
}));

describe("ForbiddenUrlsList", () => {
  const mockRemoveForbiddenUrl = vi.fn();
  const mockResetForbiddenUrls = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no forbidden URLs", () => {
    (useFocusStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector({
          settings: { forbiddenUrls: [] },
          removeForbiddenUrl: mockRemoveForbiddenUrl,
          resetForbiddenUrls: mockResetForbiddenUrls,
        })
    );

    render(<ForbiddenUrlsList />);

    expect(
      screen.getByText(/တားမြစ်ထားသော ဝဘ်ဆိုက်များ မရှိသေးပါ။/)
    ).toBeInTheDocument();
    expect(screen.getByText(/No forbidden URLs yet./)).toBeInTheDocument();
  });

  it("renders list of URLs when URLs exist", () => {
    (useFocusStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector({
          settings: { forbiddenUrls: ["youtube.com/shorts", "tiktok.com"] },
          removeForbiddenUrl: mockRemoveForbiddenUrl,
          resetForbiddenUrls: mockResetForbiddenUrls,
        })
    );

    render(<ForbiddenUrlsList />);

    expect(screen.getByText("youtube.com/shorts")).toBeInTheDocument();
    expect(screen.getByText("tiktok.com")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Remove youtube.com/shorts")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Remove tiktok.com")).toBeInTheDocument();
  });

  it("clicking remove button calls removeForbiddenUrl(url)", () => {
    (useFocusStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector({
          settings: { forbiddenUrls: ["youtube.com/shorts", "tiktok.com"] },
          removeForbiddenUrl: mockRemoveForbiddenUrl,
          resetForbiddenUrls: mockResetForbiddenUrls,
        })
    );

    render(<ForbiddenUrlsList />);

    const removeButton = screen.getByLabelText("Remove tiktok.com");
    fireEvent.click(removeButton);

    expect(mockRemoveForbiddenUrl).toHaveBeenCalledTimes(1);
    expect(mockRemoveForbiddenUrl).toHaveBeenCalledWith("tiktok.com");
  });

  it("clicking reset button calls resetForbiddenUrls()", () => {
    (useFocusStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector({
          settings: { forbiddenUrls: ["youtube.com/shorts"] },
          removeForbiddenUrl: mockRemoveForbiddenUrl,
          resetForbiddenUrls: mockResetForbiddenUrls,
        })
    );

    render(<ForbiddenUrlsList />);

    const resetButton = screen.getByText(/Reset to Defaults/);
    fireEvent.click(resetButton);

    expect(mockResetForbiddenUrls).toHaveBeenCalledTimes(1);
  });
});
