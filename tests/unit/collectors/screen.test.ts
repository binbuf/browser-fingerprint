import { describe, it, expect, vi, beforeEach } from "vitest";
import { ScreenCollector } from "../../../src/collectors/screen";

describe("ScreenCollector", () => {
  let collector: ScreenCollector;

  beforeEach(() => {
    collector = new ScreenCollector();

    // Mock window.screen
    vi.stubGlobal("window", {
      screen: {
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1040,
        colorDepth: 24,
        pixelDepth: 24,
        orientation: {
          type: "landscape-primary",
        },
      },
      devicePixelRatio: 2,
      performance: {
        now: () => Date.now(),
      },
    });

    vi.stubGlobal("performance", {
      now: () => Date.now(),
    });
  });

  it("should have correct metadata", () => {
    const metadata = collector.getMetadata();
    expect(metadata.id).toBe("screen");
    expect(metadata.name).toBe("Screen Resolution");
    expect(metadata.category).toBe("system-hardware");
    expect(metadata.stabilityWeight).toBe(0.6);
  });

  it("should collect screen properties correctly", async () => {
    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.collectorId).toBe("screen");
    expect(result.data.width).toBe(1920);
    expect(result.data.height).toBe(1080);
    expect(result.data.devicePixelRatio).toBe(2);
    expect(result.data.orientation).toBe("landscape-primary");

    const resolutionSignal = result.signals.find((s) => s.key === "screen.resolution");
    expect(resolutionSignal?.value).toBe("1920x1080");

    const colorDepthSignal = result.signals.find((s) => s.key === "screen.colorDepth");
    expect(colorDepthSignal?.value).toBe(24);

    const pixelRatioSignal = result.signals.find((s) => s.key === "screen.pixelRatio");
    expect(pixelRatioSignal?.value).toBe(2);

    expect(result.hash).toBeDefined();
    expect(typeof result.hash).toBe("string");
  });

  it("should handle missing orientation API", async () => {
    vi.stubGlobal("window", {
      screen: {
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1040,
        colorDepth: 24,
        pixelDepth: 24,
        // No orientation
      },
      devicePixelRatio: 2,
    });

    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.data.orientation).toBe("unknown");
  });
});
