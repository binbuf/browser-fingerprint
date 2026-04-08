import { describe, it, expect, vi, beforeEach } from "vitest";
import { CSSMediaCollector } from "../../../src/collectors/css-media";

describe("CSSMediaCollector", () => {
  let collector: CSSMediaCollector;

  beforeEach(() => {
    collector = new CSSMediaCollector();

    // Mock window.matchMedia
    vi.stubGlobal("window", {
      matchMedia: vi.fn().mockImplementation((query: string) => ({
        matches:
          query === "(prefers-color-scheme: dark)" ||
          query === "(prefers-reduced-motion: reduce)" ||
          query === "(pointer: fine)" ||
          query === "(hover: hover)" ||
          query === "(color-gamut: p3)" ||
          query === "(dynamic-range: high)",
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    vi.stubGlobal("performance", {
      now: () => Date.now(),
    });
  });

  it("should collect CSS media query properties correctly", async () => {
    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.collectorId).toBe("css-media");
    expect(result.data.prefersColorScheme).toBe("dark");
    expect(result.data.reducedMotion).toBe("reduce");
    expect(result.data.pointer).toBe("fine");

    const colorSchemeSignal = result.signals.find((s) => s.key === "css.prefersColorScheme");
    expect(colorSchemeSignal?.value).toBe("dark");

    const reducedMotionSignal = result.signals.find((s) => s.key === "css.reducedMotion");
    expect(reducedMotionSignal?.value).toBe("reduce");

    const pointerSignal = result.signals.find((s) => s.key === "css.pointerType");
    expect(pointerSignal?.value).toBe("fine");

    expect(result.hash).toBeDefined();
  });
});
