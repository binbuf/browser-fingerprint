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
 * AudioContextCollector — OfflineAudioContext oscillator fingerprint.
 * This technique creates a unique signature based on how the browser's
 * audio stack processes a specific set of audio nodes.
 */
export class AudioContextCollector implements Collector {
  readonly id = "audio";
  readonly name = "Audio Fingerprinting";
  readonly category: CollectorCategory = "audio";
  readonly description = "Probes the browser's audio processing stack for unique signatures.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const AudioContextClass =
        window.OfflineAudioContext ||
        (window as unknown as Window & {
          webkitOfflineAudioContext: typeof OfflineAudioContext;
        }).webkitOfflineAudioContext;

      if (!AudioContextClass) {
        return {
          collectorId: this.id,
          status: "unsupported",
          durationMs: performance.now() - start,
          timestamp: Date.now(),
          reason: "OfflineAudioContext not supported",
        };
      }

      // 1. Create OfflineAudioContext (1 channel, 44100 samples, 44100 Hz sample rate)
      const context = new AudioContextClass(1, 44100, 44100);

      // 2. Create oscillator node (type: triangle, frequency: 10000 Hz)
      const oscillator = context.createOscillator();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(10000, context.currentTime);

      // 3. Create compressor node (threshold: -50, knee: 40, ratio: 12, attack: 0, release: 0.25)
      const compressor = context.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-50, context.currentTime);
      compressor.knee.setValueAtTime(40, context.currentTime);
      compressor.ratio.setValueAtTime(12, context.currentTime);
      compressor.attack.setValueAtTime(0, context.currentTime);
      compressor.release.setValueAtTime(0.25, context.currentTime);

      // 4. Connect: oscillator -> compressor -> destination
      oscillator.connect(compressor);
      compressor.connect(context.destination);

      // 5. Start oscillator, render audio
      oscillator.start(0);
      const renderedBuffer = await context.startRendering();

      // 6. Get channel data from the rendered buffer
      const channelData = renderedBuffer.getChannelData(0);

      // 7. Sum a specific slice of samples (e.g., samples 4500-5000)
      let sampleSum = 0;
      for (let i = 4500; i < 5000; i++) {
        sampleSum += channelData[i];
      }

      // 8. Hash the sum value
      const hash = await sha256(String(sampleSum));

      const data = {
        hash,
        sampleSum,
      };

      const signals: SignalEntry[] = [
        {
          key: "audio.hash",
          value: hash,
          label: "Audio Hash",
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
        "Audio fingerprinting exploits subtle variations in how different browsers and operating systems process audio signals, creating a stable identifier without needing microphone access.",
      usedBy: ["Fingerprint.com", "DataDome"],
      stabilityWeight: 1.0,
      estimatedDurationMs: 250,
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

registry.register(new AudioContextCollector(), CollectorPriority.P1_FAST);
