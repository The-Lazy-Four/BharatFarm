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
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (_supabase) return _supabase;

  const url = config.supabase.url;
  const key = config.supabase.anonKey || config.supabase.serviceRoleKey;

  if (!url || !key) {
    logger.warn('[Supabase] URL or Key not configured — database operations will be unavailable.');
    return null;
  }

  _supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _supabase;
}

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (_supabaseAdmin) return _supabaseAdmin;

  const url = config.supabase.url;
  const serviceKey = config.supabase.serviceRoleKey;

  if (!url || !serviceKey) {
    logger.warn('[Supabase Admin] SUPABASE_SERVICE_ROLE_KEY is missing — administrative actions will fail or fallback to client key.');
    return getSupabaseClient();
  }

  _supabaseAdmin = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _supabaseAdmin;
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
