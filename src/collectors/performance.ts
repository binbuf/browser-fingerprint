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
 * PerformanceCollector — Timer resolution and origin.
 * Browsers intentionally reduce timer precision to prevent side-channel attacks,
 * but the exact resolution and origin can still be identifying.
 */
export class PerformanceCollector implements Collector {
  readonly id = "performance";
  readonly name = "Performance and Timing";
  readonly category: CollectorCategory = "browser-state";
  readonly description = "Measures timer resolution and performance timing characteristics.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const timerResolution = this.measureTimerResolution();
      const timeOrigin = performance.timeOrigin;

      const data = {
        timerResolution,
        timeOrigin,
      };

      const signals: SignalEntry[] = [
        {
          key: "performance.timerResolution",
          value: timerResolution,
          label: "Timer Resolution (ms)",
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

  /**
   * Measures the smallest non-zero increment of performance.now().
   */
  private measureTimerResolution(): number {
    const samples: number[] = [];
    let prev = performance.now();
    
    // Collect 100 samples of non-zero deltas
    for (let i = 0; i < 100; i++) {
      let now = performance.now();
      while (now === prev) {
        now = performance.now();
      }
      samples.push(now - prev);
      prev = now;
    }

    // Return the minimum observed resolution
    return Math.min(...samples);
  }

  getMetadata(): CollectorMetadata {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      description: this.description,
      privacyImplication:
        "The precision of browser timers can reveal security settings (e.g., cross-origin isolation) and specific hardware clock characteristics.",
      usedBy: ["Side-channel attacks research", "Fingerprint.com"],
      stabilityWeight: 0.3,
      estimatedDurationMs: 50,
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

registry.register(new PerformanceCollector(), CollectorPriority.P1_FAST);
