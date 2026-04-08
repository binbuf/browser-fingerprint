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
 * GamepadCollector — Probes connected gamepads and controllers.
 */
export class GamepadCollector implements Collector {
  readonly id = "gamepad";
  readonly name = "Game Controllers";
  readonly category: CollectorCategory = "browser-state";
  readonly description = "Probes connected gamepads and input devices.";

  async collect(): Promise<CollectorResult> {
    const start = performance.now();

    try {
      const nav = window.navigator;
      if (!nav.getGamepads) {
        return {
          collectorId: this.id,
          status: "unsupported",
          durationMs: performance.now() - start,
          timestamp: Date.now(),
          reason: "Gamepad API is not supported in this browser.",
        };
      }

      // Filter null values (getGamepads returns null for empty slots)
      const gamepads = Array.from(nav.getGamepads()).filter((gp): gp is Gamepad => gp !== null);
      
      const gamepadData = gamepads.map((gp: Gamepad) => ({
        id: gp.id,
        mapping: gp.mapping,
        buttons: gp.buttons.length,
        axes: gp.axes.length,
      }));

      const data = {
        count: gamepads.length,
        gamepads: gamepadData,
      };

      const signals: SignalEntry[] = [
        {
          key: "gamepad.count",
          value: data.count,
          label: "Connected Gamepads",
        },
        {
          key: "gamepad.ids",
          value: gamepadData.map(gp => gp.id).sort().join(","),
          label: "Gamepad IDs",
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
        "Information about connected game controllers can reveal your gaming hardware and usage patterns.",
      usedBy: ["Fingerprint.com", "Gaming platforms"],
      stabilityWeight: 0.3,
      estimatedDurationMs: 20,
      requiresInteraction: false,
      browsers: {
        chrome: true,
        firefox: true,
        safari: "10.1+",
        edge: true,
      },
    };
  }
}

registry.register(new GamepadCollector(), CollectorPriority.P1_FAST);
