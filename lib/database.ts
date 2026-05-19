import { isSupabaseConfigured } from './supabase/admin';
import { isDatabaseConfigured as isPgConfigured } from './db';

/** True when either Supabase JS (Vercel-friendly) or Postgres URL is configured. */
export function isDatabaseConfigured(): boolean {
  return isSupabaseConfigured() || isPgConfigured();
}

export function useSupabaseDataLayer(): boolean {
  return isSupabaseConfigured();
}
