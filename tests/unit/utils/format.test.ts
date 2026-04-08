import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatBits,
  formatUniqueness,
  truncateHash,
  formatDuration,
  formatPercent,
} from '../../../src/utils/format';

describe('format', () => {
  it('formatNumber formats with commas', () => {
    expect(formatNumber(286000)).toBe('286,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
  });

  it('formatBits formats to one decimal place', () => {
    expect(formatBits(18.3456)).toBe('18.3');
    expect(formatBits(18)).toBe('18.0');
  });

  it('formatUniqueness formats correctly for numbers under 1M', () => {
    expect(formatUniqueness(512)).toBe('1 in 512');
    expect(formatUniqueness(262144)).toBe('1 in 262,144');
    expect(formatUniqueness(999999)).toBe('1 in 999,999');
  });

  it('formatUniqueness uses compact notation for numbers >= 1M', () => {
    expect(formatUniqueness(1000000)).toBe('1 in 1M');
    expect(formatUniqueness(50000000)).toBe('1 in 50M');
    expect(formatUniqueness(1073741824)).toBe('1 in 1.07B');
  });

  it('truncateHash truncates correctly', () => {
    expect(truncateHash('abc123def4567890')).toBe('abc123def456...');
    expect(truncateHash('abc')).toBe('abc');
  });

  it('formatDuration formats appropriately', () => {
    expect(formatDuration(50)).toBe('50ms');
    expect(formatDuration(1234)).toBe('1.2s');
  });

  it('formatPercent formats correctly', () => {
    expect(formatPercent(0.228)).toBe('22.8%');
    expect(formatPercent(1)).toBe('100.0%');
  });
});
