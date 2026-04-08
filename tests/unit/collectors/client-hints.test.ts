import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClientHintsCollector } from "../../../src/collectors/client-hints";

describe("ClientHintsCollector", () => {
  let collector: ClientHintsCollector;

  beforeEach(() => {
    collector = new ClientHintsCollector();
    vi.stubGlobal("window", {
      performance: {
        now: () => Date.now(),
      },
      navigator: {}
    });
  });

  it("should return unsupported if userAgentData is missing", async () => {
    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      navigator: {}
    });
    const result = await collector.collect();
    expect(result.status).toBe("unsupported");
    expect(result.collectorId).toBe("client-hints");
  });

  it("should collect basic and high-entropy client hints", async () => {
    const mockUserAgentData = {
      brands: [{ brand: "Google Chrome", version: "113" }],
      mobile: false,
      platform: "Windows",
      getHighEntropyValues: vi.fn().mockResolvedValue({
        architecture: "x86",
        bitness: "64",
        model: "PC",
        platformVersion: "10.0.0",
        wow64: false,
      }),
    };

    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      navigator: {
        userAgentData: mockUserAgentData,
      }
    });

    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.collectorId).toBe("client-hints");
    expect(result.data.platform).toBe("Windows");
    expect(result.data.architecture).toBe("x86");
    expect(result.data.bitness).toBe("64");

    const platformSignal = result.signals.find((s) => s.key === "clientHints.platform");
    expect(platformSignal?.value).toBe("Windows");

    const archSignal = result.signals.find((s) => s.key === "clientHints.architecture");
    expect(archSignal?.value).toBe("x86");
  });

  it("should fall back to basic data if getHighEntropyValues fails", async () => {
    const mockUserAgentData = {
      brands: [{ brand: "Google Chrome", version: "113" }],
      mobile: false,
      platform: "Windows",
      getHighEntropyValues: vi.fn().mockRejectedValue(new Error("Failed")),
    };

    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      navigator: {
        userAgentData: mockUserAgentData,
      }
    });

    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.data.platform).toBe("Windows");
    expect(result.data.architecture).toBeUndefined();
    
    const platformSignal = result.signals.find((s) => s.key === "clientHints.platform");
    expect(platformSignal?.value).toBe("Windows");
    
    const archSignal = result.signals.find((s) => s.key === "clientHints.architecture");
    expect(archSignal?.value).toBe("unknown");
  });
});
