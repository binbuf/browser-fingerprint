import { describe, it, expect, vi, beforeEach } from "vitest";
import { FontCollector } from "../../../src/collectors/fonts";

describe("FontCollector", () => {
  let collector: FontCollector;

  beforeEach(() => {
    collector = new FontCollector();

    // Mock window and performance
    vi.stubGlobal("performance", {
      now: vi.fn(() => Date.now()),
    });

    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 0);
    });

    // Mock HTMLElement
    class MockElement {
      style = {};
      appendChild = vi.fn();
      removeChild = vi.fn();
      get offsetWidth() { return 100; }
      get offsetHeight() { return 20; }
    }
    vi.stubGlobal("HTMLElement", MockElement);
    vi.stubGlobal("HTMLDivElement", class extends MockElement {});
    vi.stubGlobal("HTMLSpanElement", class extends MockElement {});

    // Mock document
    vi.stubGlobal("document", {
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
      createElement: vi.fn((tag: string) => {
        const el = new MockElement();
        if (tag === "div") return el;
        if (tag === "span") return el;
        return el;
      }),
    });
  });

  it("should have correct metadata", () => {
    const metadata = collector.getMetadata();
    expect(metadata.id).toBe("fonts");
    expect(metadata.category).toBe("installed-software");
    expect(metadata.stabilityWeight).toBe(1.0);
  });

  it("should detect fonts when dimensions differ from baseline", async () => {
    // Mock offsetWidth/offsetHeight
    // We want to simulate that some fonts are detected
    // The collector compares (font + base) against (base)
    
    const mockFont = "Arial";
    
    // Create a spy on document.createElement
    const createElementSpy = vi.spyOn(document, "createElement");
    
    // We need to mock offsetWidth/offsetHeight of the spans
    // This is tricky because they are created inside the collector
    
    // Let's mock HTMLElement.prototype.offsetWidth
    const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");
    const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");

    let callCount = 0;
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get() {
        callCount++;
        // The first 3 calls are for baselines (serif, sans-serif, monospace)
        if (callCount <= 3) return 100;
        
        // For subsequent calls, if the font-family contains our mock font, return different dimension
        const style = this.style.fontFamily;
        if (style && style.includes(mockFont)) {
          return 120; // Detected!
        }
        return 100; // Not detected
      }
    });

    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      configurable: true,
      get() {
        return 20;
      }
    });

    // We only want to test a small subset of fonts to keep the test fast
    // But the collector uses the full fontList.
    // I'll just let it run, it should be fine in a mock environment.

    const result = await collector.collect();

    expect(result.status).toBe("completed");
    if (result.status === "completed") {
      expect(result.data.detectedFonts).toContain(mockFont);
      expect((result.data.detectedFonts as string[]).length).toBeGreaterThan(0);
    }

    // Restore original descriptors
    if (originalOffsetWidth) Object.defineProperty(HTMLElement.prototype, "offsetWidth", originalOffsetWidth);
    if (originalOffsetHeight) Object.defineProperty(HTMLElement.prototype, "offsetHeight", originalOffsetHeight);
    createElementSpy.mockRestore();
  });

  it("should respect AbortSignal", async () => {
    const controller = new AbortController();
    controller.abort();

    const result = await collector.collect(controller.signal);
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.error).toBe("Aborted");
    }
  });

  it("should correctly group fonts by category and infer software", async () => {
    // Mock offsetWidth to detect "Calibri" (MS Office) and "Myriad Pro" (Adobe)
    const detectedFonts = ["Calibri", "Myriad Pro"];
    
    const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get() {
        const style = this.style.fontFamily;
        if (style && detectedFonts.some(f => style.includes(f))) {
          return 150;
        }
        return 100;
      }
    });

    const result = await collector.collect();

    if (result.status === "completed") {
      const data = result.data as unknown as { categories: Record<string, string[]>, inferredSoftware: string[] };
      const categories = data.categories;
      expect(categories["ms-office"]).toContain("Calibri");
      expect(categories["adobe"]).toContain("Myriad Pro");
      expect(data.inferredSoftware).toContain("Microsoft Office");
      expect(data.inferredSoftware).toContain("Adobe Creative Suite");
    }

    if (originalOffsetWidth) Object.defineProperty(HTMLElement.prototype, "offsetWidth", originalOffsetWidth);
  });
});
