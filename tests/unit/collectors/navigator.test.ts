import { describe, it, expect, vi, beforeEach } from "vitest";
import { NavigatorCollector } from "../../../src/collectors/navigator";

describe("NavigatorCollector", () => {
  let collector: NavigatorCollector;

  beforeEach(() => {
    collector = new NavigatorCollector();

    // Mock window.navigator
    vi.stubGlobal("window", {
      navigator: {
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
        platform: "Win32",
        language: "en-US",
        languages: ["en-US", "en"],
        hardwareConcurrency: 16,
        deviceMemory: 8,
        maxTouchPoints: 0,
        cookieEnabled: true,
        doNotTrack: "1",
        pdfViewerEnabled: true,
        vendor: "Google Inc.",
        webdriver: false,
      },
    });

    vi.stubGlobal("performance", {
      now: () => Date.now(),
    });
  });

  it("should have correct metadata", () => {
    const metadata = collector.getMetadata();
    expect(metadata.id).toBe("navigator");
    expect(metadata.name).toBe("Navigator Properties");
    expect(metadata.stabilityWeight).toBe(0.6);
  });

  it("should collect navigator properties correctly", async () => {
    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.collectorId).toBe("navigator");
    expect(result.data.platform).toBe("Win32");
    expect(result.data.hardwareConcurrency).toBe(16);
    expect(result.data.deviceMemory).toBe(8);

    const platformSignal = result.signals.find((s) => s.key === "navigator.platform");
    expect(platformSignal?.value).toBe("Win32");

    const languageSignal = result.signals.find((s) => s.key === "navigator.language");
    expect(languageSignal?.value).toBe("en-US");

    const coreSignal = result.signals.find((s) => s.key === "navigator.hardwareConcurrency");
    expect(coreSignal?.value).toBe(16);

    expect(result.hash).toBeDefined();
  });
});
