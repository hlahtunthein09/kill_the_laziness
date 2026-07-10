import { describe, it, expect } from "vitest";
import { buildStageSchedule } from "../stageScheduler";

describe("stageScheduler.ts", () => {
  it("1-minute session (60s): start=0, milestones=[30], almost=49.5, complete=60", () => {
    const schedule = buildStageSchedule(60);
    expect(schedule.startTime).toBe(0);
    expect(schedule.milestoneTimes).toEqual([30]);
    expect(schedule.almostTime).toBe(49.5);
    expect(schedule.completeTime).toBe(60);
  });

  it("5-minute session (300s): start=0, milestones≈[125, 175], almost=247.5, complete=300", () => {
    const schedule = buildStageSchedule(300);
    expect(schedule.startTime).toBe(0);
    expect(schedule.milestoneTimes).toEqual([125, 175]);
    expect(schedule.almostTime).toBe(247.5);
    expect(schedule.completeTime).toBe(300);
  });

  it("90s session: 1 milestone at 45s, almost at 74.25s, complete at 90s", () => {
    const schedule = buildStageSchedule(90);
    expect(schedule.milestoneTimes).toHaveLength(1);
    expect(schedule.milestoneTimes[0]).toBe(45);
    expect(schedule.almostTime).toBe(74.25);
    expect(schedule.completeTime).toBe(90);
  });

  it("10-minute session (600s): 3 milestones inside 25%-75%, almost=495, complete=600", () => {
    const schedule = buildStageSchedule(600);
    expect(schedule.milestoneTimes).toHaveLength(3);
    expect(schedule.milestoneTimes).toEqual([225, 300, 375]);
    expect(schedule.almostTime).toBe(495);
    expect(schedule.completeTime).toBe(600);
  });

  it("1-hour session (3600s): 5 milestones inside 25%-75%, almost=2970, complete=3600", () => {
    const schedule = buildStageSchedule(3600);
    expect(schedule.milestoneTimes).toHaveLength(5);
    expect(schedule.milestoneTimes).toEqual([1200, 1500, 1800, 2100, 2400]);
    expect(schedule.almostTime).toBe(2970);
    expect(schedule.completeTime).toBe(3600);
  });

  it("5-hour session (18000s): 7 milestones inside 25%-75%, almost=14850, complete=18000", () => {
    const schedule = buildStageSchedule(18000);
    expect(schedule.milestoneTimes).toHaveLength(7);
    expect(schedule.milestoneTimes).toEqual([
      5625, 6750, 7875, 9000, 10125, 11250, 12375,
    ]);
    expect(schedule.almostTime).toBe(14850);
    expect(schedule.completeTime).toBe(18000);
  });

  it("milestones never fall outside 25%-75% and almost never outside 75%-90% for sampled durations", () => {
    const durations = [30, 60, 90, 120, 300, 600, 1200, 1800, 3600, 7200, 14400, 18000];
    for (const duration of durations) {
      const schedule = buildStageSchedule(duration);
      const milestoneMin = duration * 0.25;
      const milestoneMax = duration * 0.75;
      for (const milestone of schedule.milestoneTimes) {
        expect(milestone).toBeGreaterThanOrEqual(milestoneMin);
        expect(milestone).toBeLessThanOrEqual(milestoneMax);
      }
      expect(schedule.almostTime).toBeGreaterThanOrEqual(duration * 0.75);
      expect(schedule.almostTime).toBeLessThanOrEqual(duration * 0.9);
    }
  });

  it("milestoneTimes are strictly increasing for every sampled duration", () => {
    const durations = [30, 60, 120, 300, 600, 3600, 18000];
    for (const duration of durations) {
      const schedule = buildStageSchedule(duration);
      for (let i = 1; i < schedule.milestoneTimes.length; i++) {
        expect(schedule.milestoneTimes[i]).toBeGreaterThan(schedule.milestoneTimes[i - 1]);
      }
    }
  });

  it("invalid duration returns a zeroed schedule", () => {
    const schedule = buildStageSchedule(0);
    expect(schedule.startTime).toBe(0);
    expect(schedule.milestoneTimes).toEqual([]);
    expect(schedule.almostTime).toBe(0);
    expect(schedule.completeTime).toBe(0);
  });
});
