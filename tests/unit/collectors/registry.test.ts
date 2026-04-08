import { describe, it, expect, beforeEach } from "vitest";
import { CollectorRegistry, CollectorPriority } from "../../../src/collectors/registry";
import type { Collector, CollectorMetadata, CollectorResult } from "../../../src/collectors/types";

// Mock collector factory
function createMockCollector(id: string): Collector {
  return {
    id,
    name: `Mock Collector ${id}`,
    category: "browser-state",
    description: `Description for ${id}`,
    collect: async (): Promise<CollectorResult> => {
      return {
        collectorId: id,
        status: "completed",
        durationMs: 10,
        timestamp: Date.now(),
        data: {},
        hash: "hash",
        signals: [],
      };
    },
    getMetadata: (): CollectorMetadata => ({
      id,
      name: `Mock Collector ${id}`,
      category: "browser-state",
      description: `Description for ${id}`,
      privacyImplication: "None",
      usedBy: [],
      stabilityWeight: 1,
      estimatedDurationMs: 10,
      requiresInteraction: false,
      browsers: { chrome: true, firefox: true, safari: true, edge: true },
    }),
  };
}

describe("CollectorRegistry", () => {
  let registry: CollectorRegistry;

  beforeEach(() => {
    registry = new CollectorRegistry();
  });

  it("should be initially empty", () => {
    expect(registry.count).toBe(0);
    expect(registry.getAllSorted()).toEqual([]);
  });

  it("should register and retrieve a single collector", () => {
    const col = createMockCollector("test-1");
    registry.register(col, CollectorPriority.P0_INSTANT);

    expect(registry.count).toBe(1);
    expect(registry.get("test-1")).toBe(col);
  });

  it("should return undefined for unregistered collector ID", () => {
    expect(registry.get("non-existent")).toBeUndefined();
  });

  it("should throw error on duplicate registration", () => {
    const col1 = createMockCollector("duplicate");
    const col2 = createMockCollector("duplicate");

    registry.register(col1, CollectorPriority.P1_FAST);

    expect(() => registry.register(col2, CollectorPriority.P2_MEDIUM)).toThrowError(
      "Collector with ID 'duplicate' is already registered."
    );
  });

  it("should sort collectors by priority (P0 to P3)", () => {
    const p3 = createMockCollector("slow");
    const p1 = createMockCollector("fast");
    const p0 = createMockCollector("instant");
    const p2 = createMockCollector("medium");

    // Register in mixed order
    registry.register(p3, CollectorPriority.P3_SLOW);
    registry.register(p1, CollectorPriority.P1_FAST);
    registry.register(p0, CollectorPriority.P0_INSTANT);
    registry.register(p2, CollectorPriority.P2_MEDIUM);

    const sorted = registry.getAllSorted();
    expect(sorted.length).toBe(4);
    expect(sorted[0].id).toBe("instant");
    expect(sorted[1].id).toBe("fast");
    expect(sorted[2].id).toBe("medium");
    expect(sorted[3].id).toBe("slow");
  });

  it("should return priority order IDs", () => {
    registry.register(createMockCollector("b"), CollectorPriority.P1_FAST);
    registry.register(createMockCollector("a"), CollectorPriority.P0_INSTANT);

    expect(registry.getPriorityOrder()).toEqual(["a", "b"]);
  });

  it("should return metadata for all collectors in sorted order", () => {
    registry.register(createMockCollector("b"), CollectorPriority.P1_FAST);
    registry.register(createMockCollector("a"), CollectorPriority.P0_INSTANT);

    const metadataList = registry.getAllMetadata();
    expect(metadataList.length).toBe(2);
    expect(metadataList[0].id).toBe("a");
    expect(metadataList[1].id).toBe("b");
  });
});
