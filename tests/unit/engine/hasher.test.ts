import { describe, it, expect } from "vitest";
import { Hasher } from "../../../src/engine/hasher";
import type { CollectorResult } from "../../../src/collectors/types";

describe("Hasher", () => {
  const hasher = new Hasher();

  const successResult1: CollectorResult = {
    collectorId: "canvas",
    status: "completed",
    durationMs: 10,
    timestamp: 123,
    data: { foo: "bar" },
    hash: "will-be-ignored",
    signals: [],
  };

  const successResult2: CollectorResult = {
    collectorId: "audio",
    status: "completed",
    durationMs: 10,
    timestamp: 123,
    data: { baz: "qux" },
    hash: "will-be-ignored",
    signals: [],
  };

  const errorResult: CollectorResult = {
    collectorId: "webgl",
    status: "error",
    durationMs: 10,
    timestamp: 123,
    error: "Failed",
  };

  it("should compute per-module hashes for successful results only", async () => {
    const results = new Map<string, CollectorResult>([
      ["canvas", successResult1],
      ["audio", successResult2],
      ["webgl", errorResult],
    ]);

    const hashes = await hasher.computePerModuleHashes(results);
    expect(hashes.size).toBe(2);
    expect(hashes.has("canvas")).toBe(true);
    expect(hashes.has("audio")).toBe(true);
    expect(hashes.has("webgl")).toBe(false);
  });

  it("should compute deterministic composite hash with alphabetical ordering", async () => {
    const results1 = new Map<string, CollectorResult>([
      ["canvas", successResult1],
      ["audio", successResult2],
    ]);

    const results2 = new Map<string, CollectorResult>([
      ["audio", successResult2],
      ["canvas", successResult1],
    ]);

    const hash1 = await hasher.computeCompositeHash(results1);
    const hash2 = await hasher.computeCompositeHash(results2);

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBeNull();
    expect(typeof hash1).toBe("string");
  });

  it("different inputs should produce different composite hashes", async () => {
    const results1 = new Map<string, CollectorResult>([
      ["canvas", successResult1],
    ]);

    const diffResult = { ...successResult1, data: { foo: "diff" } } as CollectorResult;
    const results2 = new Map<string, CollectorResult>([
      ["canvas", diffResult],
    ]);

    const hash1 = await hasher.computeCompositeHash(results1);
    const hash2 = await hasher.computeCompositeHash(results2);

    expect(hash1).not.toBe(hash2);
  });
});
