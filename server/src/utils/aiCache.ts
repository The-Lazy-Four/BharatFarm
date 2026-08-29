import crypto from 'crypto';
import { logger } from './logger.js';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * Server-side AI response cache to avoid redundant calls to OpenRouter.
 */
export class AiCache {
  private static cache = new Map<string, CacheEntry<any>>();

  /**
   * Create a deterministic fingerprint for feature + context
   */
  static createFingerprint(feature: string, context: Record<string, any>): string {
    const sortedKeys = Object.keys(context).sort();
    const normalizedObj: Record<string, any> = {};
    for (const key of sortedKeys) {
      const val = context[key];
      if (val !== undefined && val !== null && val !== '') {
        normalizedObj[key] = typeof val === 'string' ? val.trim().toLowerCase() : val;
      }
    }
    const str = JSON.stringify({ feature, context: normalizedObj });
    return crypto.createHash('md5').update(str).digest('hex');
  }

  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    logger.info(`[AiCache] Cache HIT for key: ${key.slice(0, 10)}...`);
    return entry.data as T;
  }

  static set<T>(key: string, data: T, ttlMs: number): void {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { data, expiresAt });
    logger.info(`[AiCache] Cached response for key: ${key.slice(0, 10)}... (TTL: ${ttlMs / 1000}s)`);
  }

  static clear(): void {
    this.cache.clear();
  }
}
