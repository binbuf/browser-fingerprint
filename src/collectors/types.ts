/**
 * Collector categories matching the collector module map defined in the
 * architecture document (section 5.2). Each category groups related
 * fingerprinting techniques.
 */
export type CollectorCategory =
  | "gpu-rendering"
  | "audio"
  | "system-hardware"
  | "locale-environment"
  | "installed-software"
  | "browser-state"
  | "engine-internals"
  | "privacy-detection"
  | "cross-session";

/**
 * Lifecycle status of a collector execution. Transitions:
 *   pending -> running -> completed | unsupported | error | timeout
 */
export type CollectorStatus =
  | "pending"
  | "running"
  | "completed"
  | "unsupported"
  | "error"
  | "timeout";

/**
 * The contract that all 24 fingerprinting modules implement.
 * Each collector is a self-contained module that probes specific browser
 * APIs, handles its own errors, and returns a typed result.
 *
 * Defined in: src/collectors/types.ts
 */
export interface Collector {
  /** Unique identifier matching the module filename, e.g. "canvas", "webgl" */
  readonly id: string;

  /** Human-readable display name, e.g. "Canvas Fingerprinting" */
  readonly name: string;

  /** Category grouping for the dashboard UI */
  readonly category: CollectorCategory;

  /** One-line description of what this collector measures */
  readonly description: string;

  /**
   * Execute the fingerprinting collection. Returns a typed result.
   * Accepts an optional AbortSignal for timeout cancellation by the
   * orchestrator (see ADR-004).
   */
  collect(signal?: AbortSignal): Promise<CollectorResult>;

  /** Return static metadata about this collector (for UI info cards) */
  getMetadata(): CollectorMetadata;
}

/**
 * Base fields shared by all result variants.
 */
export interface CollectorResultBase {
  /** ID of the collector that produced this result */
  collectorId: string;

  /** Terminal status of this result */
  status: CollectorStatus;

  /** Wall-clock execution time in milliseconds */
  durationMs: number;

  /** Unix epoch timestamp (ms) when collection completed */
  timestamp: number;
}

/**
 * Successful collection — contains the fingerprint data, its hash,
 * and the individual signals extracted for entropy scoring.
 */
export interface CollectorResultSuccess extends CollectorResultBase {
  status: "completed";

  /**
   * Collector-specific data payload. Each collector defines its own shape.
   * Examples:
   *   Canvas: { hash: string, dataUrl: string }
   *   WebGL: { vendor: string, renderer: string, extensions: string[], ... }
   *   Navigator: { userAgent: string, cores: number, memory: number, ... }
   */
  data: Record<string, unknown>;

  /** SHA-256 hash of the serialized data payload (via Web Crypto API) */
  hash: string;

  /** Individual signals extracted for per-attribute entropy scoring */
  signals: SignalEntry[];
}

/**
 * The browser does not support the required API.
 */
export interface CollectorResultUnsupported extends CollectorResultBase {
  status: "unsupported";

  /** Human-readable reason, e.g. "WebGPU is not available in this browser" */
  reason: string;
}

/**
 * The collector threw an exception during execution.
 */
export interface CollectorResultError extends CollectorResultBase {
  status: "error";

  /** Serialized error message */
  error: string;
}

/**
 * The collector exceeded the orchestrator's per-collector timeout.
 */
export interface CollectorResultTimeout extends CollectorResultBase {
  status: "timeout";
}

/**
 * Discriminated union of all possible collector outcomes.
 * Consumers should switch on the `status` field.
 */
export type CollectorResult =
  | CollectorResultSuccess
  | CollectorResultUnsupported
  | CollectorResultError
  | CollectorResultTimeout;

/**
 * A single fingerprinting signal extracted from a collector's data.
 * Signals are the atomic unit of entropy scoring — each one maps to
 * a row in the reference dataset.
 *
 * Example: The WebGL collector might emit signals like:
 *   { key: "webgl.renderer", value: "ANGLE (NVIDIA GeForce RTX 4090)", label: "GPU Renderer" }
 *   { key: "webgl.vendor", value: "Google Inc. (NVIDIA)", label: "GPU Vendor" }
 */
export interface SignalEntry {
  /** Dot-notation key matching the reference dataset, e.g. "canvas.hash" */
  key: string;

  /** The collected value (string, number, or boolean) */
  value: string | number | boolean;

  /** Human-readable label for the UI, e.g. "Canvas Hash" */
  label: string;

  /** Bits of identifying information, computed from the reference dataset.
   *  Populated by the score engine after collection. */
  entropyBits?: number;

  /** Fraction of browsers sharing this exact value (0-1).
   *  Populated by the score engine after collection. */
  commonality?: number;
}

/**
 * Static metadata describing a collector's characteristics, used by
 * the UI for info cards and by the matcher for cross-session weighting.
 */
export interface CollectorMetadata {
  /** Collector ID */
  id: string;

  /** Display name */
  name: string;

  /** Category grouping */
  category: CollectorCategory;

  /** Technique description for the educational info card */
  description: string;

  /** Explanation of privacy implications for the info card */
  privacyImplication: string;

  /** Real-world actors that use this technique, e.g. ["LinkedIn", "Fingerprint.com"] */
  usedBy: string[];

  /**
   * Stability weight for cross-session matching (0-1).
   * See ADR-005 for weight tiers:
   *   1.0 = high stability (canvas, webgl, audio, math, core fonts)
   *   0.6 = medium stability (screen, timezone, language, speech, permissions)
   *   0.3 = low stability (extensions, network, gamepad, performance)
   *   0.0 = ignored for matching (client hints version numbers)
   */
  stabilityWeight: number;

  /** Expected execution time in ms (used for progress estimation) */
  estimatedDurationMs: number;

  /** Whether the collector requires user interaction, e.g. keyboard collector needs typing */
  requiresInteraction: boolean;

  /** Whether the collector produces console noise (e.g. extension fetch errors) */
  isNoisy?: boolean;

  /** Whether the collector is invasive (e.g. triggers protocol popups or slow UI) */
  isInvasive?: boolean;

  /** Browser support matrix */
  browsers: BrowserSupport;
}

export interface BrowserSupport {
  chrome: boolean | string; // true = supported, string = minimum version e.g. "113+"
  firefox: boolean | string;
  safari: boolean | string;
  edge: boolean | string;
}
