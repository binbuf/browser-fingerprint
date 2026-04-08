import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Matcher } from "../../../src/engine/matcher";
import type { CollectorResult, CollectorMetadata } from "../../../src/collectors/types";
import type { PersistedFingerprint } from "../../../src/persistence/types";

describe("Matcher", () => {
  const matcher = new Matcher();

  const metadata: CollectorMetadata[] = [
    { id: "canvas", name: "Canvas", stabilityWeight: 1.0, category: "gpu-rendering", description: "", privacyImplication: "", usedBy: [], estimatedDurationMs: 10, requiresInteraction: false, browsers: { chrome: true, firefox: true, safari: true, edge: true } },
    { id: "screen", name: "Screen", stabilityWeight: 0.6, category: "gpu-rendering", description: "", privacyImplication: "", usedBy: [], estimatedDurationMs: 10, requiresInteraction: false, browsers: { chrome: true, firefox: true, safari: true, edge: true } },
    { id: "network", name: "Network", stabilityWeight: 0.3, category: "gpu-rendering", description: "", privacyImplication: "", usedBy: [], estimatedDurationMs: 10, requiresInteraction: false, browsers: { chrome: true, firefox: true, safari: true, edge: true } },
    { id: "hints", name: "Hints", stabilityWeight: 0.0, category: "gpu-rendering", description: "", privacyImplication: "", usedBy: [], estimatedDurationMs: 10, requiresInteraction: false, browsers: { chrome: true, firefox: true, safari: true, edge: true } },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("handles first visit", async () => {
    const result = await matcher.compare(
      new Map(),
      new Map(),
      "hash",
      null,
      metadata
    );

    expect(result.isFirstVisit).toBe(true);
    expect(result.recognized).toBe(false);
    expect(result.similarity).toBe(0);
  });

  it("handles perfect match", async () => {
    const currentResults = new Map<string, CollectorResult>([
      ["canvas", { status: "completed", hash: "hash1" } as unknown as CollectorResult],
      ["screen", { status: "completed", hash: "hash2" } as unknown as CollectorResult],
    ]);
    const currentHashes = new Map([
      ["canvas", "hash1"],
      ["screen", "hash2"],
    ]);

    const prior: PersistedFingerprint = {
      version: 1,
      snapshot: {
        id: "1",
        timestamp: 1,
        userAgent: "",
        results: {
          canvas: { status: "completed", hash: "hash1" } as unknown as CollectorResult,
          screen: { status: "completed", hash: "hash2" } as unknown as CollectorResult,
        },
        compositeHash: "priorHash",
        signals: []
      },
      firstSeenTimestamp: 1,
      lastSeenTimestamp: 1,
      visitCount: 1
    };

    const result = await matcher.compare(currentResults, currentHashes, "newHash", prior, metadata);

    expect(result.isFirstVisit).toBe(false);
    expect(result.recognized).toBe(true);
    expect(result.similarity).toBe(1.0);
    expect(result.matchedAttributes.length).toBe(2);
    expect(result.changedAttributes.length).toBe(0);
  });

  it("handles no match", async () => {
    const currentResults = new Map<string, CollectorResult>([
      ["canvas", { status: "completed", hash: "hash1-new" } as unknown as CollectorResult],
      ["screen", { status: "completed", hash: "hash2-new" } as unknown as CollectorResult],
    ]);
    const currentHashes = new Map([
      ["canvas", "hash1-new"],
      ["screen", "hash2-new"],
    ]);

    const prior: PersistedFingerprint = {
      version: 1,
      snapshot: {
        id: "1",
        timestamp: 1,
        userAgent: "",
        results: {
          canvas: { status: "completed", hash: "hash1" } as unknown as CollectorResult,
          screen: { status: "completed", hash: "hash2" } as unknown as CollectorResult,
        },
        compositeHash: "priorHash",
        signals: []
      },
      firstSeenTimestamp: 1,
      lastSeenTimestamp: 1,
      visitCount: 1
    };

    const result = await matcher.compare(currentResults, currentHashes, "newHash", prior, metadata);

    expect(result.isFirstVisit).toBe(false);
    expect(result.recognized).toBe(false);
    expect(result.similarity).toBe(0);
    expect(result.matchedAttributes.length).toBe(0);
    expect(result.changedAttributes.length).toBe(2);
  });

  it("handles partial match above threshold (weighted correctly)", async () => {
    const currentResults = new Map<string, CollectorResult>([
      ["canvas", { status: "completed", hash: "hash1" } as unknown as CollectorResult], // Matched (weight 1.0)
      ["screen", { status: "completed", hash: "hash2" } as unknown as CollectorResult], // Matched (weight 0.6)
      ["network", { status: "completed", hash: "hash3-diff" } as unknown as CollectorResult], // Changed (weight 0.3)
    ]);
    const currentHashes = new Map([
      ["canvas", "hash1"],
      ["screen", "hash2"],
      ["network", "hash3-diff"],
    ]);

    const prior: PersistedFingerprint = {
      version: 1,
      snapshot: {
        id: "1",
        timestamp: 1,
        userAgent: "",
        results: {
          canvas: { status: "completed", hash: "hash1" } as unknown as CollectorResult,
          screen: { status: "completed", hash: "hash2" } as unknown as CollectorResult,
          network: { status: "completed", hash: "hash3" } as unknown as CollectorResult,
        },
        compositeHash: "priorHash",
        signals: []
      },
      firstSeenTimestamp: 1,
      lastSeenTimestamp: 1,
      visitCount: 1
    };

    const result = await matcher.compare(currentResults, currentHashes, "newHash", prior, metadata);

    // Total weight = 1.0 + 0.6 + 0.3 = 1.9
    // Matched weight = 1.0 + 0.6 = 1.6
    // Similarity = 1.6 / 1.9 = 0.842
    expect(result.similarity).toBeCloseTo(1.6 / 1.9);
    expect(result.recognized).toBe(true);
  });

  it("handles partial match below threshold", async () => {
    const currentResults = new Map<string, CollectorResult>([
      ["canvas", { status: "completed", hash: "hash1-diff" } as unknown as CollectorResult], // Changed (weight 1.0)
      ["screen", { status: "completed", hash: "hash2" } as unknown as CollectorResult], // Matched (weight 0.6)
    ]);
    const currentHashes = new Map([
      ["canvas", "hash1-diff"],
      ["screen", "hash2"],
    ]);

    const prior: PersistedFingerprint = {
      version: 1,
      snapshot: {
        id: "1",
        timestamp: 1,
        userAgent: "",
        results: {
          canvas: { status: "completed", hash: "hash1" } as unknown as CollectorResult,
          screen: { status: "completed", hash: "hash2" } as unknown as CollectorResult,
        },
        compositeHash: "priorHash",
        signals: []
      },
      firstSeenTimestamp: 1,
      lastSeenTimestamp: 1,
      visitCount: 1
    };

    const result = await matcher.compare(currentResults, currentHashes, "newHash", prior, metadata);

    // Total weight = 1.0 + 0.6 = 1.6
    // Matched weight = 0.6
    // Similarity = 0.6 / 1.6 = 0.375
    expect(result.similarity).toBeCloseTo(0.375);
    expect(result.recognized).toBe(false);
  });

  it("handles boundary exact threshold", async () => {
    const customMetadata: CollectorMetadata[] = [
      { id: "c1", name: "C1", stabilityWeight: 0.75, category: "gpu-rendering", description: "", privacyImplication: "", usedBy: [], estimatedDurationMs: 10, requiresInteraction: false, browsers: { chrome: true, firefox: true, safari: true, edge: true } },
      { id: "c2", name: "C2", stabilityWeight: 0.25, category: "gpu-rendering", description: "", privacyImplication: "", usedBy: [], estimatedDurationMs: 10, requiresInteraction: false, browsers: { chrome: true, firefox: true, safari: true, edge: true } },
    ];

    const currentResultsCustom = new Map<string, CollectorResult>([
      ["c1", { status: "completed", hash: "hash1" } as unknown as CollectorResult],
      ["c2", { status: "completed", hash: "hash2-diff" } as unknown as CollectorResult],
    ]);
    const currentHashesCustom = new Map([
      ["c1", "hash1"],
      ["c2", "hash2-diff"],
    ]);

    const prior: PersistedFingerprint = {
      version: 1,
      snapshot: {
        id: "1",
        timestamp: 1,
        userAgent: "",
        results: {
          c1: { status: "completed", hash: "hash1" } as unknown as CollectorResult,
          c2: { status: "completed", hash: "hash2" } as unknown as CollectorResult,
        },
        compositeHash: "priorHash",
        signals: []
      },
      firstSeenTimestamp: 1,
      lastSeenTimestamp: 1,
      visitCount: 1
    };

    const result = await matcher.compare(currentResultsCustom, currentHashesCustom, "newHash", prior, customMetadata);

    expect(result.similarity).toBe(0.75);
    expect(result.recognized).toBe(true);
  });
  
  it("calculates days elapsed correctly", async () => {
    vi.setSystemTime(new Date(1000 * 60 * 60 * 24 * 3)); // 3 days since epoch
    
    const prior: PersistedFingerprint = {
      version: 1,
      snapshot: {
        id: "1",
        timestamp: 0,
        userAgent: "",
        results: {},
        compositeHash: "priorHash",
        signals: []
      },
      firstSeenTimestamp: 0,
      lastSeenTimestamp: 0, // Epoch
      visitCount: 1
    };
    
    const result = await matcher.compare(new Map(), new Map(), "newHash", prior, []);
    
    expect(result.daysSinceLastVisit).toBe(3);
  });
  
  it("supports custom threshold", async () => {
    const customMetadata: CollectorMetadata[] = [
      { id: "c1", name: "C1", stabilityWeight: 0.5, category: "gpu-rendering", description: "", privacyImplication: "", usedBy: [], estimatedDurationMs: 10, requiresInteraction: false, browsers: { chrome: true, firefox: true, safari: true, edge: true } },
      { id: "c2", name: "C2", stabilityWeight: 0.5, category: "gpu-rendering", description: "", privacyImplication: "", usedBy: [], estimatedDurationMs: 10, requiresInteraction: false, browsers: { chrome: true, firefox: true, safari: true, edge: true } },
    ];

    const currentResultsCustom = new Map<string, CollectorResult>([
      ["c1", { status: "completed", hash: "hash1" } as unknown as CollectorResult],
      ["c2", { status: "completed", hash: "hash2-diff" } as unknown as CollectorResult],
    ]);
    const currentHashesCustom = new Map([
      ["c1", "hash1"],
      ["c2", "hash2-diff"],
    ]);

    const prior: PersistedFingerprint = {
      version: 1,
      snapshot: {
        id: "1",
        timestamp: 1,
        userAgent: "",
        results: {
          c1: { status: "completed", hash: "hash1" } as unknown as CollectorResult,
          c2: { status: "completed", hash: "hash2" } as unknown as CollectorResult,
        },
        compositeHash: "priorHash",
        signals: []
      },
      firstSeenTimestamp: 1,
      lastSeenTimestamp: 1,
      visitCount: 1
    };

    // With 0.5 similarity, a threshold of 0.5 should recognize
    const result = await matcher.compare(currentResultsCustom, currentHashesCustom, "newHash", prior, customMetadata, 0.5);

    expect(result.similarity).toBe(0.5);
    expect(result.recognized).toBe(true);
    
    // Default threshold is 0.75, so it shouldn't recognize with default
    const resultDefault = await matcher.compare(currentResultsCustom, currentHashesCustom, "newHash", prior, customMetadata);
    expect(resultDefault.recognized).toBe(false);
  });
});
