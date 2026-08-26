import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

/**
 * Server-side Supabase client singleton.
 *
 * Uses the Service Role Key when available (bypasses RLS for privileged
 * server operations). Falls back to the publishable/anon key if the
 * service-role key is not configured. Returns `null` when neither URL
 * nor key is available (mock/offline mode).
 *
 * IMPORTANT: This client must ONLY be used inside the server-side
 * Repository layer. Never expose it to the client bundle.
 */

let _supabase: SupabaseClient | null = null;
let _initialized = false;

export function getSupabaseClient(): SupabaseClient | null {
  if (_initialized) return _supabase;
  _initialized = true;

  const url = config.supabase.url;
  const key = config.supabase.serviceRoleKey || config.supabase.anonKey;

  if (!url || !key) {
    logger.warn('[Supabase] URL or Key not configured — database operations will be unavailable. Set SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) in .env');
    _supabase = null;
    return null;
  }

  _supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  logger.info(`[Supabase] Client initialized (URL: ${url.substring(0, 30)}...)`);
  return _supabase;
}

/**
 * Quick connectivity check — runs a trivial query against a known
 * Postgres catalog table. Returns true if the database responds, false
 * otherwise. Safe to call at startup without crashing the server.
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    // A lightweight query that works on any Supabase project
    const { error } = await client.from('profiles').select('id', { count: 'exact', head: true });
    // If the table doesn't exist yet, a 42P01 error is expected during
    // foundation setup — treat it as "connected but tables not created".
    if (error && error.code !== '42P01' && error.code !== 'PGRST116') {
      logger.warn(`[Supabase] Connection check warning: ${error.message}`);
      return false;
    }
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.warn(`[Supabase] Connection check failed: ${message}`);
    return false;
  }
}
