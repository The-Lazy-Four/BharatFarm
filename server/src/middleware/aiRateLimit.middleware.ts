import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const userRateLimits = new Map<string, RateLimitRecord>();

// Clean up expired keys periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of userRateLimits.entries()) {
    if (now > record.resetTime) {
      userRateLimits.delete(key);
    }
  }
}, 60000);

/**
 * Server-side rate limiter for AI endpoints.
 * @param windowMs Time window in milliseconds (e.g. 60000 for 1 min)
 * @param maxMax Maximum allowed requests per IP/user in window
 */
export const aiRateLimiter = (windowMs: number = 60000, maxMax: number = 15) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const identifier = (req as any).user?.id || req.ip || 'anonymous';
    const key = `ai:${identifier}`;
    const now = Date.now();

    const record = userRateLimits.get(key);

    if (!record || now > record.resetTime) {
      userRateLimits.set(key, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (record.count >= maxMax) {
      logger.warn(`[RateLimit] AI request rate limit exceeded for ${identifier}`);
      ApiResponse.error(
        res,
        'Too many AI requests. Please slow down and try again in a minute.',
        'RATE_LIMIT_EXCEEDED',
        429
      );
      return;
    }

    record.count += 1;
    next();
  };
};
