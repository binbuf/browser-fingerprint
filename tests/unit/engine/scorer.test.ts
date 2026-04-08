import { describe, it, expect } from 'vitest';
import { ScoreEngine } from '../../../src/engine/scorer';
import type { ReferenceDataEntry } from '../../../src/data/types';
import type { SignalEntry } from '../../../src/collectors/types';

const mockReferenceData: ReferenceDataEntry[] = [
  {
    signalKey: "screen.resolution",
    totalSamples: 1000,
    source: "test",
    lastUpdated: "2023-01-01",
    values: [
      { value: "1920x1080", frequency: 0.228, count: 228 },
      { value: "1280x720", frequency: 0.125, count: 125 }, // entropy = 3.0
      { value: "800x600", frequency: 0.015625, count: 16 } // entropy = 6.0
    ]
  },
  {
    signalKey: "test.all",
    totalSamples: 100,
    source: "test",
    lastUpdated: "2023-01-01",
    values: [
      { value: "same", frequency: 1.0, count: 100 }
    ]
  },
  {
    signalKey: "test.boundary",
    totalSamples: 1000,
    source: "test",
    lastUpdated: "2023-01-01",
    values: [
      { value: "low", frequency: Math.pow(2, -2.99), count: 1 },
      { value: "med_low", frequency: Math.pow(2, -3.0), count: 1 },
      { value: "med_high", frequency: Math.pow(2, -5.99), count: 1 },
      { value: "high", frequency: Math.pow(2, -6.0), count: 1 },
    ]
  }
];

describe('ScoreEngine', () => {
  const engine = new ScoreEngine(mockReferenceData);

  describe('scoreSignal', () => {
    it('computes -log2(frequency) for known values', () => {
      const signal: SignalEntry = { key: 'screen.resolution', value: '1920x1080', label: 'Resolution' };
      const score = engine.scoreSignal(signal);
      expect(score.entropyBits).toBeCloseTo(2.13, 2);
      expect(score.frequency).toBe(0.228);
    });

    it('handles zero-entropy edge case (frequency = 1.0)', () => {
      const signal: SignalEntry = { key: 'test.all', value: 'same', label: 'All Same' };
      const score = engine.scoreSignal(signal);
      expect(score.entropyBits).toBe(0);
      expect(score.frequency).toBe(1.0);
    });

    it('assigns default frequency for unknown values of known signals', () => {
      // totalSamples is 1000, so default freq is 1 / 1001 = 0.000999
      const signal: SignalEntry = { key: 'screen.resolution', value: 'unknown', label: 'Resolution' };
      const score = engine.scoreSignal(signal);
      expect(score.frequency).toBe(1 / 1001);
      expect(score.entropyBits).toBe(-Math.log2(1 / 1001));
    });

    it('assigns default high entropy for completely unknown signals', () => {
      const signal: SignalEntry = { key: 'unknown.key', value: 'something', label: 'Unknown' };
      const score = engine.scoreSignal(signal);
      expect(score.frequency).toBe(1 / 100000);
      expect(score.entropyBits).toBe(-Math.log2(1 / 100000));
    });

    it('categorizes based on entropy thresholds', () => {
      const low = engine.scoreSignal({ key: 'test.boundary', value: 'low', label: 'Low' });
      const medLow = engine.scoreSignal({ key: 'test.boundary', value: 'med_low', label: 'Med Low' });
      const medHigh = engine.scoreSignal({ key: 'test.boundary', value: 'med_high', label: 'Med High' });
      const high = engine.scoreSignal({ key: 'test.boundary', value: 'high', label: 'High' });

      expect(low.category).toBe('low');
      expect(medLow.category).toBe('medium');
      expect(medHigh.category).toBe('medium');
      expect(high.category).toBe('high');
    });
  });

  describe('scoreModule', () => {
    it('aggregates multiple signals correctly', () => {
      const signals: SignalEntry[] = [
        { key: 'screen.resolution', value: '1280x720', label: 'Res' }, // entropy 3.0
        { key: 'test.all', value: 'same', label: 'All' } // entropy 0.0
      ];
      const breakdown = engine.scoreModule('col1', 'Col 1', 'browser-state', signals);
      expect(breakdown.collectorId).toBe('col1');
      expect(breakdown.entropyBits).toBeCloseTo(3.0, 5);
      expect(breakdown.signalCount).toBe(2);
    });

    it('contributes 0 bits for empty signals', () => {
      const breakdown = engine.scoreModule('col1', 'Col 1', 'browser-state', []);
      expect(breakdown.entropyBits).toBe(0);
      expect(breakdown.signalCount).toBe(0);
    });
  });

  describe('computeReport', () => {
    it('computes full report, correctly sums bits, and determines uniqueness label', () => {
      const moduleResults = new Map();
      moduleResults.set('col1', {
        collectorId: 'col1',
        collectorName: 'Collector 1',
        category: 'browser-state',
        signals: [{ key: 'screen.resolution', value: '1280x720', label: 'Res' }], // 3.0 bits
        status: 'completed'
      });
      moduleResults.set('col2', {
        collectorId: 'col2',
        collectorName: 'Collector 2',
        category: 'browser-state',
        signals: [{ key: 'screen.resolution', value: '800x600', label: 'Res' }], // 6.0 bits
        status: 'completed'
      });

      const report = engine.computeReport(moduleResults, 2);
      expect(report.totalEntropyBits).toBeCloseTo(9.0, 5);
      expect(report.estimatedUniqueness).toBeCloseTo(Math.pow(2, 9), 5); // 512
      expect(report.uniquenessLabel).toBe("1 in 512");
      expect(report.isPartial).toBe(false);
      expect(report.completedModules).toBe(2);
      expect(report.totalModules).toBe(2);
    });

    it('sets isPartial correctly for incremental updates', () => {
      const moduleResults = new Map();
      moduleResults.set('col1', {
        collectorId: 'col1',
        collectorName: 'Collector 1',
        category: 'browser-state',
        signals: [{ key: 'screen.resolution', value: '1280x720', label: 'Res' }],
        status: 'completed'
      });

      const report = engine.computeReport(moduleResults, 24);
      expect(report.isPartial).toBe(true);
      expect(report.completedModules).toBe(1);
    });
  });
});
