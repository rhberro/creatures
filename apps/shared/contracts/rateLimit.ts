/**
 * The reasons the server refuses a request because of too many attempts.
 *
 * The codes live in the namespace of the rate limit: the shared trainer
 * contract has a closed set of codes, and the rate limit is not a trainer.
 */
export type RateLimitErrorCode = 'rate_limited';
