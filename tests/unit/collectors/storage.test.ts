import { describe, it, expect, vi, beforeEach } from "vitest";
import { StorageCollector } from "../../../src/collectors/storage";

describe("StorageCollector", () => {
  let collector: StorageCollector;

  beforeEach(() => {
    collector = new StorageCollector();
    
    // Mock localStorage
    const storageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
      };
    })();

    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      navigator: {
        cookieEnabled: true,
      },
      localStorage: storageMock,
      indexedDB: {}
    });
    
    // Also stub navigator directly because it's used directly in storage.ts
    vi.stubGlobal("navigator", {
      cookieEnabled: true
    });
    vi.stubGlobal("localStorage", storageMock);
  });

  it("should collect storage information correctly", async () => {
    const mockStorage = {
      estimate: vi.fn().mockResolvedValue({
        quota: 10 * 1024 * 1024 * 1024, // 10 GB
        usage: 1024 * 1024, // 1 MB
      }),
    };

    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      navigator: {
        cookieEnabled: true,
        storage: mockStorage,
      },
      localStorage: window.localStorage,
      indexedDB: {}
    });
    
    vi.stubGlobal("navigator", {
      cookieEnabled: true,
      storage: mockStorage,
    });

    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.collectorId).toBe("storage");
    expect(result.data.cookieEnabled).toBe(true);
    expect(result.data.localStorageAvailable).toBe(true);
    expect(result.data.indexedDBAvailable).toBe(true);
    expect(result.data.storageQuota).toBe(10 * 1024 * 1024 * 1024);

    const quotaSignal = result.signals.find((s) => s.key === "storage.quota");
    expect(quotaSignal?.value).toBe(10); // Bucket to GB

    const cookieSignal = result.signals.find((s) => s.key === "storage.cookies");
    expect(cookieSignal?.value).toBe(true);
  });

  it("should handle missing storage estimate API", async () => {
    vi.stubGlobal("window", {
      performance: { now: () => Date.now() },
      navigator: {
        cookieEnabled: false,
      },
      localStorage: window.localStorage,
      indexedDB: {}
    });
    
    vi.stubGlobal("navigator", {
      cookieEnabled: false,
    });

    const result = await collector.collect();

    if (result.status !== "completed") {
      throw new Error(`Expected completed status, got ${result.status}`);
    }

    expect(result.data.storageQuota).toBe(0);
    expect(result.data.cookieEnabled).toBe(false);
    
    const quotaSignal = result.signals.find((s) => s.key === "storage.quota");
    expect(quotaSignal?.value).toBe(0);
  });
});
