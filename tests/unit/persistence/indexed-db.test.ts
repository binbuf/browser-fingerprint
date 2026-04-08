import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach, vi, afterEach, beforeAll, afterAll } from "vitest";
import { indexedDBAdapter } from "../../../src/persistence/indexed-db";
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

interface MockGlobal {
  window?: {
    indexedDB?: unknown;
  };
  indexedDB?: {
    deleteDatabase: (name: string) => {
      onsuccess: (() => void) | null;
      onerror: (() => void) | null;
      error: unknown;
    };
  };
}

describe("indexedDBAdapter", () => {
  beforeAll(() => {
    // Fake window for the adapter
    if (typeof window === "undefined") {
      (globalThis as unknown as MockGlobal).window = {
        indexedDB: (globalThis as unknown as MockGlobal).indexedDB,
      };
    }
  });

  afterAll(() => {
    delete (globalThis as unknown as MockGlobal).window;
  });

  beforeEach(async () => {
    // Clear the fake-indexeddb before each test
    await new Promise<void>((resolve, reject) => {
      const db = (globalThis as unknown as MockGlobal).indexedDB;
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
    vi.restoreAllMocks();
  });

  it("should return true for availability", () => {
    expect(indexedDBAdapter.isAvailable()).toBe(true);
  });

  it("should return false when indexedDB is undefined", () => {
    const globalMock = globalThis as unknown as MockGlobal;
    const originalIDB = globalMock.window?.indexedDB;
    if (globalMock.window) {
      globalMock.window.indexedDB = undefined;
    }
    
    expect(indexedDBAdapter.isAvailable()).toBe(false);
    
    if (globalMock.window) {
      globalMock.window.indexedDB = originalIDB;
    }
  });

  it("should save and load data correctly", async () => {
    const saveResult = await indexedDBAdapter.save(mockData);
    expect(saveResult).toBe(true);

    const loadResult = await indexedDBAdapter.load();
    expect(loadResult).toEqual(mockData);
  });

  it("should return null when loading non-existent data", async () => {
    const loadResult = await indexedDBAdapter.load();
    expect(loadResult).toBeNull();
  });

  it("should clear data correctly", async () => {
    await indexedDBAdapter.save(mockData);
    let loadResult = await indexedDBAdapter.load();
    expect(loadResult).toEqual(mockData);

    await indexedDBAdapter.clear();
    loadResult = await indexedDBAdapter.load();
    expect(loadResult).toBeNull();
  });

  it("should handle save errors gracefully", async () => {
    const globalMock = globalThis as unknown as MockGlobal;
    const originalIDB = globalMock.window?.indexedDB;
    if (globalMock.window) {
      globalMock.window.indexedDB = {
        open: () => { throw new Error("Mocked IDB Error"); }
      };
    }

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    
    const saveResult = await indexedDBAdapter.save(mockData);
    expect(saveResult).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith("IndexedDB save failed", expect.any(Error));
    
    consoleSpy.mockRestore();
    if (globalMock.window) {
      globalMock.window.indexedDB = originalIDB;
    }
  });
});
