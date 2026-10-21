import { expect, test } from 'bun:test';

import pino from 'pino';

import { createErrorBoundary, createRequestContext } from '~/router';
import type { RouteHandler } from '~/router';

const logger = pino({ level: 'silent' });

function boundaryHidesFailures(): Promise<void> {
  const handler = createErrorBoundary(logger, failingHandler());
  const ctx = createRequestContext();
  return handler(buildRequest(), {}, ctx).then(function assertResponse(
    response: Response,
  ): Promise<void> {
    expect(response.status).toBe(500);
    return response.json().then(assertBody);
  });
}

function assertBody(body: unknown): void {
  const error = body as { error: string; message: string };
  expect(error.error).toBe('internal_error');
  expect(error.message).toBe('Erro interno do servidor.');
  expect(error.message).not.toContain('boom');
}

function contextCarriesRequestId(): void {
  const ctx = createRequestContext();
  expect(ctx.requestId.length).toBeGreaterThan(0);
  expect(ctx.userId).toBeNull();
}

function failingHandler(): RouteHandler {
  return function fail(): Promise<Response> {
    return Promise.reject(new Error('boom with a stack trace'));
  };
}

function buildRequest(): Request {
  return new globalThis.Request('http://localhost/api/trainers');
}

test('the error boundary answers 500 without leaking the failure', boundaryHidesFailures);
test('the request context carries a request id', contextCarriesRequestId);
