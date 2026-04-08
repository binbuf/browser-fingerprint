import type { PersistedFingerprint } from "./types";

const DB_NAME = "bf_db";
const STORE_NAME = "fingerprints";
const DB_VERSION = 1;
const TIMEOUT_MS = 2000; // Timeouts for IDB operations in private mode

/**
 * Wraps a promise with a timeout
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("IndexedDB operation timed out"));
    }, ms);

    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Open the IndexedDB database, creating schema if needed
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not available"));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const indexedDBAdapter = {
  async save(data: PersistedFingerprint): Promise<boolean> {
    try {
      const db = await withTimeout(openDB(), TIMEOUT_MS);

      const success = await withTimeout(
        new Promise<boolean>((resolve, reject) => {
          try {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            const request = store.put(data, "current");

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);

            // Important: Handle transaction complete
            tx.oncomplete = () => db.close();
            tx.onerror = () => {
              db.close();
              reject(tx.error);
            };
          } catch (e) {
            db.close();
            reject(e);
          }
        }),
        TIMEOUT_MS
      );
      return success;
    } catch (e) {
      console.warn("IndexedDB save failed", e);
      return false;
    }
  },

  async load(): Promise<PersistedFingerprint | null> {
    try {
      const db = await withTimeout(openDB(), TIMEOUT_MS);

      const result = await withTimeout(
        new Promise<PersistedFingerprint | null>((resolve, reject) => {
          try {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.close();
              return resolve(null);
            }

            const tx = db.transaction(STORE_NAME, "readonly");
            const store = tx.objectStore(STORE_NAME);
            const request = store.get("current");

            request.onsuccess = () => {
              resolve(request.result ? (request.result as PersistedFingerprint) : null);
            };
            request.onerror = () => reject(request.error);

            tx.oncomplete = () => db.close();
            tx.onerror = () => {
              db.close();
              reject(tx.error);
            };
          } catch (e) {
            db.close();
            reject(e);
          }
        }),
        TIMEOUT_MS
      );
      return result;
    } catch (e) {
      console.warn("IndexedDB load failed", e);
      return null;
    }
  },

  async clear(): Promise<void> {
    try {
      const db = await withTimeout(openDB(), TIMEOUT_MS);

      await withTimeout(
        new Promise<void>((resolve, reject) => {
          try {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.close();
              return resolve();
            }

            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            const request = store.delete("current");

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);

            tx.oncomplete = () => db.close();
            tx.onerror = () => {
              db.close();
              reject(tx.error);
            };
          } catch (e) {
            db.close();
            reject(e);
          }
        }),
        TIMEOUT_MS
      );
    } catch (e) {
      console.warn("IndexedDB clear failed", e);
    }
  },

  isAvailable(): boolean {
    return typeof window !== "undefined" && !!window.indexedDB;
  },
};
