import { defineRoute, jsonResponse } from '~/router';
import type { Route } from '~/router';

const HEALTH_PATH = '/api/health';
const OK = 200;

export function createHealthRoutes(): Route[] {
  return [defineRoute('GET', HEALTH_PATH, handleHealth)];
}

function handleHealth(_req: Request, _params: Record<string, string>): Promise<Response> {
  return Promise.resolve(jsonResponse({ status: 'ok' }, OK));
}
