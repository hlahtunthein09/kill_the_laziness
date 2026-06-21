import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import type { MotivationContext } from "@/lib/motivation";

// Mock getMotivation to return predictable values
vi.mock("@/lib/motivation", () => ({
  getMotivation: vi.fn(() => ({
    my: "စတင်ကြည့်ရအောင်!",
    en: "Let's get started!",
    tier: "beginning" as const,
  })),
}));

// Import sonner first so we can spy on it
import { toast } from "sonner";
import { TimerToast } from "../TimerToast";

describe("TimerToast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls toast.info with Burmese message and English description on start trigger", () => {
    const spyInfo = vi.spyOn(toast, "info").mockImplementation(() => "toast-id");
    const context: MotivationContext = {
      elapsedSeconds: 0,
      remainingSeconds: 1500,
      isRunning: true,
      completedToday: 0,
    };

    render(<TimerToast context={context} trigger="start" />);

    expect(spyInfo).toHaveBeenCalledTimes(1);
    expect(spyInfo).toHaveBeenCalledWith("စတင်ကြည့်ရအောင်!", {
      description: "Let's get started!",
    });
    spyInfo.mockRestore();
  });

  it("calls toast.info on milestone trigger", () => {
    const spyInfo = vi.spyOn(toast, "info").mockImplementation(() => "toast-id");
    const context: MotivationContext = {
      elapsedSeconds: 300,
      remainingSeconds: 1200,
      isRunning: true,
      completedToday: 0,
    };

    render(<TimerToast context={context} trigger="milestone" />);

    expect(spyInfo).toHaveBeenCalledTimes(1);
    expect(spyInfo).toHaveBeenCalledWith("စတင်ကြည့်ရအောင်!", {
      description: "Let's get started!",
    });
    spyInfo.mockRestore();
  });

  it("calls toast.success on complete trigger", () => {
    const spySuccess = vi.spyOn(toast, "success").mockImplementation(() => "toast-id");
    const context: MotivationContext = {
      elapsedSeconds: 1500,
      remainingSeconds: 0,
      isRunning: false,
      completedToday: 1,
    };

    render(<TimerToast context={context} trigger="complete" />);

    expect(spySuccess).toHaveBeenCalledTimes(1);
    expect(spySuccess).toHaveBeenCalledWith("စတင်ကြည့်ရအောင်!", {
      description: "Let's get started!",
    });
    spySuccess.mockRestore();
  });

  it("does not toast when trigger is undefined", () => {
    const spyInfo = vi.spyOn(toast, "info").mockImplementation(() => "toast-id");
    const spySuccess = vi.spyOn(toast, "success").mockImplementation(() => "toast-id");
    const context: MotivationContext = {
      elapsedSeconds: 0,
      remainingSeconds: 1500,
      isRunning: false,
      completedToday: 0,
    };

    render(<TimerToast context={context} />);

    expect(spyInfo).not.toHaveBeenCalled();
    expect(spySuccess).not.toHaveBeenCalled();
    spyInfo.mockRestore();
    spySuccess.mockRestore();
  });

  it("does not re-toast when the same trigger is passed again", () => {
    const spyInfo = vi.spyOn(toast, "info").mockImplementation(() => "toast-id");
    const context: MotivationContext = {
      elapsedSeconds: 0,
      remainingSeconds: 1500,
      isRunning: true,
      completedToday: 0,
    };

    const { rerender } = render(<TimerToast context={context} trigger="start" />);
    expect(spyInfo).toHaveBeenCalledTimes(1);

    // Re-render with same trigger — should not toast again
    rerender(<TimerToast context={context} trigger="start" />);
    expect(spyInfo).toHaveBeenCalledTimes(1);
    spyInfo.mockRestore();
  });

  it("toasts again when trigger changes to a different value", () => {
    const spyInfo = vi.spyOn(toast, "info").mockImplementation(() => "toast-id");
    const context: MotivationContext = {
      elapsedSeconds: 0,
      remainingSeconds: 1500,
      isRunning: true,
      completedToday: 0,
    };

    const { rerender } = render(<TimerToast context={context} trigger="start" />);
    expect(spyInfo).toHaveBeenCalledTimes(1);

    rerender(<TimerToast context={context} trigger="milestone" />);
    expect(spyInfo).toHaveBeenCalledTimes(2);
    spyInfo.mockRestore();
  });
});
