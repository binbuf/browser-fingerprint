import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { WebGLCollector } from "../../../src/collectors/webgl";

describe("WebGLCollector", () => {
  let collector: WebGLCollector;

  beforeEach(() => {
    collector = new WebGLCollector();

    const mockGL = {
      getExtension: vi.fn().mockReturnValue({
        UNMASKED_VENDOR_WEBGL: 0x1,
        UNMASKED_RENDERER_WEBGL: 0x2,
      }),
      getParameter: vi.fn().mockImplementation((param) => {
        if (param === 0x1) return "Mock Vendor";
        if (param === 0x2) return "Mock Renderer";
        if (param === 3379) return 16384; // MAX_TEXTURE_SIZE
        if (param === 3386) return new Int32Array([16384, 16384]); // MAX_VIEWPORT_DIMS
        return null;
      }),
      getSupportedExtensions: vi.fn().mockReturnValue(["EXT_1", "EXT_2"]),
      getShaderPrecisionFormat: vi.fn().mockReturnValue({
        precision: 23,
        rangeMin: 127,
        rangeMax: 127,
      }),
      createShader: vi.fn().mockReturnValue({}),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      getShaderParameter: vi.fn().mockReturnValue(true),
      createProgram: vi.fn().mockReturnValue({}),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      getProgramParameter: vi.fn().mockReturnValue(true),
      useProgram: vi.fn(),
      createBuffer: vi.fn().mockReturnValue({}),
      bindBuffer: vi.fn(),
      bufferData: vi.fn(),
      getAttribLocation: vi.fn().mockReturnValue(0),
      enableVertexAttribArray: vi.fn(),
      vertexAttribPointer: vi.fn(),
      viewport: vi.fn(),
      clearColor: vi.fn(),
      clear: vi.fn(),
      drawArrays: vi.fn(),
      readPixels: vi.fn().mockImplementation((x, y, w, h, format, type, pixels) => {
        for (let i = 0; i < pixels.length; i++) pixels[i] = i % 256;
      }),
      canvas: { width: 0, height: 0 },
      VERTEX_SHADER: 1,
      FRAGMENT_SHADER: 2,
      HIGH_FLOAT: 3,
      MAX_TEXTURE_SIZE: 3379,
      MAX_VIEWPORT_DIMS: 3386,
      RGBA: 4,
      UNSIGNED_BYTE: 5,
      COLOR_BUFFER_BIT: 6,
      TRIANGLES: 7,
      COMPILE_STATUS: 8,
      LINK_STATUS: 9,
      STATIC_DRAW: 10,
      ARRAY_BUFFER: 11,
      FLOAT: 12,
    };

    const mockCanvas = {
      getContext: vi.fn().mockReturnValue(mockGL),
      width: 0,
      height: 0,
    };

    vi.stubGlobal("document", {
      createElement: vi.fn().mockReturnValue(mockCanvas),
    });

    vi.stubGlobal("performance", {
      now: () => Date.now(),
    });
  });

  it("should collect webgl properties correctly", async () => {
    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.collectorId).toBe("webgl");
    expect(result.data.vendor).toBe("Mock Vendor");
    expect(result.data.renderer).toBe("Mock Renderer");
    expect(result.data.extensions).toContain("EXT_1");
    expect(result.data.renderHash).toBeDefined();

    const vendorSignal = result.signals.find((s) => s.key === "webgl.vendor");
    expect(vendorSignal?.value).toBe("Mock Vendor");

    expect(result.hash).toBeDefined();
  });

  it("should return unsupported if webgl is not available", async () => {
    (document.createElement as Mock).mockReturnValueOnce({
      getContext: vi.fn().mockReturnValue(null),
    });

    const result = await collector.collect();
    expect(result.status).toBe("unsupported");
    if (result.status === "unsupported") {
      expect(result.reason).toBe("WebGL not supported");
    }
  });
});
