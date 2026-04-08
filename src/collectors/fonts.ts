import type {
  Collector,
  CollectorCategory,
  CollectorMetadata,
  CollectorResult,
  SignalEntry,
} from "./types";
import { registry, CollectorPriority } from "./registry";
import { fontList } from "../data/font-list";
import type { FontEntry, FontCategory } from "../data/types";
import { hashData } from "../utils/hash";

/**
 * FontCollector — CSS measurement probe for detecting installed fonts.
 * Uses the offsetWidth/offsetHeight difference technique (ADR-011).
 */
export class FontCollector implements Collector {
  readonly id = "fonts";
  readonly name = "Installed Fonts";
  readonly category: CollectorCategory = "installed-software";
  readonly description = "Probes system fonts using CSS measurement side-channels.";

  private readonly BATCH_SIZE = 50;
  private readonly TEST_STRING = "mmmmmmmmmmlli";
  private readonly BASELINE_FONTS = ["serif", "sans-serif", "monospace"] as const;

  async collect(signal?: AbortSignal): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const container = this.createTestContainer();
      document.body.appendChild(container);

      const baselines = this.measureBaselines(container);
      const detectedFonts: FontEntry[] = [];
      const totalProbed = fontList.length;

      // Process in batches to avoid blocking UI thread
      for (let i = 0; i < fontList.length; i += this.BATCH_SIZE) {
        if (signal?.aborted) {
          document.body.removeChild(container);
          throw new Error("Aborted");
        }

        const batch = fontList.slice(i, i + this.BATCH_SIZE);
        for (const font of batch) {
          if (this.isFontInstalled(font.name, container, baselines)) {
            detectedFonts.push(font);
          }
        }

        // Yield to UI thread
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }

      document.body.removeChild(container);

      const detectedFontNames = detectedFonts.map((f) => f.name).sort();
      const categories: Record<FontCategory, string[]> = {
        "os-default": [],
        adobe: [],
        "ms-office": [],
        google: [],
        developer: [],
        design: [],
        other: [],
      };

      const inferredSoftware = new Set<string>();

      for (const font of detectedFonts) {
        categories[font.category].push(font.name);
        if (font.infersSoftware) {
          inferredSoftware.add(font.infersSoftware);
        }
      }

      const data = {
        detectedFonts: detectedFontNames,
        detectedCount: detectedFontNames.length,
        totalProbed,
        categories,
        inferredSoftware: Array.from(inferredSoftware).sort(),
      };

      const signals: SignalEntry[] = [
        {
          key: "fonts.detected",
          value: detectedFontNames.join(","),
          label: "Detected Fonts",
        },
        {
          key: "fonts.detectedCount",
          value: data.detectedCount,
          label: "Font Count",
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

  private createTestContainer(): HTMLDivElement {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.visibility = "hidden";
    container.style.fontSize = "72px"; // Large font size to magnify differences
    return container;
  }

  private createTestSpan(fontFamily: string, text: string): HTMLSpanElement {
    const span = document.createElement("span");
    span.textContent = text;
    span.style.fontFamily = fontFamily;
    return span;
  }

  private measureBaselines(container: HTMLDivElement): Record<string, { w: number; h: number }> {
    const baselines: Record<string, { w: number; h: number }> = {};

    for (const base of this.BASELINE_FONTS) {
      const span = this.createTestSpan(base, this.TEST_STRING);
      container.appendChild(span);
      baselines[base] = { w: span.offsetWidth, h: span.offsetHeight };
    }

    return baselines;
  }

  private isFontInstalled(
    fontName: string,
    container: HTMLDivElement,
    baselines: Record<string, { w: number; h: number }>
  ): boolean {
    for (const base of this.BASELINE_FONTS) {
      const fontFamily = `"${fontName}", ${base}`;
      const span = this.createTestSpan(fontFamily, this.TEST_STRING);
      container.appendChild(span);

      const w = span.offsetWidth;
      const h = span.offsetHeight;

      container.removeChild(span);

      // If dimensions differ from the baseline, the font is installed
      if (w !== baselines[base].w || h !== baselines[base].h) {
        return true;
      }
    }
    return false;
  }

  getMetadata(): CollectorMetadata {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      description: this.description,
      privacyImplication:
        "Your installed font list is highly identifying and can reveal software you have installed, such as Adobe Creative Suite or Microsoft Office.",
      usedBy: ["Fingerprint.com", "LinkedIn", "Cloudflare"],
      stabilityWeight: 1.0,
      estimatedDurationMs: 2000,
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

registry.register(new FontCollector(), CollectorPriority.P3_SLOW);
