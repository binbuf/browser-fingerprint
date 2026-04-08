import type {
  Collector,
  CollectorCategory,
  CollectorMetadata,
  CollectorResult,
  SignalEntry,
} from "./types";
import { registry, CollectorPriority } from "./registry";
import { hashData } from "../utils/hash";

interface NavigatorUAData {
  brands: { brand: string; version: string }[];
  mobile: boolean;
  platform: string;
  getHighEntropyValues(hints: string[]): Promise<Record<string, unknown>>;
}

/**
 * ClientHintsCollector — High-entropy User Agent Client Hints.
 * Chromium-only API that provides structured version and hardware info.
 */
export class ClientHintsCollector implements Collector {
  readonly id = "client-hints";
  readonly name = "User Agent Client Hints";
  readonly category: CollectorCategory = "browser-state";
  readonly description = "Probes high-entropy browser and system version information.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const nav = window.navigator as unknown as Navigator & {
        userAgentData?: NavigatorUAData;
      };
      if (!nav.userAgentData) {
        return {
          collectorId: this.id,
          status: "unsupported",
          durationMs: performance.now() - start,
          timestamp: Date.now(),
          reason: "User Agent Client Hints API is not supported in this browser.",
        };
      }

      const uad = nav.userAgentData;

      // Basic low-entropy hints (available synchronously)
      const basicData = {
        brands: uad.brands,
        mobile: uad.mobile,
        platform: uad.platform,
      };

      // High-entropy hints (async)
      let highEntropyData: Record<string, unknown> = {};
      try {
        highEntropyData = await uad.getHighEntropyValues([
          "architecture",
          "bitness",
          "formFactor",
          "fullVersionList",
          "model",
          "platformVersion",
          "wow64",
        ]);
      } catch (_e) {
        // Fall back to basic data if high-entropy fails
      }

      const data = {
        ...basicData,
        ...highEntropyData,
      };

      const d = data as Record<string, unknown>;
      const signals: SignalEntry[] = [
        {
          key: "clientHints.platform",
          value: (d.platform as string | undefined) ?? "unknown",
          label: "UA Platform",
        },
        {
          key: "clientHints.architecture",
          value: (d.architecture as string | undefined) ?? "unknown",
          label: "Architecture",
        },
        {
          key: "clientHints.bitness",
          value: (d.bitness as string | undefined) ?? "unknown",
          label: "Bitness",
        },
        {
          key: "clientHints.model",
          value: (d.model as string | undefined) ?? "unknown",
          label: "Model",
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
        "High-entropy client hints reveal specific details about your hardware architecture, device model, and exact software versions.",
      usedBy: ["Google", "Cloudflare", "Modern Web Platforms"],
      stabilityWeight: 0.0, // Per ADR-005, version numbers change frequently
      estimatedDurationMs: 50,
      requiresInteraction: false,
      browsers: {
        chrome: "89+",
        firefox: false,
        safari: false,
        edge: "89+",
      },
    };
  }
}

registry.register(new ClientHintsCollector(), CollectorPriority.P1_FAST);
