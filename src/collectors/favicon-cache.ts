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
 * FaviconCacheCollector — Detects the favicon cache supercookie vulnerability.
 * This technique uses the browser's favicon cache to store a persistent identifier
 * that survives clearing cookies and local storage.
 */
export class FaviconCacheCollector implements Collector {
  readonly id = "favicon-cache";
  readonly name = "Favicon Cache Detection";
  readonly category: CollectorCategory = "privacy-detection";
  readonly description = "Probes the browser's favicon cache for persistent 'supercookie' identifiers.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      // 1. Get or generate tracking ID
      let trackingId = localStorage.getItem("bf_favicon_id");
      const isFirstVisit = !trackingId;
      if (isFirstVisit) {
        trackingId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem("bf_favicon_id", trackingId);
      }

      // 2. Probing technique (demonstration)
      // In a real attack, the server would serve 302 redirects to different favicons
      // to represent bits of an ID. Here we just probe a single path.
      const probeUrl = `${window.location.origin}/favicon.ico?id=${trackingId}&probe=${Date.now()}`;
      
      // We simulate the detection logic
      // In a real scenario, we'd measure if the browser even makes a request
      // or if it returns immediately from its internal favicon cache.
      const { cacheHit, vulnerable } = await this.probeFaviconCache(probeUrl);

      const data = {
        cacheHit,
        technique: "Favicon Cache Timing/Probing",
        browserVulnerable: vulnerable,
        trackingId: trackingId,
      };

      const signals: SignalEntry[] = [
        {
          key: "faviconCache.vulnerable",
          value: vulnerable,
          label: "Favicon Cache Vulnerable",
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

  private async probeFaviconCache(_url: string): Promise<{ cacheHit: boolean; vulnerable: boolean }> {
    // This is a simplified demonstration of the timing attack.
    // Modern browsers (Chrome 89+, Safari, Firefox) have partitioned the favicon cache
    // by top-level site, which mitigates cross-site tracking via this method.
    
    // For the purpose of this collector in a static app, we check if the browser
    // supports features that would make it vulnerable if it didn't partition.
    
    const isChrome = navigator.userAgent.includes("Chrome");
    const isEdge = navigator.userAgent.includes("Edg");
    const isFirefox = navigator.userAgent.includes("Firefox");
    const _isSafari = navigator.userAgent.includes("Safari") && !isChrome;

    // Determine vulnerability based on browser version/type
    // (This is an approximation for the UI)
    let vulnerable = false;
    if (isChrome || isEdge) {
      const match = navigator.userAgent.match(/(Chrome|Edg)\/(\d+)/);
      if (match && parseInt(match[2]) < 89) vulnerable = true;
    } else if (isFirefox) {
      // Firefox mitigated this around version 85
      const match = navigator.userAgent.match(/Firefox\/(\d+)/);
      if (match && parseInt(match[1]) < 85) vulnerable = true;
    }

    // Since we can't easily probe the *real* favicon cache without a dedicated backend
    // that responds to F-cache specific requests, we return a simulated result.
    return {
      cacheHit: false, // In this static demo, it's always a miss
      vulnerable,
    };
  }

  getMetadata(): CollectorMetadata {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      description: this.description,
      privacyImplication:
        "The favicon cache can be used to store a 'supercookie' that persists even after you clear your browsing data.",
      usedBy: ["Academic Researchers", "Advanced Tracking Frameworks"],
      stabilityWeight: 0.3,
      estimatedDurationMs: 200,
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

registry.register(new FaviconCacheCollector(), CollectorPriority.P2_MEDIUM);
