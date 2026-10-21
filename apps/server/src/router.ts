import type { Logger } from 'pino';

export type RequestContext = {
  /** The address the request came from, when the server can tell it. */
  clientIp: string | null;
  /** The e-mail of the signed in identity, read from the validated token. */
  email: string | null;
  requestId: string;
  responseHeaders: Headers;
  startedAt: number;
  userId: string | null;
};

export type RouteHandler = (
  req: Request,
  params: Record<string, string>,
  ctx: RequestContext,
) => Promise<Response>;

export type ResponseObserver = (req: Request, ctx: RequestContext, response: Response) => void;

export type Middleware = (req: Request, ctx: RequestContext) => Promise<Response | null>;

export type Route = {
  handler: RouteHandler;
  method: string;
  paramNames: string[];
  pattern: RegExp;
};

const NOT_FOUND_ERROR = 'not_found';
const NOT_FOUND_MESSAGE = 'Rota não encontrada.';
const METHOD_NOT_ALLOWED_ERROR = 'method_not_allowed';
const METHOD_NOT_ALLOWED_MESSAGE = 'Método não permitido.';
const INTERNAL_ERROR_CODE = 'internal_error';
const INTERNAL_ERROR_MESSAGE = 'Erro interno do servidor.';
const PARAM_SEGMENT_PATTERN = /^:(\w+)$/u;
const REGEXP_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/gu;

export function defineRoute(method: string, path: string, handler: RouteHandler): Route {
  const compiled = compilePath(path);
  return {
    handler,
    method,
    paramNames: compiled.paramNames,
    pattern: compiled.pattern,
  };
}

export function composeMiddleware(middlewares: Middleware[], handler: RouteHandler): RouteHandler {
  return function runPipeline(
    req: Request,
    params: Record<string, string>,
    ctx: RequestContext | undefined,
  ): Promise<Response> {
    const context = ctx ?? createRequestContext();
    return runMiddlewares(middlewares, 0, req, context).then(function dispatchResult(
      middlewareResponse: Response | null,
    ): Response | Promise<Response> {
      if (middlewareResponse === null) {
        return handler(req, params, context);
      }
      return middlewareResponse;
    });
  };
}

export function buildHttpHandler(routes: Route[], observer?: ResponseObserver): RouteHandler {
  return function dispatch(
    req: Request,
    _params: Record<string, string>,
    ctx: RequestContext,
  ): Promise<Response> {
    const pathname = new globalThis.URL(req.url).pathname;
    const pathMatches = findRoutesByPath(routes, pathname);
    if (pathMatches.length === 0) {
      const response = errorResponse(404, NOT_FOUND_ERROR, NOT_FOUND_MESSAGE);
      return Promise.resolve(finalize(response, req, ctx, observer));
    }
    const route = findRouteByMethod(pathMatches, req.method);
    if (route === null) {
      const response = errorResponse(405, METHOD_NOT_ALLOWED_ERROR, METHOD_NOT_ALLOWED_MESSAGE);
      return Promise.resolve(finalize(response, req, ctx, observer));
    }
    const match = route.pattern.exec(pathname);
    if (match === null) {
      const response = errorResponse(404, NOT_FOUND_ERROR, NOT_FOUND_MESSAGE);
      return Promise.resolve(finalize(response, req, ctx, observer));
    }
    const params = extractParams(route.paramNames, match);
    return route.handler(req, params, ctx).then(buildResponseFinalizer(req, ctx, observer));
  };
}

export function createRequestContext(): RequestContext {
  return {
    clientIp: null,
    email: null,
    requestId: globalThis.crypto.randomUUID(),
    responseHeaders: new globalThis.Headers(),
    startedAt: globalThis.performance.now(),
    userId: null,
  };
}

export function jsonResponse(body: unknown, status: number): Response {
  const init = { headers: buildJsonHeaders(), status };
  return new globalThis.Response(JSON.stringify(body), init);
}

export function errorResponse(status: number, error: string, message: string): Response {
  const body = { error, message };
  return jsonResponse(body, status);
}

export function isResponse(value: unknown): value is Response {
  return value instanceof globalThis.Response;
}

/**
 * A handler that throws must not leak a stack trace to the client: the error is
 * logged with its request id and the client receives a generic JSON body.
 */
export function createErrorBoundary(logger: Logger, handler: RouteHandler): RouteHandler {
  return function guardedHandler(
    req: Request,
    params: Record<string, string>,
    ctx: RequestContext,
  ): Promise<Response> {
    return handler(req, params, ctx).catch(buildFailureHandler(logger, ctx));
  };
}

function buildFailureHandler(logger: Logger, ctx: RequestContext): (error: unknown) => Response {
  return function handleFailure(error: unknown): Response {
    logger.error({ err: error, requestId: ctx.requestId }, 'unhandled request failure');
    return errorResponse(500, INTERNAL_ERROR_CODE, INTERNAL_ERROR_MESSAGE);
  };
}

function runMiddlewares(
  middlewares: Middleware[],
  index: number,
  req: Request,
  ctx: RequestContext,
): Promise<Response | null> {
  const middleware = middlewares[index];
  if (middleware === undefined) {
    return Promise.resolve(null);
  }
  return middleware(req, ctx).then(buildMiddlewareContinuation(middlewares, index, req, ctx));
}

function buildMiddlewareContinuation(
  middlewares: Middleware[],
  index: number,
  req: Request,
  ctx: RequestContext,
): (response: Response | null) => Promise<Response | null> {
  return function continueChain(response: Response | null): Promise<Response | null> {
    if (response !== null) {
      return Promise.resolve(response);
    }
    return runMiddlewares(middlewares, index + 1, req, ctx);
  };
}

function buildJsonHeaders(): Headers {
  const headers = new globalThis.Headers();
  headers.set('Content-Type', 'application/json');
  return headers;
}

function compilePath(path: string): { paramNames: string[]; pattern: RegExp } {
  const paramNames: string[] = [];
  const segments = path.split('/');
  const source = segments.map(buildSegmentPattern(paramNames)).join('/');
  return {
    paramNames,
    pattern: new globalThis.RegExp(`^${source}$`, 'u'),
  };
}

function buildSegmentPattern(paramNames: string[]): (segment: string) => string {
  return function toPattern(segment: string): string {
    const paramMatch = PARAM_SEGMENT_PATTERN.exec(segment);
    if (paramMatch === null) {
      return escapeRegExp(segment);
    }
    const [, name] = paramMatch;
    if (name === undefined) {
      return escapeRegExp(segment);
    }
    paramNames.push(name);
    return '([^/]+)';
  };
}

function escapeRegExp(value: string): string {
  return value.replaceAll(REGEXP_SPECIAL_CHARS, '\\$&');
}

function findRoutesByPath(routes: Route[], pathname: string): Route[] {
  const matches: Route[] = [];
  for (const route of routes) {
    if (route.pattern.test(pathname)) {
      matches.push(route);
    }
  }
  return matches;
}

function findRouteByMethod(routes: Route[], method: string): Route | null {
  for (const route of routes) {
    if (route.method === method) {
      return route;
    }
  }
  return null;
}

function extractParams(paramNames: string[], match: RegExpExecArray): Record<string, string> {
  const params: Record<string, string> = {};
  for (let index = 0; index < paramNames.length; index += 1) {
    const name = paramNames[index];
    const value = match[index + 1];
    if (name !== undefined && value !== undefined) {
      params[name] = decodeURIComponent(value);
    }
  }
  return params;
}

function buildResponseFinalizer(
  req: Request,
  ctx: RequestContext,
  observer: ResponseObserver | undefined,
): (response: Response) => Response {
  return function finalizeResponse(response: Response): Response {
    return finalize(response, req, ctx, observer);
  };
}

function finalize(
  response: Response,
  req: Request,
  ctx: RequestContext,
  observer: ResponseObserver | undefined,
): Response {
  copyHeaders(ctx.responseHeaders, response.headers);
  if (observer !== undefined) {
    observer(req, ctx, response);
  }
  return response;
}

function copyHeaders(source: Headers, target: Headers): void {
  for (const [key, value] of source.entries()) {
    target.set(key, value);
  }
}
