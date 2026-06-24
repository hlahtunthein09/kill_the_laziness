import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { playCompleteSound, playMilestoneSound } from "@/lib/sound";
import { useFocusStore } from "@/lib/store/useFocusStore";

// Mock the Zustand store
vi.mock("@/lib/store/useFocusStore", () => ({
  useFocusStore: {
    getState: vi.fn(),
  },
}));

describe("sound", () => {
  let mockAudioContext: {
    createOscillator: ReturnType<typeof vi.fn>;
    destination: { connect: ReturnType<typeof vi.fn> };
    currentTime: number;
    close: ReturnType<typeof vi.fn>;
  };
  let mockOscillator: {
    frequency: { value: number };
    connect: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.useFakeTimers();

    mockOscillator = {
      frequency: { value: 0 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    mockAudioContext = {
      createOscillator: vi.fn(() => mockOscillator),
      destination: { connect: vi.fn() },
      currentTime: 0,
      close: vi.fn().mockResolvedValue(undefined),
    };

    // @ts-expect-error - mocking global AudioContext as a class
    global.AudioContext = class {
      constructor() {
        return mockAudioContext as unknown as AudioContext;
      }
    };
    // @ts-expect-error - mocking webkitAudioContext as a class
    global.webkitAudioContext = class {
      constructor() {
        return mockAudioContext as unknown as AudioContext;
      }
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("playCompleteSound", () => {
    it("plays tone when soundEnabled is true", () => {
      vi.mocked(useFocusStore.getState).mockReturnValue({
        settings: { soundEnabled: true },
      } as ReturnType<typeof useFocusStore.getState>);

      playCompleteSound();

      expect(useFocusStore.getState).toHaveBeenCalled();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockOscillator.frequency.value).toBe(880);
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(mockOscillator.stop).toHaveBeenCalledWith(0.15);
    });

    it("does not play when soundEnabled is false", () => {
      vi.mocked(useFocusStore.getState).mockReturnValue({
        settings: { soundEnabled: false },
      } as ReturnType<typeof useFocusStore.getState>);

      playCompleteSound();

      expect(useFocusStore.getState).toHaveBeenCalled();
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });
  });

  describe("playMilestoneSound", () => {
    it("plays tone when soundEnabled is true", () => {
      vi.mocked(useFocusStore.getState).mockReturnValue({
        settings: { soundEnabled: true },
      } as ReturnType<typeof useFocusStore.getState>);

      playMilestoneSound();

      expect(useFocusStore.getState).toHaveBeenCalled();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockOscillator.frequency.value).toBe(660);
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(mockOscillator.stop).toHaveBeenCalledWith(0.1);
    });

    it("does not play when soundEnabled is false", () => {
      vi.mocked(useFocusStore.getState).mockReturnValue({
        settings: { soundEnabled: false },
      } as ReturnType<typeof useFocusStore.getState>);

      playMilestoneSound();

      expect(useFocusStore.getState).toHaveBeenCalled();
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });
  });
});
