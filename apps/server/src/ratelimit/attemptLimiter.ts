const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000;

export type AttemptLimiter = {
  /** Whether the key has already failed too many times inside the window. */
  isBlocked(key: string): boolean;
  /** Registers a failed attempt of the key. */
  recordFailure(key: string): void;
  /** Forgets every attempt: used by the tests. */
  reset(): void;
};

export type AttemptLimiterOptions = {
  /** How many failures the key may have inside the window. */
  maxAttempts?: number;
  /** The clock of the limiter: the tests move it by hand. */
  now?: () => number;
  /** How long a failure is remembered. */
  windowMs?: number;
};

/**
 * The failed attempts of a key, inside a sliding window.
 *
 * The counter is per process and lives in the memory of the process: it is the
 * same kind of state as the session of the trainer, and it has the same
 * limitation — with more than one instance, each one counts its own attempts
 * and the limit weakens in proportion to the number of instances.
 */
export function createAttemptLimiter(options?: AttemptLimiterOptions): AttemptLimiter {
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const now = options?.now ?? Date.now;
  const failures = new Map<string, number[]>();

  function isBlocked(key: string): boolean {
    return readFailures(key).length >= maxAttempts;
  }

  function recordFailure(key: string): void {
    const attempts = readFailures(key);
    attempts.push(now());
    failures.set(key, attempts);
  }

  function reset(): void {
    failures.clear();
  }

  /**
   * The failures of the key that are still inside the window. The ones that
   * left it are forgotten, which is what makes the counter forget on its own.
   */
  function readFailures(key: string): number[] {
    const attempts = (failures.get(key) ?? []).filter(function isInsideWindow(at: number): boolean {
      return now() - at < windowMs;
    });
    if (attempts.length === 0) {
      failures.delete(key);
      return [];
    }
    failures.set(key, attempts);
    return attempts;
  }

  return { isBlocked, recordFailure, reset };
}
