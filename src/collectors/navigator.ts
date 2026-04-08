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
 * NavigatorCollector — UA, platform, language, cores, memory, touch points, etc.
 */
export class NavigatorCollector implements Collector {
  readonly id = "navigator";
  readonly name = "Navigator Properties";
  readonly category: CollectorCategory = "system-hardware";
  readonly description = "Probes browser and system properties from the navigator object.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const nav = window.navigator as Navigator & {
        deviceMemory?: number;
        pdfViewerEnabled?: boolean;
        doNotTrack?: string | null;
        msDoNotTrack?: string | null;
      };
      const data = {
        userAgent: nav.userAgent,
        platform: nav.platform,
        language: nav.language,
        languages: nav.languages,
        hardwareConcurrency: nav.hardwareConcurrency,
        deviceMemory: nav.deviceMemory,
        maxTouchPoints: nav.maxTouchPoints,
        cookieEnabled: nav.cookieEnabled,
        doNotTrack: nav.doNotTrack || (nav as unknown as { msDoNotTrack?: string }).msDoNotTrack,
        pdfViewerEnabled: nav.pdfViewerEnabled,
        vendor: nav.vendor,
        webdriver: nav.webdriver,
      };

      const signals: SignalEntry[] = [
        {
          key: "navigator.platform",
          value: data.platform || "unknown",
          label: "OS Platform",
        },
        {
          key: "navigator.language",
          value: data.language || "unknown",
          label: "Primary Language",
        },
        {
          key: "navigator.hardwareConcurrency",
          value: data.hardwareConcurrency || 0,
          label: "CPU Cores",
        },
        {
          key: "navigator.deviceMemory",
          value: data.deviceMemory || 0,
          label: "Device Memory (GB)",
        },
        {
          key: "navigator.maxTouchPoints",
          value: data.maxTouchPoints || 0,
          label: "Max Touch Points",
        },
        {
          key: "navigator.vendor",
          value: data.vendor || "",
          label: "Browser Vendor",
        },
        {
          key: "navigator.webdriver",
          value: data.webdriver ?? false,
          label: "WebDriver (Automated)",
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
        "The navigator object contains detailed information about your software and hardware environment, which can be used to distinguish your device from others.",
      usedBy: ["Almost all fingerprinting libraries", "Google Search", "Anti-Fraud Systems"],
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

registry.register(new NavigatorCollector(), CollectorPriority.P0_INSTANT);
