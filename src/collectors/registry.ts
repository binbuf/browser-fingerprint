import type { Collector, CollectorMetadata } from "./types";

/**
 * Priority tiers for collector execution ordering.
 * P0 runs first (fast), P3 runs last (slow).
 */
export enum CollectorPriority {
  P0_INSTANT = 0, // <50ms: screen, navigator, timezone, math, css-media, network
  P1_FAST = 1, // <500ms: canvas, webgl, audio, client-hints, permissions, storage, performance, keyboard, gamepad, speech
  P2_MEDIUM = 2, // ~1-2s: webrtc, webgpu, anti-fingerprint, favicon-cache, protocol, recognition
  P3_SLOW = 3, // ~2-5s: fonts, extensions
}

interface RegisteredCollector {
  collector: Collector;
  priority: CollectorPriority;
}

/**
 * Central registry for all fingerprinting collector modules.
 */
export class CollectorRegistry {
  private collectors: Map<string, RegisteredCollector>;

  constructor() {
    this.collectors = new Map();
  }

  /** Register a collector with a priority tier */
  register(collector: Collector, priority: CollectorPriority): void {
    if (this.collectors.has(collector.id)) {
      throw new Error(`Collector with ID '${collector.id}' is already registered.`);
    }
    this.collectors.set(collector.id, { collector, priority });
  }

  /** Get a single collector by ID */
  get(id: string): Collector | undefined {
    return this.collectors.get(id)?.collector;
  }

  /** Get all registered collectors sorted by priority (P0 first, P3 last) */
  getAllSorted(): Collector[] {
    return Array.from(this.collectors.values())
      .sort((a, b) => a.priority - b.priority)
      .map((entry) => entry.collector);
  }

  /** Get collector IDs in priority order */
  getPriorityOrder(): string[] {
    return this.getAllSorted().map((collector) => collector.id);
  }

  /** Get metadata for all collectors */
  getAllMetadata(): CollectorMetadata[] {
    return this.getAllSorted().map((collector) => collector.getMetadata());
  }

  /** Get total count of registered collectors */
  get count(): number {
    return this.collectors.size;
  }
}

/** Singleton registry instance */
export const registry = new CollectorRegistry();
