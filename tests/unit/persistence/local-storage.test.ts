import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { localStorageAdapter } from "../../../src/persistence/local-storage";
import type { PersistedFingerprint } from "../../../src/persistence/types";

const mockData: PersistedFingerprint = {
  version: 1,
  firstSeenTimestamp: 1000,
  lastSeenTimestamp: 2000,
  visitCount: 1,
  snapshot: {
    id: "test-id",
    timestamp: 2000,
    userAgent: "test-agent",
    compositeHash: "abc",
    signals: [],
    results: {},
  },
};

describe("localStorageAdapter", () => {
  let store: Record<string, string> = {};

  const localStorageMock = {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      // Simulate QuotaExceededError
      if (value === "QUOTA_ERROR") {
        throw new Error("QuotaExceededError");
      }
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };

  beforeEach(() => {
    store = {};
    vi.stubGlobal("localStorage", localStorageMock);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should return true when available", () => {
    expect(localStorageAdapter.isAvailable()).toBe(true);
  });

  it("should return false when unavailable", () => {
    vi.stubGlobal("localStorage", {
      setItem: () => {
        throw new Error("Access denied");
      },
    });
    expect(localStorageAdapter.isAvailable()).toBe(false);
  });

  it("should save and load data correctly", async () => {
    const saveResult = await localStorageAdapter.save(mockData);
    expect(saveResult).toBe(true);

    const loadResult = await localStorageAdapter.load();
    expect(loadResult).toEqual(mockData);
  });

  it("should return null when loading empty data", async () => {
    const loadResult = await localStorageAdapter.load();
    expect(loadResult).toBeNull();
  });

  it("should return null and gracefully handle corrupted JSON", async () => {
    store["bf_fingerprint"] = "{ invalid_json: ";
    const loadResult = await localStorageAdapter.load();
    expect(loadResult).toBeNull();
  });

  it("should handle quota errors on save", async () => {
    // Force setItem to throw by using a special value, but we can't easily do it through mockData.
    // Let's redefine setItem just for this test
    vi.stubGlobal("localStorage", {
      ...localStorageMock,
      setItem: () => { throw new Error("QuotaExceededError"); }
    });
    
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const saveResult = await localStorageAdapter.save(mockData);
    
    expect(saveResult).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("localStorage save failed"),
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  it("should clear data correctly", async () => {
    await localStorageAdapter.save(mockData);
    expect(store["bf_fingerprint"]).toBeDefined();

    await localStorageAdapter.clear();
    expect(store["bf_fingerprint"]).toBeUndefined();
  });
});
