type SupabaseEnv = {
  url: string;
  anonKey: string;
};

export function readSupabaseEnv(): SupabaseEnv {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (typeof url !== 'string' || url.length === 0) {
    throw new Error('VITE_SUPABASE_URL is not set. Configure it in .env.local.');
  }
  if (typeof anonKey !== 'string' || anonKey.length === 0) {
    throw new Error('VITE_SUPABASE_ANON_KEY is not set. Configure it in .env.local.');
  }
  return { anonKey, url };
}
