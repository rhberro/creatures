const DEFAULT_API_BASE_URL = 'http://localhost:3001';

export type ApiDeps = {
  baseUrl: string;
  getAccessToken(): Promise<string | null>;
};

export function readApiBaseUrl(): string {
  const value = import.meta.env.VITE_API_BASE_URL;
  return typeof value === 'string' && value.length > 0 ? value : DEFAULT_API_BASE_URL;
}

export function createApiDeps(getAccessToken: () => Promise<string | null>): ApiDeps {
  return { baseUrl: readApiBaseUrl(), getAccessToken };
}
