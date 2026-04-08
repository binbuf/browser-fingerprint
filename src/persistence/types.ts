import type { CollectorResult, SignalEntry } from "../collectors/types";

/**
 * JSON-serializable version of FingerprintSnapshot.
 * The only difference is that `results` is a Record instead of a Map,
 * since Map is not directly JSON-serializable.
 */
export interface SerializedSnapshot {
  id: string;
  timestamp: number;
  userAgent: string;

  /** Collector results keyed by collector ID (Map serialized to Record) */
  results: Record<string, CollectorResult>;

  compositeHash: string;
  signals: SignalEntry[];
}

/**
 * The top-level structure stored in localStorage/IndexedDB.
 * Wraps a serialized snapshot with visit tracking metadata.
 *
 * Stored at key: "bf_fingerprint" (localStorage)
 * Stored in object store: "fingerprints" (IndexedDB, database: "bf_db")
 *
 * See ADR-007 for the layered persistence strategy.
 */
export interface PersistedFingerprint {
  /** Schema version number for forward-compatible migrations */
  version: number;

  /** JSON-serializable snapshot (Map converted to Record) */
  snapshot: SerializedSnapshot;

  /** Unix epoch (ms) of the user's first recorded visit */
  firstSeenTimestamp: number;

  /** Unix epoch (ms) of the most recent visit */
  lastSeenTimestamp: number;

  /** Total number of visits where a fingerprint was captured */
  visitCount: number;
}
