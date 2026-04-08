import type {
  Collector,
  CollectorCategory,
  CollectorMetadata,
  CollectorResult,
  SignalEntry,
} from "./types";
import { registry, CollectorPriority } from "./registry";
import { hashData } from "../utils/hash";

interface KeyboardLayoutMap {
  get(key: string): string;
  forEach(callback: (value: string, key: string) => void): void;
}

interface NavigatorWithKeyboard extends Navigator {
  keyboard?: {
    getLayoutMap(): Promise<KeyboardLayoutMap>;
  };
}

/**
 * KeyboardCollector — Probes keyboard layout via the Keyboard API.
 * This is primarily supported in Chromium-based browsers.
 */
export class KeyboardCollector implements Collector {
  readonly id = "keyboard";
  readonly name = "Keyboard Layout";
  readonly category: CollectorCategory = "browser-state";
  readonly description = "Probes the physical keyboard layout and configuration.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const nav = window.navigator as NavigatorWithKeyboard;
      const data: {
        apiAvailable: boolean;
        layoutMap: Record<string, string> | null;
        layoutError?: string;
      } = {
        apiAvailable: false,
        layoutMap: null,
      };

      if (nav.keyboard && nav.keyboard.getLayoutMap) {
        data.apiAvailable = true;
        try {
          const map = await nav.keyboard.getLayoutMap();
          // Convert map to a plain object for hashing and reporting
          const mapObj: Record<string, string> = {};
          map.forEach((value: string, key: string) => {
            mapObj[key] = value;
          });
          data.layoutMap = mapObj;
        } catch (e) {
          data.layoutError = e instanceof Error ? e.message : String(e);
        }
      }

      const signals: SignalEntry[] = [
        {
          key: "keyboard.layout",
          value: this.inferLayout(data.layoutMap) || "unknown",
          label: "Inferred Keyboard Layout",
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

  /**
   * Infers a high-level layout name from common key mappings.
   */
  private inferLayout(layoutMap: Record<string, string> | null): string | null {
    if (!layoutMap) return null;

    // Very basic inference logic
    if (layoutMap["KeyQ"] === "q" && layoutMap["KeyW"] === "w") return "QWERTY";
    if (layoutMap["KeyQ"] === "a" && layoutMap["KeyW"] === "z") return "AZERTY";
    if (layoutMap["KeyQ"] === "q" && layoutMap["KeyW"] === "j") return "Dvorak";
    if (layoutMap["KeyY"] === "z") return "QWERTZ";

    return "Other";
  }

  getMetadata(): CollectorMetadata {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      description: this.description,
      privacyImplication:
        "The physical keyboard layout can reveal your language and geographic region.",
      usedBy: ["Security systems", "Modern web apps"],
      stabilityWeight: 0.6,
      estimatedDurationMs: 100,
      requiresInteraction: true, // For the optional typing prompt UI component
      browsers: {
        chrome: "68+",
        firefox: false,
        safari: false,
        edge: "79+",
      },
    };
  }
}

registry.register(new KeyboardCollector(), CollectorPriority.P1_FAST);
