import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { AntiFingerprintCollector } from "../../../src/collectors/anti-fingerprint";
import type { CollectorResult, CollectorResultSuccess } from "../../../src/collectors/types";

interface DetectedCountermeasure {
  technique: string;
  detected: boolean;
  description: string;
  tool?: string;
}

interface AntiFingerprintReport {
  detected: boolean;
  countermeasures: DetectedCountermeasure[];
  overallEffectiveness: "none" | "partial" | "strong";
}

describe("AntiFingerprintCollector", () => {
  let collector: AntiFingerprintCollector;
  let mockCanvas: {
    getContext: Mock;
    toDataURL: Mock;
  };

  beforeEach(() => {
    collector = new AntiFingerprintCollector();

    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      deviceMemory: 8,
      hardwareConcurrency: 8,
      mediaDevices: {
        enumerateDevices: vi.fn(),
      },
    });

    vi.stubGlobal("window", {
      requestAnimationFrame: vi.fn(),
      innerWidth: 1920,
      innerHeight: 1080,
    });

    mockCanvas = {
      getContext: vi.fn().mockReturnValue({
        fillText: vi.fn(),
      }),
      toDataURL: vi.fn().mockReturnValue("data:image/png;base64,123"),
    };

    vi.stubGlobal("document", {
      createElement: vi.fn().mockReturnValue(mockCanvas),
    });

    vi.stubGlobal("HTMLCanvasElement", {
      prototype: {
        toDataURL: function() {},
      }
    });
    
    vi.stubGlobal("AudioContext", {
      prototype: {
        createOscillator: function() {},
      }
    });

    // Mock native toString
    Function.prototype.toString = vi.fn().mockReturnValue("function ... { [native code] }");
  });

  function checkResult(result: CollectorResult): asserts result is CollectorResultSuccess {
    if (result.status !== "completed") {
      console.error("Collector Error:", result.status === "error" ? result.error : result.status);
      throw new Error(`Expected completed status, got ${result.status}`);
    }
  }

  it("should detect no countermeasures in a normal browser", async () => {
    const result: CollectorResult = await collector.collect();
    checkResult(result);
    const data = result.data as unknown as AntiFingerprintReport;
    expect(data.detected).toBe(false);
    expect(data.overallEffectiveness).toBe("none");
  });

  it("should detect canvas noise injection", async () => {
    mockCanvas.toDataURL
      .mockReturnValueOnce("data:image/png;base64,123")
      .mockReturnValueOnce("data:image/png;base64,456");

    const result: CollectorResult = await collector.collect();
    checkResult(result);
    const data = result.data as unknown as AntiFingerprintReport;
    const noiseCheck = data.countermeasures.find(c => c.technique === "Canvas noise injection");
    expect(noiseCheck?.detected).toBe(true);
    expect(data.detected).toBe(true);
  });

  it("should detect Firefox RFP", async () => {
    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
      deviceMemory: 8,
      hardwareConcurrency: 2,
    });

    // Mock Intl to return UTC using a class to satisfy Vitest's 'new' requirement
    vi.stubGlobal("Intl", {
      ...Intl,
      DateTimeFormat: class {
        resolvedOptions() {
          return { timeZone: "UTC" };
        }
      },
    });

    const result: CollectorResult = await collector.collect();
    checkResult(result);
    const data = result.data as unknown as AntiFingerprintReport;
    const rfpCheck = data.countermeasures.find(c => c.technique === "Firefox ResistFingerprinting");
    expect(rfpCheck?.detected).toBe(true);
    expect(data.overallEffectiveness).toBe("strong");
  });

  it("should detect prototype tampering", async () => {
    // Override toString to return something non-native
    Function.prototype.toString = vi.fn().mockReturnValue("function () { custom code }");

    const result: CollectorResult = await collector.collect();
    checkResult(result);
    const data = result.data as unknown as AntiFingerprintReport;
    const tamperingCheck = data.countermeasures.find(c => c.technique === "Prototype tampering");
    expect(tamperingCheck?.detected).toBe(true);
  });
});
