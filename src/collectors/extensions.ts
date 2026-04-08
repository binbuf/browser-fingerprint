import type {
  Collector,
  CollectorCategory,
  CollectorMetadata,
  CollectorResult,
  SignalEntry,
} from "./types";
import { registry, CollectorPriority } from "./registry";
import { extensionList } from "../data/extension-ids";
import type { ExtensionEntry, ExtensionCategory, SilentProbe } from "../data/types";
import { hashData } from "../utils/hash";

/**
 * ExtensionCollector — Hybrid detection for browser extensions.
 * 1. Silent Probes: Stealthy detection via window objects, DOM markers, or CSS side-effects.
 * 2. WAR Probing: Web Accessible Resource (WAR) probing via chrome-extension:// scheme (ADR-009).
 */
export class ExtensionCollector implements Collector {
  readonly id = "extensions";
  readonly name = "Browser Extensions";
  readonly category: CollectorCategory = "installed-software";
  readonly description = "Probes installed browser extensions via silent probes and Web Accessible Resource (WAR) fetch.";

  private readonly BATCH_SIZE = 30;

  async collect(signal?: AbortSignal): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const detectedExtensions: ExtensionEntry[] = [];
      const totalProbed = extensionList.length;

      // 1. Run Silent Probes (Stealthy, no console noise)
      for (const ext of extensionList) {
        if (ext.silentProbe && this.runSilentProbe(ext.silentProbe)) {
          detectedExtensions.push(ext);
        }
      }

      // 2. Run WAR Probes (Noisy, only if supported and not already detected)
      const isChromium = !!(window as unknown as Window & { chrome?: unknown }).chrome;
      
      // We skip WAR probing in certain environments or if we want to be strictly silent.
      // For this prototype, we'll proceed but allow for future filtering.
      if (isChromium) {
        const alreadyFoundIds = new Set(detectedExtensions.map(e => e.id));
        const remainingToProbe = extensionList.filter(e => !alreadyFoundIds.has(e.id));

        for (let i = 0; i < remainingToProbe.length; i += this.BATCH_SIZE) {
          if (signal?.aborted) {
            throw new Error("Aborted");
          }

          const batch = remainingToProbe.slice(i, i + this.BATCH_SIZE);
          const batchResults = await this.probeBatch(batch, signal);
          detectedExtensions.push(...batchResults);

          await this.yield();
        }
      }

      const detectedIds = Array.from(new Set(detectedExtensions.map((e) => e.id))).sort();
      const categories: Record<ExtensionCategory, ExtensionEntry[]> = {
        "ad-blocker": [],
        "password-manager": [],
        "dev-tools": [],
        privacy: [],
        productivity: [],
        social: [],
        shopping: [],
        vpn: [],
        accessibility: [],
        other: [],
      };

      for (const ext of detectedExtensions) {
        categories[ext.category].push(ext);
      }

      const data = {
        detectedExtensions,
        detectedCount: detectedExtensions.length,
        totalProbed,
        categories,
      };

      const signals: SignalEntry[] = [
        {
          key: "extensions.detected",
          value: detectedIds.join(","),
          label: "Detected Extensions",
        },
        {
          key: "extensions.detectedCount",
          value: data.detectedCount,
          label: "Extension Count",
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

  private runSilentProbe(probe: SilentProbe): boolean {
    try {
      switch (probe.type) {
        case "window": {
          // Check for global variable
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (window as any)[probe.target] !== undefined;
        }
        case "dom": {
          // Check for injected element
          return !!document.querySelector(probe.target);
        }
        case "css": {
          // Check for CSS side effect (e.g. ad-blocker hiding an element)
          const testEl = document.createElement("div");
          testEl.className = probe.target;
          testEl.style.position = "absolute";
          testEl.style.left = "-9999px";
          testEl.style.width = "10px";
          testEl.style.height = "10px";
          document.body.appendChild(testEl);
          
          // Ad-blockers often hide elements with specific classes
          const isHidden = window.getComputedStyle(testEl).display === "none" || 
                           window.getComputedStyle(testEl).visibility === "hidden" ||
                           testEl.offsetHeight === 0;
                           
          document.body.removeChild(testEl);
          return isHidden;
        }
        default:
          return false;
      }
    } catch (_e) {
      return false;
    }
  }

  private async probeBatch(batch: ExtensionEntry[], signal?: AbortSignal): Promise<ExtensionEntry[]> {
    const probes = batch.map((ext) => {
      return new Promise<ExtensionEntry | null>((resolve) => {
        if (signal?.aborted) {
          return resolve(null);
        }

        const url = `chrome-extension://${ext.id}/${ext.warPath}`;
        const img = new Image();

        const cleanup = () => {
          img.onload = null;
          img.onerror = null;
          if (signal) {
            signal.removeEventListener("abort", onAbort);
          }
        };

        const onAbort = () => {
          cleanup();
          resolve(null);
        };

        img.onload = () => {
          cleanup();
          resolve(ext);
        };

        img.onerror = () => {
          cleanup();
          resolve(null);
        };

        if (signal) {
          signal.addEventListener("abort", onAbort);
        }

        img.src = url;
      });
    });

    const results = await Promise.all(probes);
    return results.filter((ext): ext is ExtensionEntry => ext !== null);
  }

  private yield(): Promise<void> {
    return new Promise((resolve) => {
      const win = window as unknown as Window & {
        requestIdleCallback?: (callback: () => void) => void;
      };
      if (typeof win.requestIdleCallback === "function") {
        win.requestIdleCallback(() => resolve());
      } else {
        setTimeout(resolve, 1);
      }
    });
  }

  getMetadata(): CollectorMetadata {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      description: this.description,
      privacyImplication:
        "Your installed browser extensions can reveal a lot about your habits, privacy-consciousness, and software tools. Many extensions leave behind 'fingerprints' that can be detected by websites.",
      usedBy: ["LinkedIn", "Fingerprint.com", "Ad-Fraud Detection"],
      stabilityWeight: 0.3,
      estimatedDurationMs: 3000,
      requiresInteraction: false,
      isNoisy: false, // Now has silent probes as primary fallback
      browsers: {
        chrome: true,
        firefox: "Silent Only",
        safari: false,
        edge: true,
      },
    };
  }
}

registry.register(new ExtensionCollector(), CollectorPriority.P3_SLOW);
