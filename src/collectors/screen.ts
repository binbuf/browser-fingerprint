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
 * ScreenCollector — Resolution, available size, color depth, DPR, orientation
 */
export class ScreenCollector implements Collector {
  readonly id = "screen";
  readonly name = "Screen Resolution";
  readonly category: CollectorCategory = "system-hardware";
  readonly description = "Probes physical screen resolution and display properties.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const data = {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
        colorDepth: window.screen.colorDepth,
        pixelDepth: window.screen.pixelDepth,
        devicePixelRatio: window.devicePixelRatio,
        orientation: window.screen.orientation?.type || "unknown",
      };

      const signals: SignalEntry[] = [
        {
          key: "screen.resolution",
          value: `${data.width}x${data.height}`,
          label: "Screen Resolution",
        },
        {
          key: "screen.colorDepth",
          value: data.colorDepth,
          label: "Color Depth",
        },
        {
          key: "screen.pixelRatio",
          value: data.devicePixelRatio,
          label: "Device Pixel Ratio",
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
        "Screen dimensions can help identify your device type and monitor setup. When combined with other hardware signals, it contributes to a unique hardware profile.",
      usedBy: ["Fingerprint.com", "Google", "Akamai"],
      stabilityWeight: 0.6,
      estimatedDurationMs: 10,
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

registry.register(new ScreenCollector(), CollectorPriority.P0_INSTANT);
