import { registry } from "../collectors/registry";
import { pool } from "../utils/pool";
import { withTimeout, TimeoutError } from "../utils/timeout";
import { sha256 } from "../utils/hash";
import type { OrchestratorConfig, FingerprintSnapshot } from "./types";
import type { CollectorResult, SignalEntry } from "../collectors/types";

type OrchestratorEventMap = {
  "collector:start": { collectorId: string };
  "collector:complete": { collectorId: string; result: CollectorResult };
  progress: { completed: number; total: number; percentage: number };
  "scan:complete": { snapshot: FingerprintSnapshot };
};

const DEFAULT_CONFIG: OrchestratorConfig = {
  concurrencyLimit: 6,
  collectorTimeoutMs: 10_000,
  priorityOrder: [],
  excludeNoisy: true,
  excludeInvasive: true,
};

export class Orchestrator {
  private config: OrchestratorConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handlers = new Map<keyof OrchestratorEventMap, Set<(data: any) => void>>();
  private abortController: AbortController | null = null;

  constructor(config?: Partial<OrchestratorConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
    if (!this.config.priorityOrder || this.config.priorityOrder.length === 0) {
      this.config.priorityOrder = registry.getPriorityOrder();
    }
  }

  /**
   * Run the full fingerprint scan pipeline:
   * 1. Load prior fingerprint from persistence (not implemented in this PR)
   * 2. Execute all collectors in priority order via concurrency pool
   * 3. Score results incrementally (not implemented in this PR)
   * 4. Hash composite fingerprint
   * 5. Match against prior fingerprint (if exists) (not implemented in this PR)
   * 6. Save current fingerprint to persistence (not implemented in this PR)
   * 7. Return the complete FingerprintSnapshot
   */
  async run(): Promise<FingerprintSnapshot> {
    this.abortController = new AbortController();
    const orchestratorSignal = this.abortController.signal;

    const collectorsToRun = [];
    const addedIds = new Set<string>();

    const allSorted = registry.getAllSorted();
    const filteredSorted = allSorted.filter((col) => {
      const meta = col.getMetadata();
      if (this.config.excludeNoisy && meta.isNoisy) return false;
      if (this.config.excludeInvasive && meta.isInvasive) return false;
      return true;
    });

    for (const id of this.config.priorityOrder) {
      const col = filteredSorted.find((c) => c.id === id);
      if (col) {
        collectorsToRun.push(col);
        addedIds.add(id);
      }
    }

    for (const col of filteredSorted) {
      if (!addedIds.has(col.id)) {
        collectorsToRun.push(col);
        addedIds.add(col.id);
      }
    }

    const totalCount = collectorsToRun.length;
    let completedCount = 0;

    const tasks = collectorsToRun.map((collector) => {
      return async (): Promise<CollectorResult> => {
        if (orchestratorSignal.aborted) {
          return {
            collectorId: collector.id,
            status: "error",
            durationMs: 0,
            timestamp: Date.now(),
            error: "Aborted",
          };
        }

        this.emit("collector:start", { collectorId: collector.id });
        const taskStartTime = Date.now();

        try {
          const result = await withTimeout(async (timeoutSignal) => {
            const combinedController = new AbortController();
            const abortCombined = () => combinedController.abort();

            if (orchestratorSignal.aborted || timeoutSignal.aborted) {
              combinedController.abort();
            } else {
              orchestratorSignal.addEventListener("abort", abortCombined);
              timeoutSignal.addEventListener("abort", abortCombined);
            }

            try {
              return await collector.collect(combinedController.signal);
            } finally {
              orchestratorSignal.removeEventListener("abort", abortCombined);
              timeoutSignal.removeEventListener("abort", abortCombined);
            }
          }, this.config.collectorTimeoutMs);

          return result;
        } catch (error) {
          const durationMs = Date.now() - taskStartTime;
          if (error instanceof TimeoutError) {
            return {
              collectorId: collector.id,
              status: "timeout",
              durationMs,
              timestamp: Date.now(),
            };
          }

          return {
            collectorId: collector.id,
            status: "error",
            durationMs,
            timestamp: Date.now(),
            error: error instanceof Error ? error.message : String(error),
          };
        }
      };
    });

    const resultsMap = new Map<string, CollectorResult>();

    await pool(tasks, {
      concurrency: this.config.concurrencyLimit,
      onItemComplete: (result) => {
        completedCount++;
        resultsMap.set(result.collectorId, result);
        this.emit("collector:complete", {
          collectorId: result.collectorId,
          result,
        });
        this.emit("progress", {
          completed: completedCount,
          total: totalCount,
          percentage: totalCount === 0 ? 100 : Math.round((completedCount / totalCount) * 100),
        });
      },
    });

    const successfulHashes: string[] = [];
    const allSignals: SignalEntry[] = [];

    // Keys in alphabetical order for composite hash
    const sortedCollectorIds = Array.from(resultsMap.keys()).sort();

    for (const id of sortedCollectorIds) {
      const result = resultsMap.get(id);
      if (result && result.status === "completed") {
        successfulHashes.push(result.hash);
        allSignals.push(...result.signals);
      }
    }

    const compositeHashInput = successfulHashes.join("");
    const compositeHash = await sha256(compositeHashInput);

    const snapshot: FingerprintSnapshot = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      results: resultsMap,
      compositeHash,
      signals: allSignals,
    };

    this.emit("scan:complete", { snapshot });

    return snapshot;
  }

  /** Subscribe to orchestrator events for progressive UI updates */
  on<K extends keyof OrchestratorEventMap>(
    event: K,
    handler: (data: OrchestratorEventMap[K]) => void
  ): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  private emit<K extends keyof OrchestratorEventMap>(
    event: K,
    data: OrchestratorEventMap[K]
  ): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in orchestrator event handler for ${event}:`, error);
        }
      }
    }
  }

  /** Cancel a running scan */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}
