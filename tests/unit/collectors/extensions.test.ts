import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { ExtensionCollector } from "../../../src/collectors/extensions";
import type { ExtensionEntry, ExtensionCategory } from "../../../src/data/types";

describe("ExtensionCollector", () => {
  let collector: ExtensionCollector;

  beforeEach(() => {
    collector = new ExtensionCollector();

    // Mock window and performance
    const mockWindow = {
      chrome: {},
      performance: {
        now: vi.fn(() => Date.now()),
      },
      requestIdleCallback: (cb: () => void) => setTimeout(cb, 0),
      fetch: vi.fn(),
    };

    vi.stubGlobal("window", mockWindow);
    vi.stubGlobal("performance", mockWindow.performance);
    vi.stubGlobal("fetch", mockWindow.fetch);
    vi.stubGlobal("requestIdleCallback", mockWindow.requestIdleCallback);
  });

  it("should have correct metadata", () => {
    const metadata = collector.getMetadata();
    expect(metadata.id).toBe("extensions");
    expect(metadata.category).toBe("installed-software");
    expect(metadata.stabilityWeight).toBe(0.3);
  });

  it("should return unsupported on non-Chromium browsers", async () => {
    vi.stubGlobal("window", {
      performance: {
        now: vi.fn(() => Date.now()),
      },
    });
    const result = await collector.collect();
    expect(result.status).toBe("unsupported");
    if (result.status === "unsupported") {
      expect(result.reason).toContain("Chromium-specific technique");
    }
  });

  it("should detect extensions when fetch succeeds", async () => {
    const mockExtId = "cjpalhdlnbpafiamejdnhcphjbkeiagm"; // uBlock Origin
    
    (fetch as Mock).mockImplementation((url: string) => {
      if (url.includes(mockExtId)) {
        return Promise.resolve({ ok: true });
      }
      return Promise.reject(new Error("Resource not found"));
    });

    const result = await collector.collect();

    expect(result.status).toBe("completed");
    if (result.status === "completed") {
      const data = result.data as unknown as { detectedExtensions: ExtensionEntry[], detectedCount: number };
      expect(data.detectedExtensions).toContainEqual(
        expect.objectContaining({ id: mockExtId, name: "uBlock Origin" })
      );
      expect(data.detectedCount).toBeGreaterThan(0);
    }
  });

  it("should respect AbortSignal", async () => {
    const controller = new AbortController();
    (fetch as Mock).mockImplementation((_url: string, init: { signal: AbortSignal }) => {
        if (init.signal.aborted) {
            return Promise.reject(new Error("Aborted"));
        }
        return new Promise((_, reject) => {
            init.signal.addEventListener('abort', () => reject(new Error("Aborted")));
        });
    });

    const collectPromise = collector.collect(controller.signal);
    controller.abort();
    
    const result = await collectPromise;
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.error).toBe("Aborted");
    }
  });

  it("should correctly group extensions by category", async () => {
    (fetch as Mock).mockImplementation(() => Promise.resolve({ ok: true }));

    const result = await collector.collect();

    if (result.status === "completed") {
      const data = result.data as unknown as { categories: Record<ExtensionCategory, ExtensionEntry[]> };
      const categories = data.categories;
      expect(categories["ad-blocker"]).toBeDefined();
      expect(categories["ad-blocker"].length).toBeGreaterThan(0);
    }
  });
});
