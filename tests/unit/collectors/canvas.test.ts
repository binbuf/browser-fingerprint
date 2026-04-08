import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { CanvasCollector } from "../../../src/collectors/canvas";

describe("CanvasCollector", () => {
  let collector: CanvasCollector;

  beforeEach(() => {
    collector = new CanvasCollector();

    // Mock document.createElement('canvas')
    const mockCanvas = {
      getContext: vi.fn(),
      toDataURL: vi.fn().mockReturnValue("data:image/png;base64,mock"),
      width: 0,
      height: 0,
    };

    const mockCtx = {
      createLinearGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn(),
      }),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowBlur: 0,
      shadowColor: "",
      globalCompositeOperation: "",
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      font: "",
    };

    mockCanvas.getContext.mockReturnValue(mockCtx);
    vi.stubGlobal("document", {
      createElement: vi.fn().mockReturnValue(mockCanvas),
    });

    vi.stubGlobal("performance", {
      now: () => Date.now(),
    });
  });

  it("should collect canvas properties correctly", async () => {
    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.collectorId).toBe("canvas");
    expect(result.data.hash).toBeDefined();
    expect(result.data.dataUrl).toBe("data:image/png;base64,mock");

    const hashSignal = result.signals.find((s) => s.key === "canvas.hash");
    expect(hashSignal?.value).toBe(result.data.hash);

    expect(result.hash).toBeDefined();
  });

  it("should return unsupported if context is not available", async () => {
    (document.createElement as Mock).mockReturnValueOnce({
      getContext: vi.fn().mockReturnValue(null),
    });

    const result = await collector.collect();
    expect(result.status).toBe("unsupported");
    if (result.status === "unsupported") {
      expect(result.reason).toBe("Canvas 2D context not available");
    }
  });
});
