import type { CollectorResult } from "../../collectors/types";
import type { FingerprintSnapshot, RecognitionResult, UniquenessReport } from "../../engine/types";

// Module-level state using Svelte 5 runes
let scanStateValue = $state<"idle" | "scanning" | "complete">("idle");
let resultsValue = $state<Map<string, CollectorResult>>(new Map());
let uniquenessReportValue = $state<UniquenessReport | null>(null);
let recognitionResultValue = $state<RecognitionResult | null>(null);
let compositeHashValue = $state<string | null>(null);
let snapshotValue = $state<FingerprintSnapshot | null>(null);
let totalCountValue = $state(24);

// Derived state
let completedCountValue = $derived(resultsValue.size);
let percentageValue = $derived(
  totalCountValue > 0 ? Math.round((completedCountValue / totalCountValue) * 100) : 0
);

/**
 * Fingerprint store providing reactive state for the scanning process.
 * Uses Svelte 5 runes for fine-grained reactivity.
 */
export const fingerprint = {
  // Getters for reactive state
  get scanState() { return scanStateValue; },
  get results() { return resultsValue; },
  get uniquenessReport() { return uniquenessReportValue; },
  get recognitionResult() { return recognitionResultValue; },
  get compositeHash() { return compositeHashValue; },
  get snapshot() { return snapshotValue; },
  get totalCount() { return totalCountValue; },
  get completedCount() { return completedCountValue; },
  get percentage() { return percentageValue; },

  // Actions
  addResult(collectorId: string, result: CollectorResult): void {
    const next = new Map(resultsValue);
    next.set(collectorId, result);
    resultsValue = next;
  },

  updateUniqueness(report: UniquenessReport): void {
    uniquenessReportValue = report;
  },

  setRecognition(result: RecognitionResult): void {
    recognitionResultValue = result;
  },

  setCompositeHash(hash: string): void {
    compositeHashValue = hash;
  },

  setSnapshot(snapshot: FingerprintSnapshot): void {
    snapshotValue = snapshot;
  },

  setTotalCount(count: number): void {
    totalCountValue = count;
  },

  startScan(): void {
    this.reset();
    scanStateValue = "scanning";
  },

  completeScan(): void {
    scanStateValue = "complete";
  },

  reset(): void {
    scanStateValue = "idle";
    resultsValue = new Map();
    uniquenessReportValue = null;
    recognitionResultValue = null;
    compositeHashValue = null;
    snapshotValue = null;
  }
};
