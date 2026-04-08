import type {
  CollectorCategory,
  CollectorResult,
  CollectorStatus,
  SignalEntry,
} from "../collectors/types";

/**
 * A complete fingerprint captured at a single point in time.
 * Aggregates results from all collectors that ran during a scan.
 * Immutable once created.
 *
 * Note: Uses Map<string, CollectorResult> at runtime for O(1) lookup.
 * Must be converted to SerializedSnapshot (Record-based) for persistence.
 */
export interface FingerprintSnapshot {
  /** UUID v4 identifying this snapshot */
  id: string;

  /** Unix epoch (ms) when the scan completed */
  timestamp: number;

  /** navigator.userAgent at the time of capture */
  userAgent: string;

  /** Results keyed by collector ID. Map provides O(1) lookup and iteration order. */
  results: Map<string, CollectorResult>;

  /**
   * SHA-256 hash of all successful collector hashes concatenated in
   * alphabetical order by collector ID. This is the composite fingerprint.
   */
  compositeHash: string;

  /** Flattened array of all signals from successful collector results */
  signals: SignalEntry[];
}

/**
 * Entropy score for a single signal. Computed by the score engine
 * using the reference dataset.
 *
 * Formula: entropyBits = -log2(frequency)
 * See ADR-006 for the scoring methodology.
 */
export interface EntropyScore {
  /** Signal key matching SignalEntry.key and ReferenceDataEntry.signalKey */
  signalKey: string;

  /** The observed value for this signal */
  value: string | number | boolean;

  /** Bits of identifying information: -log2(frequency) */
  entropyBits: number;

  /** How common this value is in the reference population (0-1) */
  frequency: number;

  /** frequency * 100, convenience field for the UI */
  commonalityPercent: number;

  /** Entropy tier for UI color-coding (thresholds: low < 3 bits, medium 3-6 bits, high >= 6 bits).
   *  Aligned with EntropyBar component colors: green (low), yellow (medium), red (high). */
  category: "low" | "medium" | "high";

  /** true when frequency came from actual reference data; false when using the default fallback */
  hasReferenceData: boolean;
}

/**
 * Combined uniqueness report aggregating all signal entropy scores.
 * Supports incremental computation: isPartial=true while collectors
 * are still running, updating as each collector completes (see ADR-012).
 */
export interface UniquenessReport {
  /** Sum of all signal entropy bits */
  totalEntropyBits: number;

  /**
   * Estimated uniqueness: 2^totalEntropyBits (1 in N browsers).
   * Example: 18 bits = 1 in 262,144
   */
  estimatedUniqueness: number;

  /** Human-readable label, e.g. "1 in 286,000" */
  uniquenessLabel: string;

  /** Entropy breakdown grouped by collector module */
  perModule: ModuleEntropyBreakdown[];

  /** Entropy score for every individual signal */
  perSignal: EntropyScore[];

  /** Number of collectors that have finished */
  completedModules: number;

  /** Total number of collectors in the scan */
  totalModules: number;

  /** true while collectors are still running; false when scan is complete */
  isPartial: boolean;
}

/**
 * Entropy contribution of a single collector module.
 */
export interface ModuleEntropyBreakdown {
  collectorId: string;
  collectorName: string;
  category: CollectorCategory;

  /** Sum of entropy bits across all signals from this module */
  entropyBits: number;

  /** Number of signals emitted by this module */
  signalCount: number;

  /** Terminal status of this collector */
  status: CollectorStatus;
}

/**
 * Result of comparing the current fingerprint against a previously
 * persisted fingerprint. Produced by the matcher (src/engine/matcher.ts).
 * See ADR-005 for the weighted similarity algorithm.
 */
export interface RecognitionResult {
  /** Whether the user was recognized (similarity >= threshold, default 0.75) */
  recognized: boolean;

  /** true if no prior fingerprint exists in local storage */
  isFirstVisit: boolean;

  /** Weighted similarity score between 0 and 1 */
  similarity: number;

  /** Calendar days between the previous and current visit */
  daysSinceLastVisit: number;

  /** Attributes whose values matched the previous fingerprint */
  matchedAttributes: AttributeComparison[];

  /** Attributes whose values changed since the previous fingerprint */
  changedAttributes: AttributeComparison[];

  /** Count of stable (matched) attributes */
  stableAttributeCount: number;

  /** Total number of attributes compared */
  totalAttributeCount: number;

  /** Composite hash of the previous fingerprint, or null if first visit */
  previousHash: string | null;

  /** Composite hash of the current fingerprint */
  currentHash: string;
}

/**
 * Comparison of a single attribute between two fingerprint snapshots.
 */
export interface AttributeComparison {
  /** Signal key, e.g. "canvas.hash" */
  key: string;

  /** Human-readable label, e.g. "Canvas Hash" */
  label: string;

  /** Value from the previous fingerprint (serialized to string) */
  previousValue: string;

  /** Value from the current fingerprint (serialized to string) */
  currentValue: string;

  /** Stability weight from CollectorMetadata (0-1) */
  stabilityWeight: number;

  /** Whether previousValue === currentValue */
  matched: boolean;
}

/**
 * Configuration for the orchestrator's parallel execution engine.
 * See ADR-004 (concurrency pool) and ADR-012 (performance budget).
 */
export interface OrchestratorConfig {
  /** Maximum number of collectors running concurrently. Default: 6 */
  concurrencyLimit: number;

  /** Per-collector timeout in ms. Default: 10000 (10 seconds) */
  collectorTimeoutMs: number;

  /**
   * Collector IDs in execution priority order. Fast collectors first
   * (screen, navigator, timezone, math) so the UI populates immediately.
   * Slow collectors last (extensions, fonts, webgpu).
   */
  priorityOrder: string[];

  /** Whether to exclude noisy collectors (e.g. extension fetch errors). Default: true */
  excludeNoisy?: boolean;

  /** Whether to exclude invasive collectors (e.g. protocol popups). Default: true */
  excludeInvasive?: boolean;
}
