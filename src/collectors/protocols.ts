import type {
  Collector,
  CollectorCategory,
  CollectorMetadata,
  CollectorResult,
  SignalEntry,
} from "./types";
import { registry, CollectorPriority } from "./registry";
import { protocolHandlerList } from "../data/protocol-handlers";
import type { ProtocolHandlerEntry } from "../data/types";
import { hashData } from "../utils/hash";

/**
 * ProtocolCollector — Detects installed applications via URI scheme handlers.
 * Uses the iframe-based probe technique with timeout detection.
 */
export class ProtocolCollector implements Collector {
  readonly id = "protocols";
  readonly name = "Protocol Handlers";
  readonly category: CollectorCategory = "installed-software";
  readonly description = "Probes for installed applications using custom URI scheme handlers.";

  async collect(signal?: AbortSignal): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const detectedProtocols: ProtocolHandlerEntry[] = [];
      const totalProbed = protocolHandlerList.length;

      // Protocol detection is invasive and can trigger dialogs.
      // We process them one by one to minimize impact and allow for focus-based detection.
      for (const entry of protocolHandlerList) {
        if (signal?.aborted) {
          throw new Error("Aborted");
        }

        const isDetected = await this.probeProtocol(entry.scheme);
        if (isDetected) {
          detectedProtocols.push(entry);
        }
      }

      const detectedSchemes = detectedProtocols.map((p) => p.scheme).sort();
      const inferredApplications = Array.from(new Set(detectedProtocols.map((p) => p.applicationName))).sort();

      const data = {
        detectedProtocols,
        detectedCount: detectedProtocols.length,
        totalProbed,
        inferredApplications,
      };

      const signals: SignalEntry[] = [
        {
          key: "protocols.detected",
          value: detectedSchemes.join(","),
          label: "Detected Protocols",
        },
        {
          key: "protocols.detectedCount",
          value: data.detectedCount,
          label: "Protocol Count",
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
   * Probes a single protocol scheme.
   * Note: This is a best-effort implementation as browser security models
   * increasingly restrict protocol probing to prevent fingerprinting.
   */
  private async probeProtocol(scheme: string): Promise<boolean> {
    return new Promise((resolve) => {
      let resolved = false;
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      const cleanup = () => {
        if (resolved) return;
        resolved = true;
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
        window.removeEventListener("blur", onBlur);
      };

      const onBlur = () => {
        cleanup();
        resolve(true);
      };

      window.addEventListener("blur", onBlur);

      // Timeout as a fallback
      setTimeout(() => {
        cleanup();
        resolve(false);
      }, 500);

      try {
        iframe.src = `${scheme}://test`;
      } catch (_e) {
        // Some browsers might throw immediately for unknown schemes
        cleanup();
        resolve(false);
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
        "Detecting which protocol handlers (like zoommtg:// or slack://) are registered can reveal exactly which applications you have installed on your system.",
      usedBy: ["Malware", "Advanced Trackers", "Anti-Fraud Systems"],
      stabilityWeight: 0.6,
      estimatedDurationMs: 2000,
      requiresInteraction: false,
      isNoisy: true,
      browsers: {
        chrome: "Partial",
        firefox: "Partial",
        safari: "Limited",
        edge: "Partial",
      },
    };
  }
}

registry.register(new ProtocolCollector(), CollectorPriority.P2_MEDIUM);
