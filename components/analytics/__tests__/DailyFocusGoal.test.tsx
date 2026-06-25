import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DailyFocusGoal } from "../DailyFocusGoal";
import { useFocusStore } from "@/lib/store/useFocusStore";
import { DEFAULT_APP_SETTINGS } from "@/lib/constants";

describe("DailyFocusGoal", () => {
  beforeEach(() => {
    useFocusStore.setState({
      projects: [],
      activeProjectId: null,
      settings: { ...DEFAULT_APP_SETTINGS },
      logs: [],
      hasHydrated: false,
    });
  });

  it("renders today's minutes and goal minutes from the store", () => {
    useFocusStore.setState({
      settings: {
        ...DEFAULT_APP_SETTINGS,
        todayFocusSeconds: 3661,
        dailyFocusGoalMinutes: 120,
      },
    });

    render(<DailyFocusGoal />);

    expect(screen.getByText("61 / 120")).toBeInTheDocument();
    expect(screen.getByText("မိနစ်")).toBeInTheDocument();
  });

  it("renders 50% progress when today is half the goal", () => {
    useFocusStore.setState({
      settings: {
        ...DEFAULT_APP_SETTINGS,
        todayFocusSeconds: 1800, // 30 minutes
        dailyFocusGoalMinutes: 60,
      },
    });

    render(<DailyFocusGoal />);

    expect(screen.getByText("50% achieved")).toBeInTheDocument();
    expect(screen.getByTestId("progress-fill")).toHaveStyle("width: 50%");
  });

  it("caps progress at 100% when today exceeds the goal", () => {
    useFocusStore.setState({
      settings: {
        ...DEFAULT_APP_SETTINGS,
        todayFocusSeconds: 9000, // 150 minutes
        dailyFocusGoalMinutes: 120,
      },
    });

    render(<DailyFocusGoal />);

    expect(screen.getByText("100% achieved (Goal reached)")).toBeInTheDocument();
    expect(screen.getByTestId("progress-fill")).toHaveStyle("width: 100%");
  });

  it("renders 0% progress when todayFocusSeconds is 0", () => {
    useFocusStore.setState({
      settings: {
        ...DEFAULT_APP_SETTINGS,
        todayFocusSeconds: 0,
        dailyFocusGoalMinutes: 60,
      },
    });

    render(<DailyFocusGoal />);

    expect(screen.getByText("0% achieved")).toBeInTheDocument();
    expect(screen.getByTestId("progress-fill")).toHaveStyle("width: 0%");
  });

  it("renders 0 / 60 and 0% when settings fields are missing (old persisted state)", () => {
    useFocusStore.setState({
      settings: {
        ...DEFAULT_APP_SETTINGS,
        todayFocusSeconds: undefined as unknown as number,
        dailyFocusGoalMinutes: undefined as unknown as number,
      },
    });

    render(<DailyFocusGoal />);

    expect(screen.getByText("0 / 60")).toBeInTheDocument();
    expect(screen.getByText("0% achieved")).toBeInTheDocument();
    expect(screen.getByTestId("progress-fill")).toHaveStyle("width: 0%");
  });

  it("renders Burmese title", () => {
    render(<DailyFocusGoal />);

    expect(screen.getByText(/နေ့စဉ် focus ရည်မှန်းချက်/)).toBeInTheDocument();
  });
});
