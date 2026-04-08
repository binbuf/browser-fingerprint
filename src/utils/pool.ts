export interface PoolOptions<T> {
  concurrency: number;
  onItemComplete?: (result: T, index: number) => void;
}

/**
 * Execute an array of async tasks with a concurrency limit.
 * Calls onItemComplete as each task finishes (progressive emission).
 * Returns all results in original order when all tasks complete.
 */
export async function pool<T>(
  tasks: (() => Promise<T>)[],
  options: PoolOptions<T>
): Promise<T[]> {
  const { concurrency, onItemComplete } = options;
  const results: T[] = new Array(tasks.length);
  let currentIndex = 0;
  let hasError = false;
  let firstError: unknown = null;

  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    async () => {
      while (currentIndex < tasks.length) {
        const taskIndex = currentIndex++;
        try {
          const result = await tasks[taskIndex]();
          results[taskIndex] = result;
          if (onItemComplete) {
            onItemComplete(result, taskIndex);
          }
        } catch (error) {
          if (!hasError) {
            hasError = true;
            firstError = error;
          }
        }
      }
    }
  );

  await Promise.all(workers);

  if (hasError) {
    throw firstError;
  }

  return results;
}
