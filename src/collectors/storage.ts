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
 * StorageCollector — Storage quota, availability, and persistence info.
 */
export class StorageCollector implements Collector {
  readonly id = "storage";
  readonly name = "Storage and Persistence";
  readonly category: CollectorCategory = "browser-state";
  readonly description = "Probes available storage, quota, and client-side storage support.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const data: Record<string, unknown> = {
        cookieEnabled: navigator.cookieEnabled,
        localStorageAvailable: false,
        indexedDBAvailable: false,
        storageQuota: 0,
        storageUsage: 0,
      };

      // Test localStorage
      try {
        localStorage.setItem("test", "test");
        localStorage.removeItem("test");
        data.localStorageAvailable = true;
      } catch (_e) {}

      // Test indexedDB
      try {
        if (window.indexedDB) {
          data.indexedDBAvailable = true;
        }
      } catch (_e) {}

      // Get storage estimate (Chromium and Firefox)
      if (navigator.storage && navigator.storage.estimate) {
        try {
          const estimate = await navigator.storage.estimate();
          data.storageQuota = estimate.quota || 0;
          data.storageUsage = estimate.usage || 0;
        } catch (_e) {}
      }

      // Bucket quota to nearest GB to avoid noise
      const quotaGB = Math.round((data.storageQuota as number) / (1024 * 1024 * 1024));

      const signals: SignalEntry[] = [
        {
          key: "storage.quota",
          value: quotaGB,
          label: "Storage Quota (GB)",
        },
        {
          key: "storage.cookies",
          value: data.cookieEnabled as boolean,
          label: "Cookies Enabled",
        },
        {
          key: "storage.localStorage",
          value: data.localStorageAvailable as boolean,
          label: "LocalStorage Available",
        },
        {
          key: "storage.indexedDB",
          value: data.indexedDBAvailable as boolean,
          label: "IndexedDB Available",
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
        "Information about your storage capacity and used space can reveal details about your hardware and how long you have been using the browser.",
      usedBy: ["Cloudflare", "Modern Web Platforms", "Anti-Fraud Systems"],
      stabilityWeight: 0.3,
      estimatedDurationMs: 50,
      requiresInteraction: false,
      browsers: {
        chrome: true,
        firefox: true,
        safari: "11.1+",
        edge: true,
      },
    };
  }
}

registry.register(new StorageCollector(), CollectorPriority.P1_FAST);
