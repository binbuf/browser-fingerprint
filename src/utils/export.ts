import type { CollectorResult } from "../collectors/types";
import type { FingerprintSnapshot, RecognitionResult, UniquenessReport } from "../engine/types";
import type { AntiFingerprintReport, ExportedReport } from "../ui/stores/types";
import type { SerializedSnapshot } from "../persistence/types";
import { version } from "../../package.json";

/**
 * Converts a FingerprintSnapshot (with Map) to a SerializedSnapshot (with Record)
 */
export function serializeSnapshot(snapshot: FingerprintSnapshot): SerializedSnapshot {
  const resultsRecord: Record<string, CollectorResult> = {};
  snapshot.results.forEach((result, id) => {
    resultsRecord[id] = result;
  });

  return {
    id: snapshot.id,
    timestamp: snapshot.timestamp,
    userAgent: snapshot.userAgent,
    results: resultsRecord,
    compositeHash: snapshot.compositeHash,
    signals: snapshot.signals
  };
}

/**
 * Generates the full ExportedReport object
 */
export function generateExportReport(
  snapshot: FingerprintSnapshot,
  uniqueness: UniquenessReport,
  recognition: RecognitionResult | null,
  antiFingerprint: AntiFingerprintReport
): ExportedReport {
  return {
    version,
    exportedAt: new Date().toISOString(),
    fingerprint: serializeSnapshot(snapshot),
    uniqueness,
    recognition,
    antiFingerprinting: antiFingerprint
  };
}

/**
 * Triggers a browser download of the report as a JSON file
 */
export function downloadReport(report: ExportedReport): void {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  
  const date = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `fingerprint-report-${date}.json`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
