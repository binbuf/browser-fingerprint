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
 * TimezoneCollector — TZ name, UTC offset, Intl behaviors
 */
export class TimezoneCollector implements Collector {
  readonly id = "timezone";
  readonly name = "Timezone & Locale";
  readonly category: CollectorCategory = "locale-environment";
  readonly description = "Probes timezone, offset, and internationalization settings.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const data = {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        offset: new Date().getTimezoneOffset(),
        // Number format variations
        numFormat: (1000000.5).toLocaleString(),
        // Date format variations
        dateFormat: new Intl.DateTimeFormat().format(new Date(2023, 0, 1)),
        // Calendar type
        calendar: new Intl.DateTimeFormat().resolvedOptions().calendar,
        // Numbering system
        numberingSystem: new Intl.DateTimeFormat().resolvedOptions().numberingSystem,
      };

      const signals: SignalEntry[] = [
        {
          key: "timezone.name",
          value: data.timezone || "unknown",
          label: "Timezone Name",
        },
        {
          key: "timezone.offset",
          value: data.offset,
          label: "Timezone Offset",
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
        "Timezone and locale settings reveal your approximate location and language preferences. These settings are highly stable across browsing sessions.",
      usedBy: ["Ad Networks", "Financial Services", "Cloudflare"],
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

registry.register(new TimezoneCollector(), CollectorPriority.P0_INSTANT);
