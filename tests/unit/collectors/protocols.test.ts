import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProtocolCollector } from "../../../src/collectors/protocols";

// Mock the protocol list to be small for tests
vi.mock("../../../src/data/protocol-handlers", () => ({
  protocolHandlerList: [
    { scheme: "zoommtg", applicationName: "Zoom", platforms: ["windows"], category: "communication" },
    { scheme: "slack", applicationName: "Slack", platforms: ["windows"], category: "communication" },
  ],
}));

describe("ProtocolCollector", () => {
  let collector: ProtocolCollector;

  beforeEach(() => {
    collector = new ProtocolCollector();

    // Mock window and performance
    vi.stubGlobal("performance", {
      now: vi.fn(() => Date.now()),
    });

    const originalSetTimeout = setTimeout;
    vi.stubGlobal("setTimeout", (cb: () => void) => {
        // Trigger timeout in next tick using the original setTimeout
        return originalSetTimeout(cb, 0);
    });

    vi.stubGlobal("window", {
      _onBlur: null as (() => void) | null,
      addEventListener: vi.fn((event, cb) => {
          if (event === "blur") {
              (window as unknown as { _onBlur: () => void })._onBlur = cb;
          }
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn((event: { type: string }) => {
          if (event.type === "blur" && (window as unknown as { _onBlur: () => void })._onBlur) {
              (window as unknown as { _onBlur: () => void })._onBlur();
          }
      }),
    });

    vi.stubGlobal("Event", class {
      type: string;
      constructor(type: string) { this.type = type; }
    });

    class MockIFrame {
        style = {};
        src = "";
    }
    vi.stubGlobal("HTMLIFrameElement", MockIFrame);

    vi.stubGlobal("document", {
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
      createElement: vi.fn((tag: string) => {
        if (tag === "iframe") {
            return new MockIFrame();
        }
        return {
            style: {},
        };
      }),
    });
  });

  it("should have correct metadata", () => {
    const metadata = collector.getMetadata();
    expect(metadata.id).toBe("protocols");
    expect(metadata.category).toBe("installed-software");
    expect(metadata.stabilityWeight).toBe(0.6);
  });

  it("should detect protocols via blur event", async () => {
    // Mock iframe.src assignment to trigger blur
    // This is tricky because the collector creates the iframe inside probeProtocol
    
    const createElementSpy = vi.spyOn(document, "createElement");
    
    // We want to trigger blur as soon as src is set
    vi.spyOn(document.body, "appendChild").mockImplementation((node) => {
        if (node instanceof HTMLIFrameElement) {
            // Simulate blur after a short delay
            setTimeout(() => {
                window.dispatchEvent(new Event('blur'));
            }, 10);
        }
        return node;
    });

    const result = await collector.collect();

    if (result.status === "error") {
      throw new Error(`Collector failed with error: ${result.error}`);
    }

    expect(result.status).toBe("completed");
    if (result.status === "completed") {
      // In this mock, ALL protocols will be detected because blur is triggered for every iframe
      const data = result.data as { detectedCount: number; inferredApplications: string[] };
      expect(data.detectedCount).toBeGreaterThan(0);
      expect(data.inferredApplications.length).toBeGreaterThan(0);
    }

    createElementSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it("should not detect protocols if timeout fires first", async () => {
    // Mock timeout to be very fast or mock blur to never happen
    
    const result = await collector.collect();

    if (result.status === "completed") {
      // Since blur is not triggered in this test (no mock for it),
      // it should detect 0 protocols.
      expect(result.data.detectedCount).toBe(0);
    }
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
});
