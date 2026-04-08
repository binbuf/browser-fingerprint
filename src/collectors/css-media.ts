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
 * CSSMediaCollector — prefers-color-scheme, reduced-motion, pointer type, etc.
 */
export class CSSMediaCollector implements Collector {
  readonly id = "css-media";
  readonly name = "CSS Media Queries";
  readonly category: CollectorCategory = "browser-state";
  readonly description = "Probes system preferences via CSS media queries.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const match = (query: string) => window.matchMedia(query).matches;

      const data = {
        prefersColorScheme: match("(prefers-color-scheme: dark)")
          ? "dark"
          : match("(prefers-color-scheme: light)")
            ? "light"
            : "no-preference",
        reducedMotion: match("(prefers-reduced-motion: reduce)") ? "reduce" : "no-preference",
        prefersContrast: match("(prefers-contrast: more)")
          ? "more"
          : match("(prefers-contrast: less)")
            ? "less"
            : "no-preference",
        pointer: match("(pointer: fine)") ? "fine" : match("(pointer: coarse)") ? "coarse" : "none",
        hover: match("(hover: hover)") ? "hover" : "none",
        colorGamut: match("(color-gamut: p3)")
          ? "p3"
          : match("(color-gamut: rec2020)")
            ? "rec2020"
            : "srgb",
        dynamicRange: match("(dynamic-range: high)") ? "high" : "standard",
        forcedColors: match("(forced-colors: active)") ? "active" : "none",
        invertedColors: match("(inverted-colors: inverted)") ? "inverted" : "none",
      };

      const signals: SignalEntry[] = [
        {
          key: "css.prefersColorScheme",
          value: data.prefersColorScheme,
          label: "Color Scheme Preference",
        },
        {
          key: "css.reducedMotion",
          value: data.reducedMotion,
          label: "Reduced Motion Preference",
        },
        {
          key: "css.pointerType",
          value: data.pointer,
          label: "Primary Pointer Type",
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
        "Media queries reveal your OS-level preferences, such as Dark Mode and Reduced Motion, as well as your hardware's input capabilities (touch vs. mouse).",
      usedBy: ["Modern Web Apps", "Analytics", "Privacy researchers"],
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

registry.register(new CSSMediaCollector(), CollectorPriority.P0_INSTANT);
