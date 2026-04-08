import { describe, it, expect, vi, beforeEach } from "vitest";
import { FaviconCacheCollector } from "../../../src/collectors/favicon-cache";

describe("FaviconCacheCollector", () => {
  let collector: FaviconCacheCollector;

  beforeEach(() => {
    collector = new FaviconCacheCollector();

    // Mock localStorage
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) || null,
      setItem: (key: string, value: string) => store.set(key, value),
      clear: () => store.clear(),
    });

    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
    });

    vi.stubGlobal("window", {
      location: {
        origin: "http://localhost:5173",
      },
    });
  });

  it("should detect vulnerability in older Chrome", async () => {
    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.data.browserVulnerable).toBe(true);
    expect(result.data.trackingId).toBeDefined();
    
    const vulnSignal = result.signals.find(s => s.key === "faviconCache.vulnerable");
    expect(vulnSignal?.value).toBe(true);
  });

  it("should detect mitigation in modern Chrome", async () => {
    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const result = await collector.collect();
    if (result.status !== "completed") throw new Error();
    expect(result.data.browserVulnerable).toBe(false);
  });

  it("should reuse tracking ID from localStorage", async () => {
    localStorage.setItem("bf_favicon_id", "existing-id");
    const result = await collector.collect();
    if (result.status !== "completed") throw new Error();
    expect(result.data.trackingId).toBe("existing-id");
  });
});
