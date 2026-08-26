import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import authRoutes from '../src/routes/auth.routes.js';
import { authenticateToken, AuthenticatedRequest } from '../src/middleware/auth.middleware.js';

describe('Auth Middleware & Endpoint Contract Tests', () => {
  it('authenticateToken middleware rejects requests without Bearer header when mock mode is disabled', async () => {
    const req = {
      headers: {}
    } as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;

    const next = vi.fn();

    // Force non-mock mode check for middleware test
    const { config } = await import('../src/config/env.js');
    const originalMockSetting = config.useMockData;
    (config as any).useMockData = false;

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({ code: 'UNAUTHORIZED' })
    }));

    (config as any).useMockData = originalMockSetting;
  });

  it('authRoutes registration requires mandatory email, password, and fullName', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);

    const { config } = await import('../src/config/env.js');
    const originalMockSetting = config.useMockData;
    (config as any).useMockData = false;

    // Test missing fields via handler directly
    const req = {
      body: { email: 'test@example.com' }
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;

    // Call route logic
    const layer = (authRoutes as any).stack.find((s: any) => s.route?.path === '/register');
    await layer.route.stack[0].handle(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({ code: 'VALIDATION_ERROR' })
    }));

    (config as any).useMockData = originalMockSetting;
  });
});
