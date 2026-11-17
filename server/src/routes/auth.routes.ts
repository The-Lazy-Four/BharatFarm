import { Router } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { config } from '../config/env.js';
import { getSupabaseClient, getSupabaseAdminClient } from '../config/supabase.js';
import { signJwtToken, verifyJwtToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * POST /api/auth/register
 * Register a user via Supabase Auth & create a linked record in public.profiles.
 */
router.post('/register', async (req, res) => {
  const { email, password, fullName, phone, role = 'farmer', state = 'Punjab', district } = req.body;

  if (!email || !password || !fullName) {
    return ApiResponse.error(res, 'Email, password, and full name are required', 'VALIDATION_ERROR', 400);
  }

  if (password.length < 6) {
    return ApiResponse.error(res, 'Password must be at least 6 characters long', 'VALIDATION_ERROR', 400);
  }

  // MOCK MODE FALLBACK
  if (config.useMockData) {
    const mockUser = {
      id: `user-${Date.now()}`,
      email,
      role,
      fullName,
      phone,
      state,
      district
    };
    const token = signJwtToken(mockUser);
    return ApiResponse.success(res, {
      accessToken: token,
      user: mockUser
    }, 'Registration successful (Mock Mode)');
  }

  const supabase = getSupabaseClient();
  const supabaseAdmin = getSupabaseAdminClient();

  if (!supabase || !supabaseAdmin || !config.supabase.serviceRoleKey) {
    return ApiResponse.error(res, 'Authentication service is not fully configured', 'AUTH_CONFIGURATION_ERROR', 503);
  }

  try {
    // This endpoint is server-side only. The secret key creates a confirmed
    // Auth user and is never included in the client bundle.
    const { data: createdUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role
      }
    });

    if (authError) {
      if (
        authError.message.includes('already registered') ||
        authError.message.includes('already been registered') ||
        authError.code === 'user_already_exists'
      ) {
        return ApiResponse.error(res, 'An account with this email already exists', 'DUPLICATE_EMAIL', 409);
      }
      return ApiResponse.error(res, authError.message, 'AUTH_ERROR', 400);
    }

    if (!createdUser.user) {
      return ApiResponse.error(res, 'Failed to create user account', 'AUTH_ERROR', 500);
    }

    const userId = createdUser.user.id;

    // Normalize phone field name for DB column phone
    const phoneValue = phone || null;

    // 2. Ensure linked profile exists in public.profiles using admin client (bypasses RLS during registration)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        email,
        role,
        phone: phoneValue,
        state,
        district: district || null
      })
      .select()
      .single();

    if (profileError) {
      // Avoid retaining a partially-created account when profile creation fails.
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
      logger.error('[Auth] Profile creation failed', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details
      });
      return ApiResponse.error(
        res,
        'Account registration could not create its profile. Please try again.',
        'PROFILE_ERROR',
        500,
        config.env === 'development'
          ? { databaseCode: profileError.code || 'UNKNOWN' }
          : undefined
      );
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({ email, password });
    if (sessionError || !sessionData.session) {
      return ApiResponse.error(res, 'Account created, but sign-in could not be completed. Please sign in again.', 'SESSION_ERROR', 500);
    }

    const userObj = {
      id: userId,
      email: profile.email,
      role: profile.role,
      fullName: profile.full_name,
      phone: profile.phone || undefined,
      state: profile.state || undefined,
      district: profile.district || undefined
    };

    const token = signJwtToken(userObj);

    return ApiResponse.success(res, {
      accessToken: token,
      refreshToken: sessionData.session.refresh_token,
      user: userObj
    }, 'Registration successful');
  } catch (err: any) {
    return ApiResponse.error(res, err?.message || 'Unexpected server error during registration', 'SERVER_ERROR', 500);
  }
});

/**
 * POST /api/auth/login
 * Login user via Supabase Auth & return user profile + access token.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return ApiResponse.error(res, 'Email address is required', 'VALIDATION_ERROR', 400);
  }

  // MOCK MODE FALLBACK
  if (config.useMockData) {
    const mockUser = {
      id: 'mock-user-123',
      fullName: 'Ramesh Patel',
      email,
      role: 'farmer',
      state: 'Punjab'
    };
    const token = signJwtToken(mockUser);
    return ApiResponse.success(res, {
      accessToken: token,
      user: mockUser
    }, 'Login successful (Mock Mode)');
  }

  if (!password) {
    return ApiResponse.error(res, 'Password is required', 'VALIDATION_ERROR', 400);
  }

  const supabase = getSupabaseClient();
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabase || !supabaseAdmin || !config.supabase.serviceRoleKey) {
    return ApiResponse.error(res, 'Authentication service is not fully configured', 'AUTH_CONFIGURATION_ERROR', 503);
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return ApiResponse.error(res, 'Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    if (!authData.user || !authData.session) {
      return ApiResponse.error(res, 'Authentication failed', 'AUTH_ERROR', 401);
    }

    const userId = authData.user.id;

    // Profile reads occur on the secure backend. The regular client is
    // anonymous here and is correctly restricted by profiles RLS.
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      return ApiResponse.error(res, 'Unable to load the user profile', 'PROFILE_LOOKUP_ERROR', 503);
    }
    if (!profile) {
      return ApiResponse.error(res, 'Your account profile is missing. Please contact support.', 'PROFILE_NOT_FOUND', 409);
    }

    const userObj = {
      id: userId,
      email: authData.user.email || email,
      role: profile.role || 'farmer',
      fullName: profile.full_name || authData.user.user_metadata?.full_name || email.split('@')[0],
      phone: profile.phone || undefined,
      state: profile.state || undefined,
      district: profile.district || undefined
    };

    const token = signJwtToken(userObj);

    return ApiResponse.success(res, {
      accessToken: token,
      refreshToken: authData.session.refresh_token,
      user: userObj
    }, 'Login successful');
  } catch (err: any) {
    return ApiResponse.error(res, err?.message || 'Unexpected server error during login', 'SERVER_ERROR', 500);
  }
});

/**
 * GET /api/auth/me
 * Fetch authenticated user's current session & profile.
 */
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.error(res, 'Authorization token missing', 'UNAUTHORIZED', 401);
  }

  const token = authHeader.split(' ')[1];

  // 1. Verify custom JWT token first
  const jwtUser = verifyJwtToken(token);
  if (jwtUser) {
    return ApiResponse.success(res, {
      user: {
        id: jwtUser.id,
        email: jwtUser.email,
        role: jwtUser.role || 'farmer',
        fullName: jwtUser.fullName || '',
        phone: jwtUser.phone,
        state: jwtUser.state,
        district: jwtUser.district
      }
    });
  }

  if (config.useMockData) {
    return ApiResponse.success(res, {
      user: {
        id: 'mock-user-123',
        fullName: 'Ramesh Patel',
        email: 'farmer@bharatfarm.org',
        role: 'farmer',
        state: 'Punjab'
      }
    });
  }

  const supabase = getSupabaseClient();
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabase || !supabaseAdmin || !config.supabase.serviceRoleKey) {
    return ApiResponse.error(res, 'Authentication service is not fully configured', 'AUTH_CONFIGURATION_ERROR', 503);
  }

  try {
    // Verify token with Supabase
    const { data: { user: authUser }, error: getUserError } = await supabase.auth.getUser(token);

    if (getUserError || !authUser) {
      return ApiResponse.error(res, 'Invalid or expired access token', 'UNAUTHORIZED', 401);
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profileError) {
      return ApiResponse.error(res, 'Unable to load the user profile', 'PROFILE_LOOKUP_ERROR', 503);
    }
    if (!profile) {
      return ApiResponse.error(res, 'Your account profile is missing. Please contact support.', 'PROFILE_NOT_FOUND', 409);
    }

    return ApiResponse.success(res, {
      user: {
        id: authUser.id,
        email: authUser.email || '',
        role: profile.role || 'farmer',
        fullName: profile.full_name || authUser.user_metadata?.full_name || '',
        phone: profile.phone || undefined,
        state: profile.state || undefined,
        district: profile.district || undefined
      }
    });
  } catch (err: any) {
    return ApiResponse.error(res, 'Failed to authenticate user', 'UNAUTHORIZED', 401);
  }
});

export default router;
