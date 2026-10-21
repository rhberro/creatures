const DEFAULT_API_BASE_URL = 'http://localhost:3001';

export type ApiDeps = {
  baseUrl: string;
  getAccessToken(): Promise<string | null>;
};

export function readApiBaseUrl(): string {
  const value = import.meta.env.VITE_API_BASE_URL;
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  // The fallback points at a developer machine: in a build it would send the
  // players to a server that does not exist, so the build fails instead.
  if (import.meta.env.PROD) {
    throw new Error('VITE_API_BASE_URL is not set. Configure it before building the client.');
  }
  return DEFAULT_API_BASE_URL;
}

export function createApiDeps(getAccessToken: () => Promise<string | null>): ApiDeps {
  return { baseUrl: readApiBaseUrl(), getAccessToken };
}
