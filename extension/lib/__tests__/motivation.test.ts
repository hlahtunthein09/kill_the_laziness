import { describe, it, expect } from 'vitest';
import { getMotivation, type MotivationContext, type MotivationTier } from '../motivation';

describe('getMotivation', () => {
  it('returns a Burmese string for beginning tier', () => {
    const ctx: MotivationContext = {
      elapsedSeconds: 30,
      remainingSeconds: 600,
      isRunning: true,
      completedToday: 0,
    };
    const result = getMotivation(ctx);
    expect(result.tier).toBe('beginning');
    expect(result.my).toBeTruthy();
    expect(result.my.length).toBeGreaterThan(0);
    expect(result.en).toBeTruthy();
  });

  it('returns a Burmese string for completing tier', () => {
    const ctx: MotivationContext = {
      elapsedSeconds: 600,
      remainingSeconds: 30,
      isRunning: true,
      completedToday: 0,
    };
    const result = getMotivation(ctx);
    expect(result.tier).toBe('completing');
    expect(result.my).toBeTruthy();
    expect(result.my.length).toBeGreaterThan(0);
  });

  it('returns a Burmese string for struggling tier', () => {
    const ctx: MotivationContext = {
      elapsedSeconds: 400,
      remainingSeconds: 600,
      isRunning: true,
      completedToday: 0,
    };
    const result = getMotivation(ctx);
    expect(result.tier).toBe('struggling');
    expect(result.my).toBeTruthy();
    expect(result.my.length).toBeGreaterThan(0);
  });

  it('returns a Burmese string for succeeding tier', () => {
    const ctx: MotivationContext = {
      elapsedSeconds: 150,
      remainingSeconds: 300,
      isRunning: true,
      completedToday: 1,
    };
    const result = getMotivation(ctx);
    expect(result.tier).toBe('succeeding');
    expect(result.my).toBeTruthy();
    expect(result.my.length).toBeGreaterThan(0);
  });

  it('picks beginning tier when elapsed < 60s', () => {
    const ctx: MotivationContext = {
      elapsedSeconds: 30,
      remainingSeconds: 600,
      isRunning: true,
      completedToday: 0,
    };
    expect(getMotivation(ctx).tier).toBe('beginning');
  });

  it('picks completing tier when remaining < 60s', () => {
    const ctx: MotivationContext = {
      elapsedSeconds: 600,
      remainingSeconds: 30,
      isRunning: true,
      completedToday: 0,
    };
    expect(getMotivation(ctx).tier).toBe('completing');
  });

  it('picks struggling tier when elapsed > 300s and remaining > 300s', () => {
    const ctx: MotivationContext = {
      elapsedSeconds: 400,
      remainingSeconds: 600,
      isRunning: true,
      completedToday: 0,
    };
    expect(getMotivation(ctx).tier).toBe('struggling');
  });

  it('picks struggling tier when elapsed > 300s and no remaining', () => {
    const ctx: MotivationContext = {
      elapsedSeconds: 400,
      isRunning: true,
      completedToday: 0,
    };
    expect(getMotivation(ctx).tier).toBe('struggling');
  });

  it('picks succeeding tier when elapsed > 60s and remaining between 60s and 300s', () => {
    const ctx: MotivationContext = {
      elapsedSeconds: 150,
      remainingSeconds: 120,
      isRunning: true,
      completedToday: 0,
    };
    expect(getMotivation(ctx).tier).toBe('succeeding');
  });

  it('picks succeeding tier when elapsed > 60s and no remaining', () => {
    const ctx: MotivationContext = {
      elapsedSeconds: 150,
      isRunning: true,
      completedToday: 0,
    };
    expect(getMotivation(ctx).tier).toBe('succeeding');
  });

  it('each tier has at least 3 messages', () => {
    // beginning
    const b = getMotivation({ elapsedSeconds: 30, remainingSeconds: 600, isRunning: true, completedToday: 0 });
    expect(b.tier).toBe('beginning');

    // completing
    const c = getMotivation({ elapsedSeconds: 600, remainingSeconds: 30, isRunning: true, completedToday: 0 });
    expect(c.tier).toBe('completing');

    // struggling
    const s = getMotivation({ elapsedSeconds: 400, remainingSeconds: 600, isRunning: true, completedToday: 0 });
    expect(s.tier).toBe('struggling');

    // succeeding
    const su = getMotivation({ elapsedSeconds: 150, remainingSeconds: 120, isRunning: true, completedToday: 0 });
    expect(su.tier).toBe('succeeding');
  });
});
