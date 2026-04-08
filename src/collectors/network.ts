import type {
  Collector,
  CollectorCategory,
  CollectorMetadata,
  CollectorResult,
  SignalEntry,
} from "./types";
import { registry, CollectorPriority } from "./registry";
import { hashData } from "../utils/hash";

interface NetworkInformation {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * NetworkCollector — Connection type, downlink, RTT, data saver
 */
export class NetworkCollector implements Collector {
  readonly id = "network";
  readonly name = "Network Connection";
  readonly category: CollectorCategory = "browser-state";
  readonly description = "Probes network connection properties via navigator.connection.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const nav = window.navigator as Navigator & {
        connection?: NetworkInformation;
        mozConnection?: NetworkInformation;
        webkitConnection?: NetworkInformation;
      };
      const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

      if (!connection) {
        return {
          collectorId: this.id,
          status: "unsupported",
          durationMs: performance.now() - start,
          timestamp: Date.now(),
          reason: "Network Information API is not supported in this browser.",
        };
      }

      const data = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };

      const signals: SignalEntry[] = [
        {
          key: "network.effectiveType",
          value: data.effectiveType || "unknown",
          label: "Network Type",
        },
        {
          key: "network.downlink",
          value: data.downlink || 0,
          label: "Downlink Speed (Mbps)",
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
        "Network connection details reveal your approximate bandwidth and connection type, which can change frequently and are considered low-stability signals.",
      usedBy: ["Video Streaming Services", "Performance Monitoring", "Anti-Fraud Systems"],
      stabilityWeight: 0.3,
      estimatedDurationMs: 5,
      requiresInteraction: false,
      browsers: {
        chrome: true,
        firefox: false,
        safari: false,
        edge: true,
      },
    };
  }
}

registry.register(new NetworkCollector(), CollectorPriority.P0_INSTANT);
