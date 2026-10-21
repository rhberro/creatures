/**
 * Environment loading for the test account seed script.
 *
 * Bun already loads `apps/server/.env` when the script runs from the server
 * package, but the file is read directly as a fallback so the script also
 * works when it is executed from another directory.
 */

const DOT_ENV_PATH = `${import.meta.dir}/../.env`;

export type SeedEnv = {
  serviceRoleKey: string;
  url: string;
};

export function readSeedEnv(): Promise<SeedEnv> {
  return readDotEnv().then(function mergeEnv(dotEnv: Record<string, string>): SeedEnv {
    const env = { ...dotEnv, ...globalThis.process.env };
    const url = env.SUPABASE_URL;
    const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
    if (url === undefined || serviceRoleKey === undefined) {
      throw new Error(
        'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios (apps/server/.env).',
      );
    }
    return { serviceRoleKey, url };
  });
}

function readDotEnv(): Promise<Record<string, string>> {
  return globalThis.Bun.file(DOT_ENV_PATH).text().then(parseDotEnv);
}

function parseDotEnv(content: string): Record<string, string> {
  const values: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) {
      continue;
    }
    const separator = trimmed.indexOf('=');
    if (separator === -1) {
      continue;
    }
    values[trimmed.slice(0, separator).trim()] = trimmed.slice(separator + 1).trim();
  }
  return values;
}
