import type { CollectorResult } from "../../collectors/types";
import type { RecognitionResult, UniquenessReport } from "../../engine/types";
import type { SerializedSnapshot } from "../../persistence/types";

/**
 * Top-level reactive state for the Svelte store (src/ui/stores/fingerprint.ts).
 * Drives the entire dashboard UI. Updated progressively as collectors complete.
 *
 * In the Svelte store implementation, these fields are exposed as runes:
 *   - `scanState` ($state) → maps to `status`
 *   - `results` ($state) → Map<string, CollectorResult>
 *   - `completedCount` ($derived) → derived from results.size
 *   - `uniquenessReport` ($state) → maps to `uniqueness`
 *   - `recognitionResult` ($state) → maps to `recognition`
 *   - `compositeHash` ($state) → SHA-256 composite hash
 */
export interface FingerprintState {
  /** Current scan lifecycle phase */
  status: "idle" | "scanning" | "complete";

  /** Real-time scan progress for the ProgressIndicator component */
  progress: ScanProgress;

  /** Collector results accumulated so far, keyed by collector ID */
  results: Map<string, CollectorResult>;

  /** Uniqueness report, null until at least one collector completes scoring */
  uniqueness: UniquenessReport | null;

  /** Cross-session recognition result, null until matching completes */
  recognition: RecognitionResult | null;

  /** SHA-256 composite fingerprint hash, null until all collectors complete */
  compositeHash: string | null;
}

/**
 * Scan progress tracking for the UI progress indicator.
 */
export interface ScanProgress {
  /** Number of collectors that have finished (any terminal status) */
  completedCount: number;

  /** Total number of collectors registered in the scan */
  totalCount: number;

  /** Completion percentage (0-100) */
  percentage: number;

  /** IDs of collectors currently executing in the concurrency pool */
  currentCollectors: string[];

  /** Wall-clock time elapsed since scan started (ms) */
  elapsedMs: number;
}

export interface DetectedCountermeasure {
  /** Technique name, e.g. "Canvas noise injection" */
  technique: string;

  /** Whether this countermeasure was detected as active */
  detected: boolean;

  /** Explanation of what this countermeasure does */
  description: string;

  /** Specific tool or browser feature, e.g. "Brave Shields", "Firefox resistFingerprinting" */
  tool?: string;
}

/**
 * Report on detected anti-fingerprinting countermeasures.
 * Produced by the AntiFingerprint collector.
 */
export interface AntiFingerprintReport {
  /** Whether any countermeasure was detected */
  detected: boolean;

  /** List of individual countermeasure detection results */
  countermeasures: DetectedCountermeasure[];

  /** Overall effectiveness rating of the user's anti-fingerprinting setup */
  overallEffectiveness: "none" | "partial" | "strong";
}

/**
 * Full fingerprint report exported as JSON download.
 */
export interface ExportedReport {
  /** Application version string, e.g. "1.0.0" */
  version: string;

  /** ISO 8601 timestamp when the export was created */
  exportedAt: string;

  /** The fingerprint data (serialized form) */
  fingerprint: SerializedSnapshot;

  /** Uniqueness scoring results */
  uniqueness: UniquenessReport;

  /** Cross-session recognition result, or null if first visit */
  recognition: RecognitionResult | null;

  /** Anti-fingerprinting detection results */
  antiFingerprinting: AntiFingerprintReport;
}
