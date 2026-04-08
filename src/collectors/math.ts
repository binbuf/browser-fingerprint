import type {
  Collector,
  CollectorCategory,
  CollectorMetadata,
  CollectorResult,
  SignalEntry,
} from "./types";
import { registry, CollectorPriority } from "./registry";
import { hashData } from "../utils/hash";

/**
 * MathCollector — Floating-point operation variations
 */
export class MathCollector implements Collector {
  readonly id = "math";
  readonly name = "Math Constants";
  readonly category: CollectorCategory = "engine-internals";
  readonly description = "Probes floating-point operation variations across JS engines.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const data = {
        tan: Math.tan(-1e300),
        atan2: Math.atan2(1, 1),
        log: Math.log(2),
        exp: Math.exp(1),
        pow: Math.pow(Math.PI, -100),
        acos: Math.acos(0.12345678912345678),
        asinh: Math.asinh(1),
        acosh: Math.acosh(1e30),
        atanh: Math.atanh(0.5),
        expm1: Math.expm1(1),
        log1p: Math.log1p(10),
        sinh: Math.sinh(1),
        cosh: Math.cosh(1),
      };

      const signals: SignalEntry[] = [
        {
          key: "math.tan",
          value: String(data.tan),
          label: "Math.tan result",
        },
        {
          key: "math.atan2",
          value: String(data.atan2),
          label: "Math.atan2 result",
        },
      ];

      const hash = await hashData(data);

      return {
        collectorId: this.id,
        status: "completed",
        durationMs: performance.now() - start,
        timestamp: Date.now(),
        data,
        hash,
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

  getMetadata(): CollectorMetadata {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      description: this.description,
      privacyImplication:
        "Subtle variations in floating-point calculations can reveal the underlying JavaScript engine and even the processor architecture. These values are extremely stable.",
      usedBy: ["Fingerprint.com", "Browser-leaks.com", "Privacy researchers"],
      stabilityWeight: 1.0,
      estimatedDurationMs: 5,
      requiresInteraction: false,
      browsers: {
        chrome: true,
        firefox: true,
        safari: true,
        edge: true,
      },
    };
  }
}

registry.register(new MathCollector(), CollectorPriority.P0_INSTANT);
