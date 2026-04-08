import type { RecognitionResult, AttributeComparison } from "./types";
import type { CollectorResult, CollectorMetadata } from "../collectors/types";
import type { PersistedFingerprint } from "../persistence/types";

const DEFAULT_MATCH_THRESHOLD = 0.75;

export class Matcher {
  /**
   * Compare current fingerprint against a previously stored fingerprint.
   * Uses weighted attribute similarity per ADR-005.
   *
   * @param currentResults - Current scan results keyed by collector ID
   * @param currentHashes - Per-module hashes from the current scan
   * @param compositeHash - Current composite hash
   * @param prior - Previously persisted fingerprint (or null if first visit)
   * @param metadata - Collector metadata for stability weights
   * @param threshold - Recognition threshold (default 0.75)
   */
  async compare(
    currentResults: Map<string, CollectorResult>,
    currentHashes: Map<string, string>,
    compositeHash: string,
    prior: PersistedFingerprint | null,
    metadata: CollectorMetadata[],
    threshold: number = DEFAULT_MATCH_THRESHOLD,
  ): Promise<RecognitionResult> {
    if (!prior) {
      return {
        isFirstVisit: true,
        recognized: false,
        similarity: 0,
        daysSinceLastVisit: 0,
        matchedAttributes: [],
        changedAttributes: [],
        stableAttributeCount: 0,
        totalAttributeCount: 0,
        previousHash: null,
        currentHash: compositeHash,
      };
    }

    const matchedAttributes: AttributeComparison[] = [];
    const changedAttributes: AttributeComparison[] = [];
    let matchedWeights = 0;
    let allWeights = 0;

    const priorResults = prior.snapshot.results;

    const metadataMap = new Map<string, CollectorMetadata>();
    for (const meta of metadata) {
      metadataMap.set(meta.id, meta);
    }

    for (const [id, currentResult] of currentResults.entries()) {
      const priorResult = priorResults[id];
      if (priorResult) {
        const meta = metadataMap.get(id);
        const stabilityWeight = meta ? meta.stabilityWeight : 0;

        let matched = false;
        let previousValue = "";
        let currentValue = "";

        if (
          currentResult.status === "completed" &&
          priorResult.status === "completed"
        ) {
          currentValue = currentHashes.get(id) || currentResult.hash;
          previousValue = priorResult.hash;
          matched = currentValue === previousValue;
        } else if (currentResult.status === priorResult.status) {
          currentValue = currentResult.status;
          previousValue = priorResult.status;
          matched = true;
        } else {
          currentValue = currentResult.status;
          previousValue = priorResult.status;
          matched = false;
        }

        if (matched) {
          matchedWeights += stabilityWeight;
        }
        allWeights += stabilityWeight;

        const comparison: AttributeComparison = {
          key: id,
          label: meta?.name || id,
          previousValue,
          currentValue,
          stabilityWeight,
          matched,
        };

        if (matched) {
          matchedAttributes.push(comparison);
        } else {
          changedAttributes.push(comparison);
        }
      }
    }

    const similarity = allWeights > 0 ? matchedWeights / allWeights : 0;
    const recognized = similarity >= threshold;
    const daysSinceLastVisit = Math.floor(
      (Date.now() - prior.lastSeenTimestamp) / (1000 * 60 * 60 * 24)
    );

    return {
      isFirstVisit: false,
      recognized,
      similarity,
      daysSinceLastVisit,
      matchedAttributes,
      changedAttributes,
      stableAttributeCount: matchedAttributes.length,
      totalAttributeCount: matchedAttributes.length + changedAttributes.length,
      previousHash: prior.snapshot.compositeHash,
      currentHash: compositeHash,
    };
  }
}
