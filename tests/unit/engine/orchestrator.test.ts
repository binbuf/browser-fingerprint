import { expect, test, describe, beforeEach, vi } from "vitest";
import { Orchestrator } from "../../../src/engine/orchestrator";
import { registry, CollectorPriority } from "../../../src/collectors/registry";
import type {
  Collector,
  CollectorResult,
  CollectorMetadata,
} from "../../../src/collectors/types";

function createMockCollector(
  id: string,
  delayMs: number = 10,
  shouldThrow: boolean = false,
  shouldHang: boolean = false
): Collector {
  return {
    id,
    name: `Mock ${id}`,
    category: "browser-state",
    description: "A mock collector",
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
        data: { foo: "bar" },
        hash: `hash-${id}`,
        signals: [{ key: `${id}.foo`, value: "bar", label: "Foo" }],
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

describe("Orchestrator", () => {
  beforeEach(() => {
    (registry as unknown as { collectors: Map<string, unknown> }).collectors.clear();
  });

  test("Happy path: executes all collectors and builds snapshot", async () => {
    registry.register(createMockCollector("c1", 10), CollectorPriority.P1_FAST);
    registry.register(createMockCollector("c2", 10), CollectorPriority.P1_FAST);
    registry.register(createMockCollector("c3", 10), CollectorPriority.P1_FAST);
    registry.register(createMockCollector("c4", 10), CollectorPriority.P1_FAST);
    registry.register(createMockCollector("c5", 10), CollectorPriority.P1_FAST);

    const orchestrator = new Orchestrator();
    const snapshot = await orchestrator.run();

    expect(snapshot.results.size).toBe(5);
    expect(snapshot.results.has("c1")).toBe(true);
    expect(snapshot.results.has("c5")).toBe(true);
    expect(snapshot.signals.length).toBe(5);
    expect(snapshot.compositeHash).toBeTypeOf("string");
  });

  test("Progressive emission: fires events", async () => {
    registry.register(createMockCollector("c1", 10), CollectorPriority.P1_FAST);
    registry.register(createMockCollector("c2", 20), CollectorPriority.P1_FAST);

    const orchestrator = new Orchestrator();
    const onStart = vi.fn();
    const onComplete = vi.fn();
    const onProgress = vi.fn();

    orchestrator.on("collector:start", onStart);
    orchestrator.on("collector:complete", onComplete);
    orchestrator.on("progress", onProgress);

    await orchestrator.run();

    expect(onStart).toHaveBeenCalledTimes(2);
    expect(onComplete).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenLastCalledWith(
      expect.objectContaining({
        completed: 2,
        total: 2,
        percentage: 100,
      })
    );
  });

  test("Timeout handling: collector times out but others complete", async () => {
    registry.register(createMockCollector("c1", 10), CollectorPriority.P1_FAST);
    registry.register(
      createMockCollector("c2", 100, false, true),
      CollectorPriority.P1_FAST
    ); // hangs
    registry.register(createMockCollector("c3", 10), CollectorPriority.P1_FAST);

    const orchestrator = new Orchestrator({ collectorTimeoutMs: 50 });
    const snapshot = await orchestrator.run();

    expect(snapshot.results.size).toBe(3);
    expect(snapshot.results.get("c1")?.status).toBe("completed");
    expect(snapshot.results.get("c2")?.status).toBe("timeout");
    expect(snapshot.results.get("c3")?.status).toBe("completed");
  });

  test("Error handling: collector throws but others complete", async () => {
    registry.register(createMockCollector("c1", 10), CollectorPriority.P1_FAST);
    registry.register(
      createMockCollector("c2", 10, true),
      CollectorPriority.P1_FAST
    ); // throws
    registry.register(createMockCollector("c3", 10), CollectorPriority.P1_FAST);

    const orchestrator = new Orchestrator();
    const snapshot = await orchestrator.run();

    expect(snapshot.results.size).toBe(3);
    expect(snapshot.results.get("c1")?.status).toBe("completed");
    expect(snapshot.results.get("c2")?.status).toBe("error");
    expect((snapshot.results.get("c2") as { error?: string }).error).toContain(
      "Error in c2"
    );
    expect(snapshot.results.get("c3")?.status).toBe("completed");
  });

  test("Priority ordering: P0 starts before P3", async () => {
    registry.register(createMockCollector("c3", 10), CollectorPriority.P3_SLOW);
    registry.register(
      createMockCollector("c0", 10),
      CollectorPriority.P0_INSTANT
    );
    registry.register(createMockCollector("c1", 10), CollectorPriority.P1_FAST);

    const orchestrator = new Orchestrator({ concurrencyLimit: 1 });
    const startOrder: string[] = [];
    orchestrator.on("collector:start", ({ collectorId }) =>
      startOrder.push(collectorId)
    );

    await orchestrator.run();

    expect(startOrder).toEqual(["c0", "c1", "c3"]);
  });

  test("Concurrency limit: respects the limit", async () => {
    registry.register(createMockCollector("c1", 20), CollectorPriority.P1_FAST);
    registry.register(createMockCollector("c2", 20), CollectorPriority.P1_FAST);
    registry.register(createMockCollector("c3", 20), CollectorPriority.P1_FAST);
    registry.register(createMockCollector("c4", 20), CollectorPriority.P1_FAST);

    const orchestrator = new Orchestrator({ concurrencyLimit: 2 });
    let concurrent = 0;
    let maxConcurrent = 0;

    orchestrator.on("collector:start", () => {
      concurrent++;
      if (concurrent > maxConcurrent) maxConcurrent = concurrent;
    });
    orchestrator.on("collector:complete", () => {
      concurrent--;
    });

    await orchestrator.run();

    expect(maxConcurrent).toBeLessThanOrEqual(2);
    expect(maxConcurrent).toBe(2);
  });

  test("Abort: cancels pending collectors", async () => {
    registry.register(
      createMockCollector("c1", 100),
      CollectorPriority.P1_FAST
    );
    registry.register(
      createMockCollector("c2", 100),
      CollectorPriority.P1_FAST
    );

    const orchestrator = new Orchestrator();

    // Start the run, but don't await yet
    const runPromise = orchestrator.run();

    // Wait a tiny bit for it to start
    await new Promise((r) => setTimeout(r, 10));

    orchestrator.abort();

    const snapshot = await runPromise;
    expect(snapshot.results.size).toBe(2);
    // They should be in error state due to abort
    expect(snapshot.results.get("c1")?.status).toBe("error");
    expect(snapshot.results.get("c2")?.status).toBe("error");
  });
});
