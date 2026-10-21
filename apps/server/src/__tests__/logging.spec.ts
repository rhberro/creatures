import { expect, test } from 'bun:test';

import type { DestinationStream, Logger } from 'pino';

import { createServerLogger } from '~/logging/logger';
import { logRouteEvent } from '~/logging/routeLog';
import { sanitizeLogFields } from '~/logging/sanitize';
import { createRequestContext } from '~/router';

import {
  TRAINERS_PATH,
  USER_TOKEN,
  buildDependencies,
  buildHandler,
  buildJsonRequest,
  send,
} from './support';

const SECRET = 'creatures-secret-password';
const INVALID_BODY = {
  email: 'player@example.com',
  password: SECRET,
};

type LogCapture = {
  lines: string[];
  logger: Logger;
};

function createCapture(): LogCapture {
  const lines: string[] = [];
  const sink: DestinationStream = {
    write(chunk: string): void {
      lines.push(chunk);
    },
  };
  return { lines, logger: createServerLogger({ level: 'info' }, sink) };
}

function readLog(capture: LogCapture): string {
  return capture.lines.join('');
}

/**
 * The body of the request never reaches the log: the log says what the route
 * did, and the route says what it received, field by field.
 */
function thePasswordOfTheRequestIsNotLogged(): Promise<void> {
  const capture = createCapture();
  const deps = buildDependencies();
  deps.logger = capture.logger;
  const handler = buildHandler(deps);
  const request = buildJsonRequest('POST', TRAINERS_PATH, INVALID_BODY, USER_TOKEN);
  return send(handler, request).then(function assertNoSecret(): void {
    expect(readLog(capture)).not.toContain(SECRET);
  });
}

/**
 * The fields of a route go through the sanitizer: a route that logs a field it
 * should not log still cannot leak a secret.
 */
function theFieldsOfTheRouteAreSanitized(): void {
  const capture = createCapture();
  const ctx = createRequestContext();
  logRouteEvent(capture.logger, ctx, 'route event', {
    name: 'Rafael',
    nested: { password: SECRET },
    password: SECRET,
    token: SECRET,
  });
  expect(readLog(capture)).not.toContain(SECRET);
  expect(readLog(capture)).toContain('Rafael');
}

/**
 * The logger itself redacts the sensitive fields: the defense does not depend
 * on the code that logs.
 */
function theLoggerRedactsTheSensitiveFields(): void {
  const capture = createCapture();
  capture.logger.info({ password: SECRET }, 'direct');
  expect(readLog(capture)).not.toContain(SECRET);
}

function theSanitizerRemovesTheSensitiveKeys(): void {
  const sanitized = sanitizeLogFields({
    access_token: SECRET,
    authorization: SECRET,
    name: 'Rafael',
    refreshToken: SECRET,
  });
  expect(sanitized).toEqual({ name: 'Rafael' });
}

test('the password of the request never reaches the log', thePasswordOfTheRequestIsNotLogged);
test('the fields of the route are sanitized', theFieldsOfTheRouteAreSanitized);
test('the logger redacts the sensitive fields', theLoggerRedactsTheSensitiveFields);
test('the sanitizer removes the sensitive keys', theSanitizerRemovesTheSensitiveKeys);
