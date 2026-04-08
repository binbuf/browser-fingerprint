import { describe, it, expect, vi, beforeEach } from "vitest";
import { MathCollector } from "../../../src/collectors/math";

describe("MathCollector", () => {
  let collector: MathCollector;

  beforeEach(() => {
    collector = new MathCollector();

    vi.stubGlobal("performance", {
      now: () => Date.now(),
    });
  });

  it("should collect math properties correctly", async () => {
    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.collectorId).toBe("math");
    expect(result.data.tan).toBeDefined();
    expect(result.data.atan2).toBeDefined();

    const tanSignal = result.signals.find((s) => s.key === "math.tan");
    expect(typeof tanSignal?.value).toBe("string");

    const atanSignal = result.signals.find((s) => s.key === "math.atan2");
    expect(typeof atanSignal?.value).toBe("string");

    expect(result.hash).toBeDefined();
  });
});
