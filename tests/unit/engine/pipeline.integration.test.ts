import "fake-indexeddb/auto";
import { expect, test, describe, beforeEach, vi, afterEach, beforeAll, afterAll } from "vitest";
import { Orchestrator } from "../../../src/engine/orchestrator";
import { registry, CollectorPriority } from "../../../src/collectors/registry";
import { ScoreEngine } from "../../../src/engine/scorer";
import { Matcher } from "../../../src/engine/matcher";
import { createPersistenceStore, snapshotToSerialized, serializedToSnapshot } from "../../../src/persistence/store";
import type { Collector, CollectorResult, CollectorResultSuccess, CollectorMetadata } from "../../../src/collectors/types";
import type { PersistedFingerprint } from "../../../src/persistence/types";
import type { FingerprintSnapshot } from "../../../src/engine/types";

function createMockCollector(
  id: string,
  priority: CollectorPriority,
  delayMs: number = 10,
  shouldThrow: boolean = false,
  shouldHang: boolean = false,
  dataOverride?: Record<string, unknown>,
  signalOverride?: { key: string; value: string | number | boolean; label: string }
): Collector {
  return {
    id,
    name: `Mock ${id}`,
    category: "browser-state",
    description: `Mock ${id} description`,
    collect: async (signal?: AbortSignal) => {
      let timer: ReturnType<typeof setTimeout>;
      const wait = new Promise<void>((resolve, reject) => {
        if (shouldHang) {
          // Wait forever
        } else {
          timer = setTimeout(resolve, delayMs);
        }
        if (signal) {
          const onAbort = () => {
            clearTimeout(timer);
            reject(new Error("Aborted by signal"));
          };
          if (signal.aborted) onAbort();
          else signal.addEventListener("abort", onAbort);
        }
      });
      await wait;
      if (shouldThrow) {
        throw new Error(`Error in ${id}`);
      }
      return {
        collectorId: id,
        status: "completed",
        durationMs: delayMs,
        timestamp: Date.now(),
        data: dataOverride || { foo: "bar" },
        hash: `hash-${id}-${JSON.stringify(dataOverride || {})}`,
        signals: [signalOverride || { key: `${id}.signal`, value: "bar", label: "Foo" }],
      } as CollectorResult;
    },
    getMetadata: () =>
      ({
        id,
        name: `Mock ${id}`,
        category: "browser-state",
        description: "A mock collector",
        privacyImplication: "None",
        usedBy: [],
        stabilityWeight: 1,
        estimatedDurationMs: delayMs,
        requiresInteraction: false,
        browsers: { chrome: true, firefox: true, safari: true, edge: true },
      }) as CollectorMetadata,
  };
}

describe("Pipeline Integration", () => {
  let store: Record<string, string> = {};

  const localStorageMock = {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };

  beforeAll(() => {
    if (typeof window === "undefined") {
      (globalThis as Record<string, unknown>).window = {
        indexedDB: (globalThis as Record<string, unknown>).indexedDB,
      };
    }
  });

  afterAll(() => {
    delete (globalThis as Record<string, unknown>).window;
  });

  beforeEach(async () => {
    store = {};
    vi.stubGlobal("localStorage", localStorageMock);
    vi.clearAllMocks();
    (registry as unknown as { collectors: Map<string, unknown> }).collectors.clear();
    
    // Clear the fake-indexeddb
    await new Promise<void>((resolve, reject) => {
      const db = (globalThis as Record<string, unknown>).indexedDB as IDBFactory | undefined;
      if (db) {
        const req = db.deleteDatabase("bf_db");
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } else {
        resolve();
      }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("First Visit Pipeline", async () => {
    registry.register(createMockCollector("mock-screen", CollectorPriority.P1_FAST, 10, false, false, { resolution: "1920x1080" }, { key: "screen.resolution", value: "1920x1080", label: "Screen" }), CollectorPriority.P1_FAST);
    registry.register(createMockCollector("mock-canvas", CollectorPriority.P1_FAST, 10, false, false, { hash: "abc123" }, { key: "canvas.hash", value: "abc123", label: "Canvas" }), CollectorPriority.P1_FAST);
    registry.register(createMockCollector("mock-webgl", CollectorPriority.P2_MEDIUM, 50, false, false, { renderer: "NVIDIA GeForce RTX 4090" }, { key: "webgl.renderer", value: "NVIDIA GeForce RTX 4090", label: "WebGL" }), CollectorPriority.P2_MEDIUM);
    registry.register(createMockCollector("mock-timeout", CollectorPriority.P2_MEDIUM, 1000, false, true), CollectorPriority.P2_MEDIUM);
    registry.register(createMockCollector("mock-error", CollectorPriority.P3_SLOW, 10, true, false), CollectorPriority.P3_SLOW);

    const orchestrator = new Orchestrator({ concurrencyLimit: 2, collectorTimeoutMs: 100 });
    const snapshot = await orchestrator.run();
    
    expect(snapshot.results.size).toBe(5);
    expect(snapshot.results.get("mock-screen")?.status).toBe("completed");
    expect(snapshot.results.get("mock-canvas")?.status).toBe("completed");
    expect(snapshot.results.get("mock-webgl")?.status).toBe("completed");
    expect(snapshot.results.get("mock-timeout")?.status).toBe("timeout");
    expect(snapshot.results.get("mock-error")?.status).toBe("error");
    expect(snapshot.compositeHash).toMatch(/^[a-f0-9]{64}$/);

    const scorer = new ScoreEngine([]);
    const moduleResults = new Map();
    for (const [id, result] of snapshot.results.entries()) {
      moduleResults.set(id, {
        collectorId: id,
        collectorName: `Mock ${id}`,
        category: "browser-state",
        signals: result.status === "completed" ? result.signals : [],
        status: result.status
      });
    }
    const report = scorer.computeReport(moduleResults, 5);
    expect(report.totalEntropyBits).toBeGreaterThan(0);
    
    const matcher = new Matcher();
    const currentHashes = new Map(
      Array.from(snapshot.results.entries())
        .filter((entry): entry is [string, CollectorResultSuccess] => entry[1].status === "completed")
        .map(([id, r]) => [id, r.hash])
    );
    const recognition = await matcher.compare(
      snapshot.results,
      currentHashes,
      snapshot.compositeHash,
      null,
      registry.getAllSorted().map(c => c.getMetadata())
    );
    expect(recognition.isFirstVisit).toBe(true);
  });

  test("Return Visit Pipeline (Cross-Session)", async () => {
    registry.register(createMockCollector("mock-screen", CollectorPriority.P1_FAST, 10, false, false, { resolution: "1920x1080" }, { key: "screen.resolution", value: "1920x1080", label: "Screen" }), CollectorPriority.P1_FAST);
    registry.register(createMockCollector("mock-canvas", CollectorPriority.P1_FAST, 10, false, false, { hash: "abc123" }, { key: "canvas.hash", value: "abc123", label: "Canvas" }), CollectorPriority.P1_FAST);
    registry.register(createMockCollector("mock-webgl", CollectorPriority.P2_MEDIUM, 50, false, false, { renderer: "NVIDIA GeForce RTX 4090" }, { key: "webgl.renderer", value: "NVIDIA GeForce RTX 4090", label: "WebGL" }), CollectorPriority.P2_MEDIUM);
    registry.register(createMockCollector("mock-timeout", CollectorPriority.P2_MEDIUM, 1000, false, true), CollectorPriority.P2_MEDIUM);
    registry.register(createMockCollector("mock-error", CollectorPriority.P3_SLOW, 10, true, false), CollectorPriority.P3_SLOW);

    const orchestrator = new Orchestrator({ concurrencyLimit: 2, collectorTimeoutMs: 100 });
    const snapshot = await orchestrator.run();

    const store = createPersistenceStore();
    await store.save({
      snapshot: snapshotToSerialized(snapshot),
      firstSeenTimestamp: Date.now() - 1000,
      lastSeenTimestamp: Date.now() - 1000,
      visitCount: 1,
      version: 1
    });

    const orchestrator2 = new Orchestrator({ concurrencyLimit: 2, collectorTimeoutMs: 100 });
    const snapshot2 = await orchestrator2.run();

    const rawPrior = await store.load();
    expect(rawPrior).not.toBeNull();
    
    // We must deserialize before passing to compare, or compare must be modified, 
    // but compare just expects PersistedFingerprint which has a SerializedSnapshot and it accesses results directly using `prior.snapshot.results[id]`.
    // Let's verify what `compare` takes. It takes `prior: PersistedFingerprint | null`.
    const prior = rawPrior;

    const matcher = new Matcher();
    const currentHashes = new Map(
      Array.from(snapshot2.results.entries())
        .filter((entry): entry is [string, CollectorResultSuccess] => entry[1].status === "completed")
        .map(([id, r]) => [id, r.hash])
    );
    
    const recognition = await matcher.compare(
      snapshot2.results,
      currentHashes,
      snapshot2.compositeHash,
      prior,
      registry.getAllSorted().map(c => c.getMetadata())
    );

    expect(recognition.recognized).toBe(true);
    expect(recognition.daysSinceLastVisit).toBe(0);
    expect(recognition.matchedAttributes.length).toBe(5);
    expect(recognition.changedAttributes.length).toBe(0);
  });

  test("Changed Fingerprint", async () => {
    registry.register(createMockCollector("mock-screen", CollectorPriority.P1_FAST, 10, false, false, { resolution: "1920x1080" }, { key: "screen.resolution", value: "1920x1080", label: "Screen" }), CollectorPriority.P1_FAST);
    
    const orchestrator = new Orchestrator({ concurrencyLimit: 2 });
    const snapshot1 = await orchestrator.run();
    
    const store = createPersistenceStore();
    await store.save({
      snapshot: snapshotToSerialized(snapshot1),
      firstSeenTimestamp: Date.now(),
      lastSeenTimestamp: Date.now(),
      visitCount: 1,
      version: 1
    });

    (registry as unknown as { collectors: Map<string, unknown> }).collectors.clear();
    registry.register(createMockCollector("mock-screen", CollectorPriority.P1_FAST, 10, false, false, { resolution: "2560x1440" }, { key: "screen.resolution", value: "2560x1440", label: "Screen" }), CollectorPriority.P1_FAST);
    
    const orchestrator2 = new Orchestrator({ concurrencyLimit: 2 });
    const snapshot2 = await orchestrator2.run();
    
    const prior = await store.load();
    const matcher = new Matcher();
    const currentHashes = new Map(
      Array.from(snapshot2.results.entries())
        .filter((entry): entry is [string, CollectorResultSuccess] => entry[1].status === "completed")
        .map(([id, r]) => [id, r.hash])
    );
    const recognition = await matcher.compare(
      snapshot2.results,
      currentHashes,
      snapshot2.compositeHash,
      prior,
      registry.getAllSorted().map(c => c.getMetadata())
    );

    expect(recognition.changedAttributes.length).toBe(1);
    expect(recognition.changedAttributes[0].key).toBe("mock-screen");
    expect(recognition.matchedAttributes.length).toBe(0);
  });

  test("Progressive Events", async () => {
    registry.register(createMockCollector("mock-10", CollectorPriority.P1_FAST, 10), CollectorPriority.P1_FAST);
    registry.register(createMockCollector("mock-50", CollectorPriority.P1_FAST, 50), CollectorPriority.P1_FAST);
    registry.register(createMockCollector("mock-100", CollectorPriority.P1_FAST, 100), CollectorPriority.P1_FAST);
    registry.register(createMockCollector("mock-200", CollectorPriority.P1_FAST, 200), CollectorPriority.P1_FAST);

    const orchestrator = new Orchestrator({ concurrencyLimit: 4 });
    const events: { collectorId: string; result?: CollectorResult }[] = [];
    
    orchestrator.on("collector:complete", (e) => events.push(e));
    await orchestrator.run();

    expect(events.length).toBe(4);
    expect(events[0].collectorId).toBe("mock-10");
    expect(events[1].collectorId).toBe("mock-50");
    expect(events[2].collectorId).toBe("mock-100");
    expect(events[3].collectorId).toBe("mock-200");
  });

  test("Persistence Round-Trip", async () => {
    const store = createPersistenceStore();
    const map = new Map<string, CollectorResult>();
    map.set("test-col", { 
      collectorId: "test-col", 
      status: "completed", 
      durationMs: 10, 
      timestamp: 1000, 
      hash: "123", 
      data: { a: 1 }, 
      signals: [{ key: "a", value: 1, label: "A" }] 
    } as CollectorResult);
    
    const snapshot: FingerprintSnapshot = {
      id: "id-1",
      timestamp: 1000,
      userAgent: "ua",
      compositeHash: "hash-1",
      signals: [{ key: "a", value: 1, label: "A" }],
      results: map
    };

    const saved: PersistedFingerprint = {
      snapshot: snapshotToSerialized(snapshot),
      firstSeenTimestamp: 1000,
      lastSeenTimestamp: 1000,
      visitCount: 5,
      version: 1
    };

    await store.save(saved);
    const loaded = await store.load();

    expect(loaded).not.toBeNull();
    // Test the Map -> Record -> Map conversion
    const restoredSnapshot = serializedToSnapshot(loaded!.snapshot);
    expect(restoredSnapshot.results instanceof Map).toBe(true);
    expect((restoredSnapshot.results.get("test-col") as CollectorResultSuccess | undefined)?.hash).toBe("123");
    expect(loaded!.visitCount).toBe(5);
  });
});
