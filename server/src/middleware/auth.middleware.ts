import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { config } from '../config/env.js';
import { getSupabaseClient } from '../config/supabase.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  state?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Express middleware to authenticate requests using Supabase JWT Access Tokens.
 * Reads `Authorization: Bearer <token>` and verifies identity with Supabase.
 * In MOCK MODE (`USE_MOCK_DATA=true`), falls back to mock user context.
 */
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // MOCK MODE FALLBACK
  if (config.useMockData) {
    if (!authHeader) {
      req.user = { id: 'mock-user-123', email: 'farmer@bharatfarm.org', role: 'farmer', fullName: 'Ramesh Patel', state: 'Punjab' };
      return next();
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return ApiResponse.error(res, 'Authentication token missing', 'UNAUTHORIZED', 401);
    }
    req.user = { id: 'mock-user-123', email: 'farmer@bharatfarm.org', role: 'farmer', fullName: 'Ramesh Patel', state: 'Punjab' };
    return next();
  }

  // REAL SUPABASE AUTHENTICATION
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.error(res, 'Authorization header missing or invalid format', 'UNAUTHORIZED', 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return ApiResponse.error(res, 'Authentication token missing', 'UNAUTHORIZED', 401);
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return ApiResponse.error(res, 'Supabase authentication service unavailable', 'SERVER_ERROR', 500);
  }

  try {
    // Verify token with Supabase Auth (DO NOT use unverified jwt.decode)
    const { data: { user: authUser }, error: verifyError } = await supabase.auth.getUser(token);

    if (verifyError || !authUser) {
      return ApiResponse.error(res, 'Invalid or expired access token', 'UNAUTHORIZED', 401);
    }

    // Fetch corresponding profile for role & full name context
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, state')
      .eq('id', authUser.id)
      .single();

    req.user = {
      id: authUser.id,
      email: authUser.email || '',
      role: profile?.role || (authUser.user_metadata?.role as string) || 'farmer',
      fullName: profile?.full_name || authUser.user_metadata?.full_name,
      state: profile?.state
    };

    return next();
  } catch (err: any) {
    return ApiResponse.error(res, 'Failed to authenticate user identity', 'UNAUTHORIZED', 401);
  }
};
