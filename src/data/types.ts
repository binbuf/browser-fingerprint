/**
 * Frequency distribution for a single fingerprinting signal.
 * Sourced from published research (EFF Cover Your Tracks, AmIUnique).
 * Bundled at build time in src/data/reference-dataset.ts.
 * See ADR-006.
 */
export interface ReferenceDataEntry {
  /** Signal key matching SignalEntry.key, e.g. "screen.resolution" */
  signalKey: string;

  /** Known value-frequency pairs for this signal */
  values: ReferenceValueFrequency[];

  /** Total number of browsers sampled for this signal */
  totalSamples: number;

  /** Attribution, e.g. "EFF Cover Your Tracks 2025" */
  source: string;

  /** ISO 8601 date when this data was last refreshed */
  lastUpdated: string;
}

/**
 * A single value and its observed frequency in the reference population.
 */
export interface ReferenceValueFrequency {
  /** The signal value as a string (numeric values are stringified) */
  value: string;

  /** Fraction of browsers with this value (0-1) */
  frequency: number;

  /** Absolute count of browsers with this value in the sample */
  count: number;
}

export type ExtensionCategory =
  | "ad-blocker"
  | "password-manager"
  | "dev-tools"
  | "privacy"
  | "productivity"
  | "social"
  | "shopping"
  | "vpn"
  | "accessibility"
  | "other";

/**
 * Metadata for stealthy extension detection without console noise.
 */
export interface SilentProbe {
  /**
   * 'window': Check for a global object, e.g. window.ethereum (MetaMask)
   * 'dom': Check for a specific element ID or class injected by the extension
   * 'css': Check for a specific CSS property on a dummy element (e.g. ad-blocker hiding it)
   */
  type: "window" | "dom" | "css";
  target: string;
}

/**
 * Chrome extension metadata for WAR (Web Accessible Resource) probing.
 * See ADR-009 for the batched fetch strategy.
 * Bundled at build time in src/data/extension-ids.ts (~1000 entries).
 */
export interface ExtensionEntry {
  /** Chrome Web Store extension ID (32-char alphanumeric) */
  id: string;

  /** Extension display name */
  name: string;

  /** Extension category for UI grouping */
  category: ExtensionCategory;

  /** Relative path to a known Web Accessible Resource, e.g. "icon128.png" */
  warPath: string;

  /** Approximate install count from the Chrome Web Store (optional) */
  installCount?: number;

  /** Optional silent probe for non-noisy detection */
  silentProbe?: SilentProbe;
}

export type FontCategory =
  | "os-default" // Ships with the operating system
  | "adobe" // Installed by Adobe Creative Suite / Creative Cloud
  | "ms-office" // Installed by Microsoft Office
  | "google" // Google Fonts commonly bundled with Chrome OS or Android
  | "developer" // Installed by development tools (JetBrains, VS Code, etc.)
  | "design" // Design tools (Sketch, Figma local fonts, etc.)
  | "other";

/**
 * Font metadata for CSS measurement-based detection.
 * See ADR-011 for the progressive scanning strategy.
 * Bundled at build time in src/data/font-list.ts (~500 entries).
 */
export interface FontEntry {
  /** Font family name as used in CSS font-family, e.g. "Fira Code" */
  name: string;

  /** Source category for UI grouping and software inference */
  category: FontCategory;

  /** Platforms where this font is typically present */
  platforms: ("windows" | "macos" | "linux")[];

  /** Software whose installation is inferred by this font's presence, e.g. "Adobe Creative Suite" */
  infersSoftware?: string;
}

/**
 * Protocol handler metadata for installed software detection.
 * Bundled at build time in src/data/protocol-handlers.ts (~30 entries).
 */
export interface ProtocolHandlerEntry {
  /** URI scheme to probe, e.g. "zoommtg" (without "://") */
  scheme: string;

  /** Application name inferred from this scheme, e.g. "Zoom" */
  applicationName: string;

  /** Platforms where this handler is commonly registered */
  platforms: ("windows" | "macos" | "linux")[];

  /** Application category for UI grouping */
  category:
    | "communication"
    | "development"
    | "gaming"
    | "media"
    | "productivity"
    | "other";
}
