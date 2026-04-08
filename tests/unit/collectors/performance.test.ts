import { describe, it, expect, vi, beforeEach } from "vitest";
import { PerformanceCollector } from "../../../src/collectors/performance";

describe("PerformanceCollector", () => {
  let collector: PerformanceCollector;

  beforeEach(() => {
    collector = new PerformanceCollector();
  });

  it("should collect performance timing information", async () => {
    let nowValue = 1000;
    const mockPerformance = {
      now: vi.fn(() => {
        nowValue += 0.1; // Simulated 0.1ms resolution
        return nowValue;
      }),
      timeOrigin: 1600000000000,
    };

    vi.stubGlobal("window", {
      performance: mockPerformance
    });
    vi.stubGlobal("performance", mockPerformance);

    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.collectorId).toBe("performance");
    expect(result.data.timeOrigin).toBe(1600000000000);
    // Based on the mock incrementing by 0.1
    expect(result.data.timerResolution).toBeCloseTo(0.1);

    const resolutionSignal = result.signals.find((s) => s.key === "performance.timerResolution");
    expect(resolutionSignal?.value).toBeCloseTo(0.1);
  });
});
