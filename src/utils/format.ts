/**
 * Format a number with locale-appropriate thousand separators.
 * e.g., 286000 → "286,000"
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

/**
 * Format entropy bits to one decimal place.
 * e.g., 18.3456 → "18.3"
 */
export function formatBits(bits: number): string {
  return Number(bits).toFixed(1);
}

/**
 * Format a uniqueness estimate as "1 in N".
 * Uses compact notation for numbers >= 1M to prevent overflow.
 * e.g., 262144 → "1 in 262,144", 1073741824 → "1 in 1.07B"
 */
export function formatUniqueness(estimatedUniqueness: number): string {
  if (estimatedUniqueness >= 1_000_000) {
    const compact = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumSignificantDigits: 3,
    }).format(estimatedUniqueness);
    return `1 in ${compact}`;
  }
  return `1 in ${formatNumber(estimatedUniqueness)}`;
}

/**
 * Format uniqueness as scientific notation parts from entropy bits.
 * Avoids floating-point overflow for large bit values.
 * e.g., 87.3 bits → { mantissa: "2.28", exponent: 26 }
 */
export function formatUniquenessScientific(bits: number): { mantissa: string; exponent: number } {
  if (bits <= 0) return { mantissa: '1', exponent: 0 };
  const log10 = bits * Math.log10(2);
  const exp = Math.floor(log10);
  const mantissa = Math.pow(10, log10 - exp);
  return { mantissa: mantissa.toFixed(2), exponent: exp };
}

/**
 * Compute 2^bits as a full decimal string with comma separators.
 * Uses BigInt for arbitrary precision; rounds bits to nearest integer.
 * e.g., 87 bits → "154,742,504,910,672,534,362,390,528"
 */
export function formatUniquenessFullDecimal(bits: number): string {
  if (bits <= 0) return '1';
  const intBits = Math.round(bits);
  const n = (2n ** BigInt(intBits)).toString();
  return n.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Truncate a hash string for display.
 * e.g., "abc123def456..." → "abc123def456..."
 */
export function truncateHash(hash: string, maxLength: number = 12): string {
  if (hash.length <= maxLength) {
    return hash;
  }
  return hash.substring(0, maxLength) + '...';
}

/**
 * Format milliseconds duration for display.
 * e.g., 1234 → "1.2s", 50 → "50ms"
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Format a percentage with appropriate precision.
 * e.g., 0.228 → "22.8%"
 */
export function formatPercent(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`;
}
