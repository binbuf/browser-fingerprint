import type {
  Collector,
  CollectorCategory,
  CollectorMetadata,
  CollectorResult,
  SignalEntry,
} from "./types";
import { registry, CollectorPriority } from "./registry";
import { hashData } from "../utils/hash";
import { createPersistenceStore } from "../persistence/store";

/**
 * RecognitionCollector — Coordinates with the persistence layer to identify returning visitors.
 * This collector probes for prior fingerprint data to enable cross-session recognition.
 */
export class RecognitionCollector implements Collector {
  readonly id = "recognition";
  readonly name = "Cross-Session Recognition";
  readonly category: CollectorCategory = "cross-session";
  readonly description = "Identifies returning visitors by matching the current fingerprint against prior visits.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const store = createPersistenceStore();
      const prior = await store.load();

      // We report the persistence state. The actual similarity matching
      // happens at the engine/matcher level after all collectors complete.
      const data = {
        isFirstVisit: !prior,
        priorVisitCount: prior?.visitCount || 0,
        lastSeenTimestamp: prior?.lastSeenTimestamp || null,
        firstSeenTimestamp: prior?.firstSeenTimestamp || null,
        // These fields are placeholders to be populated or analyzed by the Matcher
        recognized: false,
        similarity: 0,
      };

      const signals: SignalEntry[] = [
        {
          key: "recognition.isFirstVisit",
          value: !prior,
          label: "First Visit",
        },
        {
          key: "recognition.visitCount",
          value: prior?.visitCount || 0,
          label: "Prior Visit Count",
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

  getMetadata(): CollectorMetadata {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      description: this.description,
      privacyImplication:
        "Recognition identifies you across sessions even without cookies, using your unique browser characteristics.",
      usedBy: ["Fingerprint.com", "E-commerce Fraud Detection", "Paywall Enforcement"],
      stabilityWeight: 0.0, // Recognition result itself is not a matching attribute
      estimatedDurationMs: 100,
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

registry.register(new RecognitionCollector(), CollectorPriority.P2_MEDIUM);
