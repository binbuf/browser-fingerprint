import type { PersistedFingerprint } from "./types";

const STORAGE_KEY = "bf_fingerprint";

export const localStorageAdapter = {
  async save(data: PersistedFingerprint): Promise<boolean> {
    try {
      const json = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, json);
      return true;
    } catch (e) {
      console.warn("localStorage save failed (quota or disabled)", e);
      return false;
    }
  },

  async load(): Promise<PersistedFingerprint | null> {
    try {
      const json = localStorage.getItem(STORAGE_KEY);
      if (!json) {
        return null;
      }
      return JSON.parse(json) as PersistedFingerprint;
    } catch (e) {
      // Handle corrupted data gracefully
      console.warn("localStorage load failed (corrupted data), discarding", e);
      return null;
    }
  },

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("localStorage clear failed", e);
    }
  },

  isAvailable(): boolean {
    try {
      const testKey = "__bf_test_storage__";
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },
};
