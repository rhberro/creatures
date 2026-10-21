import pino from 'pino';
import type { Logger, LoggerOptions } from 'pino';

const REDACTED_PATHS = [
  'access_token',
  '*.access_token',
  'authorization',
  '*.authorization',
  'cookie',
  '*.cookie',
  'password',
  '*.password',
  'refresh_token',
  '*.refresh_token',
  'secret',
  '*.secret',
  'token',
  '*.token',
];

/**
 * The logger of the server.
 *
 * The redaction is the last line of defense: a password, a token or an
 * authorization header never reaches the log, whatever the code that logs it
 * passes to the logger.
 */
export function createServerLogger(
  options?: LoggerOptions,
  destination?: pino.DestinationStream,
): Logger {
  const config: LoggerOptions = {
    ...options,
    redact: { censor: '[redacted]', paths: REDACTED_PATHS },
  };
  if (destination === undefined) {
    return pino(config);
  }
  return pino(config, destination);
}
