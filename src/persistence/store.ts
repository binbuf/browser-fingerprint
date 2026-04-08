import type { FingerprintSnapshot } from "../engine/types";
import type { PersistedFingerprint, SerializedSnapshot } from "./types";
import { localStorageAdapter } from "./local-storage";
import { indexedDBAdapter } from "./indexed-db";
import type { CollectorResult } from "../collectors/types";

export interface PersistenceStore {
  save(data: PersistedFingerprint): Promise<void>;
  load(): Promise<PersistedFingerprint | null>;
  clear(): Promise<void>;
}

export function snapshotToSerialized(
  snapshot: FingerprintSnapshot
): SerializedSnapshot {
  const resultsRecord: Record<string, CollectorResult> = {};
  for (const [key, value] of snapshot.results.entries()) {
    resultsRecord[key] = value;
  }
  return {
    ...snapshot,
    results: resultsRecord,
  };
}

export function serializedToSnapshot(
  serialized: SerializedSnapshot
): FingerprintSnapshot {
  const resultsMap = new Map<string, CollectorResult>();
  for (const [key, value] of Object.entries(serialized.results)) {
    resultsMap.set(key, value);
  }
  return {
    ...serialized,
    results: resultsMap,
  };
}

export function createPersistenceStore(): PersistenceStore {
  return {
    async save(data: PersistedFingerprint): Promise<void> {
      // 1. Write to localStorage (primary)
      const localSuccess = await localStorageAdapter.save(data);
      if (!localSuccess) {
        console.warn("PersistenceStore: Failed to save to localStorage");
      }

      // 2. Write to IndexedDB (redundant backup)
      const idbSuccess = await indexedDBAdapter.save(data);
      if (!idbSuccess) {
        console.warn("PersistenceStore: Failed to save to IndexedDB");
      }
      
      // 3. If localStorage fails, still succeed if IndexedDB works (by not throwing)
      // If both fail, we might want to know, but we shouldn't throw to not crash the app
    },

    async load(): Promise<PersistedFingerprint | null> {
      // 1. Try localStorage first
      const localData = await localStorageAdapter.load();
      if (localData) {
        return localData;
      }

      // 2. If not found, try IndexedDB
      const idbData = await indexedDBAdapter.load();
      if (idbData) {
        // 3. If found in IndexedDB but not localStorage, restore to localStorage
        const localSuccess = await localStorageAdapter.save(idbData);
        if (!localSuccess) {
           console.warn("PersistenceStore: Failed to restore to localStorage from IndexedDB");
        }
        return idbData;
      }

      // 4. Return null if both miss
      return null;
    },

    async clear(): Promise<void> {
      await Promise.all([
        localStorageAdapter.clear(),
        indexedDBAdapter.clear(),
      ]);
    },
  };
}
