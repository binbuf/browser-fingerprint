import type {
  Collector,
  CollectorCategory,
  CollectorMetadata,
  CollectorResult,
  SignalEntry,
} from "./types";
import { registry, CollectorPriority } from "./registry";
import { hashData, sha256 } from "../utils/hash";

/**
 * WebGPUCollector — Performs GPU-level fingerprinting via compute shaders and adapter info.
 * This technique is highly stable as it's tied to the physical GPU hardware and drivers.
 */
export class WebGPUCollector implements Collector {
  readonly id = "webgpu";
  readonly name = "WebGPU Fingerprinting";
  readonly category: CollectorCategory = "gpu-rendering";
  readonly description = "Probes GPU hardware capabilities and performance via WebGPU compute shaders.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      if (!navigator.gpu) {
        return {
          collectorId: this.id,
          status: "unsupported",
          durationMs: performance.now() - start,
          timestamp: Date.now(),
          reason: "WebGPU is not supported by this browser.",
        };
      }

      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        return {
          collectorId: this.id,
          status: "unsupported",
          durationMs: performance.now() - start,
          timestamp: Date.now(),
          reason: "No WebGPU adapter found.",
        };
      }

      // 1. Extract Adapter Info
      // @ts-expect-error - requestAdapterInfo is part of the spec but might not be in all TS types yet
      const adapterInfo = adapter.requestAdapterInfo ? await adapter.requestAdapterInfo() : {};
      const info = {
        vendor: adapterInfo.vendor || "unknown",
        architecture: adapterInfo.architecture || "unknown",
        device: adapterInfo.device || "unknown",
        description: adapterInfo.description || "unknown",
      };

      // 2. Run Compute Shader for timing/fingerprinting
      const device = await adapter.requestDevice();
      const { computeHash, timingMs } = await this.runComputeBenchmark(device);

      const data = {
        adapterInfo: info,
        computeHash,
        timingMs,
      };

      const signals: SignalEntry[] = [
        {
          key: "webgpu.adapter",
          value: `${info.vendor} ${info.device}`,
          label: "WebGPU Adapter",
        },
        {
          key: "webgpu.computeHash",
          value: computeHash,
          label: "WebGPU Compute Hash",
        },
      ];

      return {
        collectorId: this.id,
        status: "completed",
        durationMs: performance.now() - start,
        timestamp: Date.now(),
        data,
        hash: await hashData(data),
        signals,
      };
    } catch (error) {
      return {
        collectorId: this.id,
        status: "error",
        durationMs: performance.now() - start,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async runComputeBenchmark(device: GPUDevice): Promise<{ computeHash: string; timingMs: number }> {
    const shaderCode = `
      @group(0) @binding(0) var<storage, read_write> data: array<f32>;

      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) id: vec3<u32>) {
          let i = id.x;
          // Some arbitrary arithmetic to stress the ALU
          var val = data[i];
          for (var j = 0u; j < 100u; j = j + 1u) {
              val = val * 1.0001 + f32(j) * 0.0001;
              val = sin(val) + cos(val);
          }
          data[i] = val;
      }
    `;

    const shaderModule = device.createShaderModule({ code: shaderCode });
    const pipeline = device.createComputePipeline({
      layout: "auto",
      compute: { module: shaderModule, entryPoint: "main" },
    });

    const size = 1024;
    const buffer = device.createBuffer({
      size: size * 4,
      // @ts-expect-error - WebGPU types may not be fully recognized in the current environment
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });

    const array = new Float32Array(buffer.getMappedRange());
    for (let i = 0; i < size; i++) array[i] = i;
    buffer.unmap();

    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer } }],
    });

    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.dispatchWorkgroups(Math.ceil(size / 64));
    passEncoder.end();

    const readBuffer = device.createBuffer({
      size: size * 4,
      // @ts-expect-error - WebGPU types may not be fully recognized in the current environment
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });

    commandEncoder.copyBufferToBuffer(buffer, 0, readBuffer, 0, size * 4);

    const gpuStart = performance.now();
    device.queue.submit([commandEncoder.finish()]);

    // @ts-expect-error - WebGPU types may not be fully recognized in the current environment
    await readBuffer.mapAsync(GPUMapMode.READ);
    const timingMs = performance.now() - gpuStart;
    
    const result = new Float32Array(readBuffer.getMappedRange());
    const computeHash = await sha256(result.toString());
    readBuffer.unmap();

    return { computeHash, timingMs };
  }

  getMetadata(): CollectorMetadata {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      description: this.description,
      privacyImplication:
        "WebGPU can reveal detailed hardware specs and performance characteristics of your graphics card.",
      usedBy: ["Research Prototypes", "Next-gen Fingerprinting Labs"],
      stabilityWeight: 1.0,
      estimatedDurationMs: 500,
      requiresInteraction: false,
      browsers: {
        chrome: "113+",
        firefox: "flag",
        safari: "17+",
        edge: "113+",
      },
    };
  }
}

registry.register(new WebGPUCollector(), CollectorPriority.P2_MEDIUM);
