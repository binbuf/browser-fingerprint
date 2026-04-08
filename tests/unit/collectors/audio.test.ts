import { describe, it, expect, vi, beforeEach } from "vitest";
import { AudioContextCollector } from "../../../src/collectors/audio";

describe("AudioContextCollector", () => {
  let collector: AudioContextCollector;

  beforeEach(() => {
    collector = new AudioContextCollector();

    const mockBuffer = {
      getChannelData: vi.fn().mockReturnValue(new Float32Array(5000).fill(0.1)),
    };

    const mockContext = {
      createOscillator: vi.fn().mockReturnValue({
        type: "",
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
      }),
      createDynamicsCompressor: vi.fn().mockReturnValue({
        threshold: { setValueAtTime: vi.fn() },
        knee: { setValueAtTime: vi.fn() },
        ratio: { setValueAtTime: vi.fn() },
        attack: { setValueAtTime: vi.fn() },
        release: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
      }),
      destination: {},
      currentTime: 0,
      startRendering: vi.fn().mockResolvedValue(mockBuffer),
    };

    // Use a regular function so it can be used with 'new'
    const MockOfflineAudioContext = vi.fn().mockImplementation(function() {
      return mockContext;
    });

    // Stub window with OfflineAudioContext
    vi.stubGlobal("window", {
      OfflineAudioContext: MockOfflineAudioContext,
      performance: {
        now: () => Date.now(),
      },
    });

    vi.stubGlobal("performance", {
      now: () => Date.now(),
    });
  });

  it("should collect audio properties correctly", async () => {
    const result = await collector.collect();

    if (result.status !== "completed") {
      const errorMsg = result.status === "error" ? result.error : "";
      throw new Error(`Expected completed status, got ${result.status}. ${errorMsg}`);
    }

    expect(result.collectorId).toBe("audio");
    expect(result.data.hash).toBeDefined();
    expect(result.data.sampleSum).toBeCloseTo(50, 1); // 500 * 0.1 (from index 4500 to 5000)

    const hashSignal = result.signals.find((s) => s.key === "audio.hash");
    expect(hashSignal?.value).toBe(result.data.hash);

    expect(result.hash).toBeDefined();
  });

  it("should return unsupported if OfflineAudioContext is not available", async () => {
    vi.stubGlobal("window", {
      performance: {
        now: () => Date.now(),
      },
    });

    const result = await collector.collect();
    expect(result.status).toBe("unsupported");
    if (result.status === "unsupported") {
      expect(result.reason).toBe("OfflineAudioContext not supported");
    }
  });
});
