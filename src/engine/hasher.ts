import type { CollectorResult } from "../collectors/types";
import { hashData, sha256 } from "../utils/hash";

export class Hasher {
  /**
   * Compute SHA-256 hash of a single collector's result data.
   * Only hashes successful results; returns null for non-success statuses.
   */
  async hashCollectorResult(result: CollectorResult): Promise<string | null> {
    if (result.status !== "completed") {
      return null;
    }
    return hashData(result.data);
  }

  /**
   * Compute per-module hashes for all successful results.
   * Returns a map of collectorId → hash.
   */
  async computePerModuleHashes(
    results: Map<string, CollectorResult>,
  ): Promise<Map<string, string>> {
    const hashes = new Map<string, string>();
    for (const [id, result] of results.entries()) {
      const hash = await this.hashCollectorResult(result);
      if (hash !== null) {
        hashes.set(id, hash);
      }
    }
    return hashes;
  }

  /**
   * Compute the composite fingerprint hash.
   * Concatenates per-module hashes in alphabetical order by collector ID,
   * then hashes the concatenated string.
   */
  async computeCompositeHash(
    results: Map<string, CollectorResult>,
  ): Promise<string> {
    const hashes = await this.computePerModuleHashes(results);
    const sortedIds = Array.from(hashes.keys()).sort();

    let concatenated = "";
    for (const id of sortedIds) {
      concatenated += hashes.get(id);
    }

    return sha256(concatenated);
  }
}
