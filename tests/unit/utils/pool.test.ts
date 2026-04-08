import { describe, it, expect } from 'vitest';
import { pool } from '../../../src/utils/pool';

describe('pool', () => {
  it('respects concurrency limit and preserves order', async () => {
    let concurrent = 0;
    let maxConcurrent = 0;

    const createTask = (index: number, delayMs: number) => async () => {
      concurrent++;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      concurrent--;
      return index;
    };

    const tasks = [
      createTask(0, 50),
      createTask(1, 10),
      createTask(2, 20),
      createTask(3, 40),
      createTask(4, 30),
    ];

    const completed: number[] = [];
    const results = await pool(tasks, {
      concurrency: 2,
      onItemComplete: (result) => {
        completed.push(result);
      },
    });

    expect(maxConcurrent).toBeLessThanOrEqual(2);
    expect(results).toEqual([0, 1, 2, 3, 4]);
    // Completion order will depend on timings, but results should preserve the original order.
    // 1 finishes before 0
    expect(completed).not.toEqual([0, 1, 2, 3, 4]);
    expect(completed).toContain(0);
    expect(completed).toContain(1);
    expect(completed.length).toBe(5);
  });

  it('handles failures gracefully without aborting the pool', async () => {
    let completedCount = 0;
    const tasks = [
      async () => { completedCount++; return 1; },
      async () => { completedCount++; throw new Error('Task failed'); },
      async () => { completedCount++; return 3; },
    ];

    await expect(pool(tasks, { concurrency: 2 })).rejects.toThrow('Task failed');
    // It should have executed all tasks despite the failure
    expect(completedCount).toBe(3);
  });
});
