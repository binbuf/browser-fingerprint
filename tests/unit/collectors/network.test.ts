import { describe, it, expect, vi, beforeEach } from "vitest";
import { NetworkCollector } from "../../../src/collectors/network";

describe("NetworkCollector", () => {
  let collector: NetworkCollector;

  beforeEach(() => {
    collector = new NetworkCollector();

    // Mock window.navigator.connection
    vi.stubGlobal("window", {
      navigator: {
        connection: {
          effectiveType: "4g",
          downlink: 10,
          rtt: 50,
          saveData: false,
        },
      },
    });

    vi.stubGlobal("performance", {
      now: () => Date.now(),
    });
  });

  it("should collect network properties correctly", async () => {
    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.collectorId).toBe("network");
    expect(result.data.effectiveType).toBe("4g");
    expect(result.data.downlink).toBe(10);

    const typeSignal = result.signals.find((s) => s.key === "network.effectiveType");
    expect(typeSignal?.value).toBe("4g");

    const downlinkSignal = result.signals.find((s) => s.key === "network.downlink");
    expect(downlinkSignal?.value).toBe(10);

    expect(result.hash).toBeDefined();
  });

  it("should handle unsupported Network Information API", async () => {
    vi.stubGlobal("window", {
      navigator: {
        // No connection
      },
    });

    const result = await collector.collect();
    expect(result.status).toBe("unsupported");
    if (result.status === "unsupported") {
      expect(result.reason).toContain("not supported");
    }
  });
});
