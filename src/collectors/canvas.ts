import type {
  Collector,
  CollectorCategory,
  CollectorMetadata,
  CollectorResult,
  SignalEntry,
} from "./types";
import { registry, CollectorPriority } from "./registry";
import { hashData, sha256 } from "../utils/hash";

/**
 * CanvasCollector — Extracts unique rendering patterns from the HTML5 Canvas API.
 * This technique relies on subtle differences in hardware acceleration,
 * font rendering, and anti-aliasing.
 */
export class CanvasCollector implements Collector {
  readonly id = "canvas";
  readonly name = "Canvas Fingerprinting";
  readonly category: CollectorCategory = "gpu-rendering";
  readonly description = "Extracts unique rendering patterns from the HTML5 Canvas API.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 240;
      canvas.height = 60;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return {
          collectorId: this.id,
          status: "unsupported",
          durationMs: performance.now() - start,
          timestamp: Date.now(),
          reason: "Canvas 2D context not available",
        };
      }

      // 1. Fill with a gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "rgb(255, 0, 0)");
      gradient.addColorStop(0.5, "rgb(0, 255, 0)");
      gradient.addColorStop(1, "rgb(0, 0, 255)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw text in multiple fonts
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.font = "18pt Arial";
      ctx.fillText("Browser Fingerprint! 🎨", 10, 30);

      ctx.fillStyle = "rgba(255, 102, 0, 0.7)";
      ctx.font = "14pt 'Times New Roman'";
      ctx.fillText("Browser Fingerprint! 🎨", 15, 45);

      // 3. Draw geometric shapes
      ctx.strokeStyle = "rgb(255, 255, 255)";
      ctx.lineWidth = 2;
      ctx.strokeRect(5, 5, 230, 50);

      ctx.beginPath();
      ctx.arc(200, 30, 20, 0, Math.PI * 2, true);
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fill();

      // 4. Blending modes and shadows
      ctx.globalCompositeOperation = "multiply";
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 2;
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.fillStyle = "rgb(255, 255, 0)";
      ctx.fillRect(50, 10, 30, 30);

      const dataUrl = canvas.toDataURL("image/png");
      const hash = await sha256(dataUrl);

      const data = {
        hash,
        dataUrl,
      };

      const signals: SignalEntry[] = [
        {
          key: "canvas.hash",
          value: hash,
          label: "Canvas Hash",
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

  getMetadata(): CollectorMetadata {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      description: this.description,
      privacyImplication:
        "Canvas fingerprinting uses subtle differences in hardware-accelerated 2D rendering and font smoothing to create a unique identifier.",
      usedBy: ["Fingerprint.com", "LinkedIn", "Google", "DataDome"],
      stabilityWeight: 1.0,
      estimatedDurationMs: 150,
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

registry.register(new CanvasCollector(), CollectorPriority.P1_FAST);
