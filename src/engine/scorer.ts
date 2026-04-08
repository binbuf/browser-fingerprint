import type { CollectorCategory, CollectorStatus, SignalEntry } from "../collectors/types";
import type { EntropyScore, ModuleEntropyBreakdown, UniquenessReport } from "./types";
import type { ReferenceDataEntry } from "../data/types";
import { formatUniqueness } from "../utils/format";

export class ScoreEngine {
  private referenceMap: Map<string, ReferenceDataEntry>;

  constructor(referenceDataset: ReferenceDataEntry[]) {
    this.referenceMap = new Map();
    for (const entry of referenceDataset) {
      this.referenceMap.set(entry.signalKey, entry);
    }
  }

  /**
   * Score a single signal against the reference dataset.
   * Returns bits of identifying information using: bits = -log2(frequency)
   */
  scoreSignal(signal: SignalEntry): EntropyScore {
    const entry = this.referenceMap.get(signal.key);
    
    let frequency: number;
    let hasReferenceData: boolean;

    if (entry) {
      hasReferenceData = true;
      const signalValueStr = String(signal.value);
      const match = entry.values.find((v) => String(v.value) === signalValueStr);
      if (match) {
        frequency = match.frequency;
      } else {
        frequency = 1 / (entry.totalSamples + 1);
      }
    } else {
      // Default conservative high entropy for signals entirely missing from the reference dataset
      hasReferenceData = false;
      frequency = 1 / 100000;
    }

    const entropyBits = frequency === 1 ? 0 : -Math.log2(frequency);
    const commonalityPercent = frequency * 100;

    let category: "low" | "medium" | "high";
    if (entropyBits < 3) {
      category = "low";
    } else if (entropyBits < 6) {
      category = "medium";
    } else {
      category = "high";
    }

    return {
      signalKey: signal.key,
      value: signal.value,
      entropyBits,
      frequency,
      commonalityPercent,
      category,
      hasReferenceData,
    };
  }

  /**
   * Score all signals from a single collector module.
   * Returns the module-level entropy breakdown.
   */
  scoreModule(
    collectorId: string,
    collectorName: string,
    category: CollectorCategory,
    signals: SignalEntry[],
    status: CollectorStatus = "completed"
  ): ModuleEntropyBreakdown {
    let entropyBits = 0;
    for (const signal of signals) {
      entropyBits += this.scoreSignal(signal).entropyBits;
    }

    return {
      collectorId,
      collectorName,
      category,
      entropyBits,
      signalCount: signals.length,
      status,
    };
  }

  /**
   * Compute the full uniqueness report from all available results.
   * Supports partial results (isPartial=true when not all collectors have finished).
   */
  computeReport(
    moduleResults: Map<
      string,
      {
        collectorId: string;
        collectorName: string;
        category: CollectorCategory;
        signals: SignalEntry[];
        status: CollectorStatus;
      }
    >,
    totalModules: number
  ): UniquenessReport {
    let totalEntropyBits = 0;
    const perModule: ModuleEntropyBreakdown[] = [];
    const perSignal: EntropyScore[] = [];
    let completedModules = 0;

    for (const result of moduleResults.values()) {
      if (
        result.status === "completed" ||
        result.status === "unsupported" ||
        result.status === "error" ||
        result.status === "timeout"
      ) {
        completedModules++;
      }

      const moduleBreakdown = this.scoreModule(
        result.collectorId,
        result.collectorName,
        result.category,
        result.signals,
        result.status
      );

      perModule.push(moduleBreakdown);
      totalEntropyBits += moduleBreakdown.entropyBits;

      for (const signal of result.signals) {
        perSignal.push(this.scoreSignal(signal));
      }
    }

    const isPartial = completedModules < totalModules;
    const estimatedUniqueness = Math.pow(2, totalEntropyBits);

    return {
      totalEntropyBits,
      estimatedUniqueness,
      uniquenessLabel: formatUniqueness(estimatedUniqueness),
      perModule,
      perSignal,
      completedModules,
      totalModules,
      isPartial,
    };
  }
}
