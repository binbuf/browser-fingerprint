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
 * SpeechCollector — Available Text-to-Speech voices.
 * The set of installed voices depends on the OS, language packs, and browser.
 */
export class SpeechCollector implements Collector {
  readonly id = "speech";
  readonly name = "Speech Synthesis Voices";
  readonly category: CollectorCategory = "browser-state";
  readonly description = "Probes available text-to-speech voices provided by the system.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      if (!window.speechSynthesis) {
        return {
          collectorId: this.id,
          status: "unsupported",
          durationMs: performance.now() - start,
          timestamp: Date.now(),
          reason: "Speech Synthesis API is not supported in this browser.",
        };
      }

      const voices = await this.getVoicesWithTimeout(2000);
      
      const voiceList = voices.map(v => ({
        name: v.name,
        lang: v.lang,
        localService: v.localService,
        default: v.default
      }));

      const data = {
        voiceCount: voices.length,
        voiceList: voiceList.sort((a, b) => a.name.localeCompare(b.name))
      };

      const signals: SignalEntry[] = [
        {
          key: "speech.voiceCount",
          value: data.voiceCount,
          label: "TTS Voice Count",
        },
        {
          key: "speech.voiceList",
          value: data.voiceList.map(v => v.name).join(","),
          label: "TTS Voice Names",
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
   * Waits for voices to load, with a timeout.
   */
  private async getVoicesWithTimeout(timeoutMs: number): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      let resolved = false;

      const finish = () => {
        if (!resolved) {
          resolved = true;
          resolve(window.speechSynthesis.getVoices());
        }
      };

      // Check if already available
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        finish();
        return;
      }

      // Listen for voiceschanged event
      window.speechSynthesis.onvoiceschanged = () => {
        finish();
      };

      // Timeout fallback
      setTimeout(finish, timeoutMs);
    });
  }

  getMetadata(): CollectorMetadata {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      description: this.description,
      privacyImplication:
        "The set of available voices depends on your OS, installed language packs, and browser, providing a significant amount of entropy.",
      usedBy: ["Fingerprint.com", "Bot detection systems"],
      stabilityWeight: 0.6,
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

registry.register(new SpeechCollector(), CollectorPriority.P1_FAST);
