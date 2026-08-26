import { Router } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { config } from '../config/env.js';
import { getSupabaseClient } from '../config/supabase.js';

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
    return ApiResponse.success(res, {
      token: 'mock-jwt-token-12345',
      user: {
        id: 'mock-user-new',
        email,
        role,
        fullName,
        phone,
        state
      }
    }, 'Registration successful (Mock Mode)');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return ApiResponse.error(res, 'Supabase auth service is not configured', 'SERVER_ERROR', 500);
  }

  try {
    // 1. Sign up user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role
        }
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return ApiResponse.error(res, 'An account with this email already exists', 'DUPLICATE_EMAIL', 409);
      }
      return ApiResponse.error(res, authError.message, 'AUTH_ERROR', 400);
    }

    if (!authData.user) {
      return ApiResponse.error(res, 'Failed to create user account', 'AUTH_ERROR', 500);
    }

    const userId = authData.user.id;

    // 2. Ensure linked profile exists in public.profiles (upsert safely)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        email,
        role,
        phone_number: phone || null,
        state,
        district: district || null
      })
      .select()
      .single();

    if (profileError) {
      // Return clear error without leaking raw DB details
      return ApiResponse.error(res, 'Account created, but profile initialization failed. Please contact support.', 'PROFILE_ERROR', 500);
    }

    const session = authData.session;
    return ApiResponse.success(res, {
      token: session?.access_token || '',
      refreshToken: session?.refresh_token || '',
      user: {
        id: userId,
        email: profile.email,
        role: profile.role,
        fullName: profile.full_name,
        phone: profile.phone_number || undefined,
        state: profile.state || undefined
      }
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
    return ApiResponse.success(res, {
      token: 'mock-jwt-token-12345',
      user: {
        id: 'mock-user-123',
        fullName: 'Ramesh Patel',
        email,
        role: 'farmer',
        state: 'Punjab'
      }
    }, 'Login successful (Mock Mode)');
  }

  if (!password) {
    return ApiResponse.error(res, 'Password is required', 'VALIDATION_ERROR', 400);
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return ApiResponse.error(res, 'Supabase auth service is not configured', 'SERVER_ERROR', 500);
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

    // Fetch corresponding profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const userObj = {
      id: userId,
      email: authData.user.email || email,
      role: profile?.role || 'farmer',
      fullName: profile?.full_name || authData.user.user_metadata?.full_name || email.split('@')[0],
      phone: profile?.phone_number || undefined,
      state: profile?.state || undefined
    };

    return ApiResponse.success(res, {
      token: authData.session.access_token,
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
  if (!supabase) {
    return ApiResponse.error(res, 'Supabase auth service is not configured', 'SERVER_ERROR', 500);
  }

  try {
    // Verify token with Supabase
    const { data: { user: authUser }, error: getUserError } = await supabase.auth.getUser(token);

    if (getUserError || !authUser) {
      return ApiResponse.error(res, 'Invalid or expired access token', 'UNAUTHORIZED', 401);
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    return ApiResponse.success(res, {
      user: {
        id: authUser.id,
        email: authUser.email || '',
        role: profile?.role || 'farmer',
        fullName: profile?.full_name || authUser.user_metadata?.full_name || '',
        phone: profile?.phone_number || undefined,
        state: profile?.state || undefined
      }
    });
  } catch (err: any) {
    return ApiResponse.error(res, 'Failed to authenticate user', 'UNAUTHORIZED', 401);
  }
});

export default router;
