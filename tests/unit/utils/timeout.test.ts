import { describe, it, expect } from 'vitest';
import { withTimeout, TimeoutError } from '../../../src/utils/timeout';

describe('timeout', () => {
  it('resolves before timeout', async () => {
    const result = await withTimeout(async () => {
      return new Promise((resolve) => setTimeout(() => resolve('success'), 10));
    }, 50);
    expect(result).toBe('success');
  });

  it('rejects on timeout with TimeoutError and aborts signal', async () => {
    let signalAborted = false;
    const promise = withTimeout(async (signal) => {
      signal.addEventListener('abort', () => {
        signalAborted = true;
      });
      return new Promise((resolve) => setTimeout(() => resolve('success'), 50));
    }, 10);

    await expect(promise).rejects.toThrow(TimeoutError);
    await expect(promise).rejects.toThrow('Operation timed out after 10ms');
    expect(signalAborted).toBe(true);
  });

  it('rejects if the underlying promise rejects before timeout', async () => {
    const promise = withTimeout(async () => {
      return new Promise((_, reject) => setTimeout(() => reject(new Error('Failed')), 10));
    }, 50);

    await expect(promise).rejects.toThrow('Failed');
  });
});
