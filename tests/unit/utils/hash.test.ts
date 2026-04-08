import { describe, it, expect } from 'vitest';
import { sha256, hashData, canonicalize } from '../../../src/utils/hash';

describe('hash', () => {
  it('sha256 produces correct hash for "test"', async () => {
    const hash = await sha256('test');
    expect(hash).toBe('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
  });

  it('canonicalize sorts keys', () => {
    const obj1 = { b: 2, a: 1 };
    const obj2 = { a: 1, b: 2 };
    expect(canonicalize(obj1)).toBe(canonicalize(obj2));
  });

  it('canonicalize handles nested objects and arrays', () => {
    const obj1 = { c: [1, 2, { z: 3, y: 4 }], a: 1 };
    const obj2 = { a: 1, c: [1, 2, { y: 4, z: 3 }] };
    expect(canonicalize(obj1)).toBe(canonicalize(obj2));
  });

  it('canonicalize skips undefined fields', () => {
    const obj1 = { a: 1, b: undefined };
    const obj2 = { a: 1 };
    expect(canonicalize(obj1)).toBe(canonicalize(obj2));
  });

  it('hashData produces deterministic hashes', async () => {
    const obj1 = { b: 2, a: 1 };
    const obj2 = { a: 1, b: 2 };
    expect(await hashData(obj1)).toBe(await hashData(obj2));
  });
});
