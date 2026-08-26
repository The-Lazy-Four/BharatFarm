import { config } from './env.js';
import { logger } from '../utils/logger.js';
import { checkSupabaseConnection } from './supabase.js';

export const connectDatabase = async (): Promise<void> => {
  if (config.useMockData) {
    logger.info('[DATABASE] Operating in MOCK DATA mode. No physical database connection required.');
    return;
  }

  // Attempt Supabase connectivity check (non-blocking — failure does not
  // prevent server startup so that existing features continue to work).
  const isConnected = await checkSupabaseConnection();
  if (isConnected) {
    logger.info('[DATABASE] Supabase connection verified.');
  } else {
    logger.warn('[DATABASE] Supabase connection unavailable — features requiring database will fall back to in-memory/mock data.');
  }

  logger.info('[DATABASE] Database initialization checked.');
};
