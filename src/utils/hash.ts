/**
 * Compute SHA-256 hash of a string using Web Crypto API.
 * Returns the hash as a lowercase hex string.
 */
export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Canonicalize a value for deterministic hashing.
 * Objects have keys sorted recursively. Arrays maintain order.
 */
export function canonicalize(value: unknown): string {
  if (value === undefined) {
    return 'undefined';
  }
  if (value === null) {
    return 'null';
  }
  if (typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map((v) => canonicalize(v)).join(',') + ']';
  }

  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const parts: string[] = [];
  for (const key of keys) {
    if (obj[key] !== undefined) {
      parts.push(JSON.stringify(key) + ':' + canonicalize(obj[key]));
    }
  }
  return '{' + parts.join(',') + '}';
}

/**
 * Compute SHA-256 hash of arbitrary data by JSON-serializing it first.
 * Produces deterministic output by sorting object keys.
 */
export async function hashData(data: unknown): Promise<string> {
  const canonical = canonicalize(data);
  return sha256(canonical);
}
