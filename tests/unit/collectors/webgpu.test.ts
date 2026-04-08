import { describe, it, expect, vi, beforeEach } from "vitest";
import { WebGPUCollector } from "../../../src/collectors/webgpu";

describe("WebGPUCollector", () => {
  let collector: WebGPUCollector;

  beforeEach(() => {
    collector = new WebGPUCollector();

    // Mock WebGPU API
    const mockDevice = {
      createShaderModule: vi.fn().mockReturnValue({}),
      createComputePipeline: vi.fn().mockReturnValue({
        getBindGroupLayout: vi.fn().mockReturnValue({}),
      }),
      createBuffer: vi.fn().mockReturnValue({
        getMappedRange: vi.fn().mockReturnValue(new ArrayBuffer(4096)),
        unmap: vi.fn(),
        mapAsync: vi.fn().mockResolvedValue({}),
      }),
      createBindGroup: vi.fn().mockReturnValue({}),
      createCommandEncoder: vi.fn().mockReturnValue({
        beginComputePass: vi.fn().mockReturnValue({
          setPipeline: vi.fn(),
          setBindGroup: vi.fn(),
          dispatchWorkgroups: vi.fn(),
          end: vi.fn(),
        }),
        copyBufferToBuffer: vi.fn(),
        finish: vi.fn().mockReturnValue({}),
      }),
      queue: {
        submit: vi.fn(),
      },
    };

    const mockAdapter = {
      requestDevice: vi.fn().mockResolvedValue(mockDevice),
      requestAdapterInfo: vi.fn().mockResolvedValue({
        vendor: "Google",
        architecture: "Vulkan",
        device: "NVIDIA GeForce RTX 4090",
        description: "Google Vulkan Adapter",
      }),
    };

    vi.stubGlobal("navigator", {
      gpu: {
        requestAdapter: vi.fn().mockResolvedValue(mockAdapter),
      },
    });

    vi.stubGlobal("GPUBufferUsage", {
      STORAGE: 1,
      COPY_SRC: 2,
      COPY_DST: 4,
      MAP_READ: 8,
    });
    vi.stubGlobal("GPUMapMode", { READ: 1 });
  });

  it("should collect WebGPU adapter info and run benchmark", async () => {
    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.collectorId).toBe("webgpu");
    const data = result.data as { adapterInfo: { vendor: string; device: string }; computeHash: unknown; timingMs: number };
    expect(data.adapterInfo.vendor).toBe("Google");
    expect(data.adapterInfo.device).toContain("RTX 4090");
    expect(data.computeHash).toBeDefined();
    expect(data.timingMs).toBeGreaterThanOrEqual(0);

    const adapterSignal = result.signals.find((s) => s.key === "webgpu.adapter");
    expect(adapterSignal?.value).toContain("Google");
  });

  it("should handle unsupported WebGPU", async () => {
    vi.stubGlobal("navigator", { gpu: undefined });
    const result = await collector.collect();
    expect(result.status).toBe("unsupported");
    if (result.status === "unsupported") {
      expect(result.reason).toContain("not supported");
    }
  });
});
