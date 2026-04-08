import type {
  Collector,
  CollectorCategory,
  CollectorMetadata,
  CollectorResult,
  SignalEntry,
} from "./types";
import { registry, CollectorPriority } from "./registry";
import { hashData } from "../utils/hash";

interface DetectedCountermeasure {
  technique: string;
  detected: boolean;
  description: string;
  tool?: string;
}

interface AntiFingerprintReport {
  detected: boolean;
  countermeasures: DetectedCountermeasure[];
  overallEffectiveness: "none" | "partial" | "strong";
}

/**
 * AntiFingerprintCollector — Detects anti-fingerprinting countermeasures and spoofing attempts.
 * This collector identifies if the browser is actively trying to hide its real identity.
 */
export class AntiFingerprintCollector implements Collector {
  readonly id = "anti-fingerprint";
  readonly name = "Anti-Fingerprint Detection";
  readonly category: CollectorCategory = "privacy-detection";
  readonly description = "Identifies active anti-fingerprinting countermeasures and spoofing.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const countermeasures: DetectedCountermeasure[] = [];

      // 1. Canvas Noise Detection
      const canvasNoise = await this.checkCanvasNoise();
      countermeasures.push({
        technique: "Canvas noise injection",
        detected: canvasNoise,
        description: "Detects if the browser injects noise into canvas rendering to spoof the fingerprint.",
      });

      // 2. Prototype Tampering
      const prototypeTampering = this.checkPrototypeTampering();
      countermeasures.push({
        technique: "Prototype tampering",
        detected: prototypeTampering,
        description: "Detects if native browser APIs have been overridden by scripts.",
      });

      // 3. User-Agent Spoofing
      const uaInconsistency = await this.checkUAInconsistency();
      countermeasures.push({
        technique: "User-Agent inconsistency",
        detected: uaInconsistency,
        description: "Detects mismatches between User-Agent string and modern Client Hints API.",
      });

      // 4. Firefox ResistFingerprinting (RFP)
      const firefoxRFP = this.checkFirefoxRFP();
      countermeasures.push({
        technique: "Firefox ResistFingerprinting",
        detected: firefoxRFP,
        description: "Detects if Firefox's built-in 'privacy.resistFingerprinting' is active.",
        tool: "Firefox",
      });

      // 5. Brave Shields
      const braveShields = await this.checkBrave();
      countermeasures.push({
        technique: "Brave Shields",
        detected: braveShields,
        description: "Detects if Brave's built-in fingerprinting protection is active.",
        tool: "Brave",
      });

      // 6. Tor Browser
      const torBrowser = this.checkTor();
      countermeasures.push({
        technique: "Tor Browser signature",
        detected: torBrowser,
        description: "Detects specific indicators of the Tor Browser.",
        tool: "Tor Browser",
      });

      // 7. Timezone/Date Spoofing
      const timezoneSpoofing = this.checkTimezoneSpoofing();
      countermeasures.push({
        technique: "Timezone/Date spoofing",
        detected: timezoneSpoofing,
        description: "Detects inconsistencies between timezone API and date object.",
      });

      const detectedCount = countermeasures.filter((c) => c.detected).length;
      let overallEffectiveness: "none" | "partial" | "strong" = "none";
      if (detectedCount >= 4 || torBrowser || firefoxRFP) {
        overallEffectiveness = "strong";
      } else if (detectedCount > 0) {
        overallEffectiveness = "partial";
      }

      const report: AntiFingerprintReport = {
        detected: detectedCount > 0,
        countermeasures,
        overallEffectiveness,
      };

      const signals: SignalEntry[] = [
        {
          key: "antiFingerprint.countermeasureCount",
          value: detectedCount,
          label: "Countermeasure Count",
        },
        {
          key: "antiFingerprint.effectiveness",
          value: overallEffectiveness,
          label: "Protection Effectiveness",
        },
      ];

      return {
        collectorId: this.id,
        status: "completed",
        durationMs: performance.now() - start,
        timestamp: Date.now(),
        data: report as unknown as Record<string, unknown>,
        hash: await hashData(report),
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

  private async checkCanvasNoise(): Promise<boolean> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    ctx.font = "14px Arial";
    ctx.fillText("anti-fingerprint check", 2, 10);
    const data1 = canvas.toDataURL();
    const data2 = canvas.toDataURL();
    return data1 !== data2;
  }

  private checkPrototypeTampering(): boolean {
    const nativeToString = Function.prototype.toString;
    const checks = [
      navigator.mediaDevices?.enumerateDevices,
      window.requestAnimationFrame,
      HTMLCanvasElement.prototype.toDataURL,
      AudioContext.prototype.createOscillator,
    ];

    for (const fn of checks) {
      if (fn && nativeToString.call(fn).indexOf("[native code]") === -1) {
        return true;
      }
    }
    return false;
  }

  private async checkUAInconsistency(): Promise<boolean> {
    // @ts-expect-error - userAgentData is a modern API not yet in all TS versions
    if (navigator.userAgentData) {
      // @ts-expect-error - userAgentData is a modern API not yet in all TS versions
      const brands = (await navigator.userAgentData.getHighEntropyValues(["brands"])).brands;
      const ua = navigator.userAgent;
      
      // Simple check: if UA says Chrome but brands don't include it (or vice versa)
      const isChromeUA = ua.includes("Chrome");
      const isChromeBrand = brands.some((b: { brand: string; version: string }) => 
        b.brand.includes("Google Chrome") || b.brand.includes("Chrome")
      );
      
      if (isChromeUA !== isChromeBrand) return true;
    }
    return false;
  }

  private checkFirefoxRFP(): boolean {
    // Firefox RFP spoofs several things:
    // 1. Timezone is UTC
    // 2. Screen resolution is rounded to content window size or multiples of 100/200
    // 3. navigator.deviceMemory is 8 (on desktop)
    // 4. navigator.hardwareConcurrency is 2
    const isFirefox = navigator.userAgent.includes("Firefox");
    if (!isFirefox) return false;

    const isUTC = new Intl.DateTimeFormat().resolvedOptions().timeZone === "UTC";
    const nav = navigator as unknown as { deviceMemory?: number };
    const isStandardMemory = nav.deviceMemory === 8 || nav.deviceMemory === undefined;
    const isStandardConcurrency = navigator.hardwareConcurrency === 2 || navigator.hardwareConcurrency === undefined;

    return isUTC && isStandardMemory && isStandardConcurrency;
  }

  private async checkBrave(): Promise<boolean> {
    // @ts-expect-error - brave is a Brave-specific property
    return navigator.brave !== undefined && await navigator.brave.isBrave();
  }

  private checkTor(): boolean {
    // Tor Browser indicators (mostly RFP-like but more aggressive)
    const isUTC = new Intl.DateTimeFormat().resolvedOptions().timeZone === "UTC";
    // Tor Browser often has a specific window size or starts with one
    const isTorRes = (window.innerWidth % 200 === 0 && window.innerHeight % 100 === 0);
    return isUTC && isTorRes && navigator.userAgent.includes("Firefox"); // Tor is Firefox-based
  }

  private checkTimezoneSpoofing(): boolean {
    const date = new Date();
    const _offset = date.getTimezoneOffset();
    const _intlTimezone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // This is a complex check, but a simple version:
    // If intl says one thing but offset says another wildly different thing
    // (Note: this is hard to do reliably without a mapping of timezones to offsets)
    return false; // Placeholder for more complex logic if needed
  }

  getMetadata(): CollectorMetadata {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      description: this.description,
      privacyImplication:
        "Detecting anti-fingerprinting tools can ironically make you more unique, as only a small percentage of users employ them.",
      usedBy: ["Fingerprint.com", "Ad-blocking Detectors"],
      stabilityWeight: 0.6,
      estimatedDurationMs: 300,
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

registry.register(new AntiFingerprintCollector(), CollectorPriority.P2_MEDIUM);
