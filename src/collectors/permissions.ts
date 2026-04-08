import type {
  Collector,
  CollectorCategory,
  CollectorMetadata,
  CollectorResult,
  SignalEntry,
} from "./types";
import { registry, CollectorPriority } from "./registry";
import { hashData } from "../utils/hash";

const PERMISSION_NAMES = [
  "camera",
  "microphone",
  "notifications",
  "geolocation",
  "persistent-storage",
  "accelerometer",
  "gyroscope",
  "magnetometer",
  "midi",
] as const;

/**
 * PermissionsCollector — Query state of various browser permissions.
 * Different browsers/privacy extensions may reveal different sets of permission states.
 */
export class PermissionsCollector implements Collector {
  readonly id = "permissions";
  readonly name = "Browser Permissions";
  readonly category: CollectorCategory = "browser-state";
  readonly description = "Queries the state of various browser permissions.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const nav = window.navigator;
      if (!nav.permissions || !nav.permissions.query) {
        return {
          collectorId: this.id,
          status: "unsupported",
          durationMs: performance.now() - start,
          timestamp: Date.now(),
          reason: "Permissions API is not supported in this browser.",
        };
      }

      const data: Record<string, string> = {};
      const signals: SignalEntry[] = [];

      await Promise.all(
        PERMISSION_NAMES.map(async (name) => {
          try {
            // @ts-expect-error - Some browsers might not support all permission names
            const status = await nav.permissions.query({ name });
            data[name] = status.state;
            signals.push({
              key: `permissions.${name}`,
              value: status.state,
              label: `${name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ")} Permission`,
            });
          } catch (_e) {
            // Permission name might not be supported by this browser
            data[name] = "unsupported";
          }
        })
      );

      const hash = await hashData(data);

      return {
        collectorId: this.id,
        status: "completed",
        durationMs: performance.now() - start,
        timestamp: Date.now(),
        data,
        hash,
        signals: signals.sort((a, b) => a.key.localeCompare(b.key)),
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
        "The state of various permissions (granted, denied, or prompt) can help identify browsers with specific hardware configurations or user preferences.",
      usedBy: ["Fingerprint.com", "Bot detection systems"],
      stabilityWeight: 0.6,
      estimatedDurationMs: 100,
      requiresInteraction: false,
      browsers: {
        chrome: true,
        firefox: true,
        safari: "16+",
        edge: true,
      },
    };
  }
}

registry.register(new PermissionsCollector(), CollectorPriority.P1_FAST);
