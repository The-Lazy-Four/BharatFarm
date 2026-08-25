import { Router } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

router.post('/login', (req, res) => {
  return ApiResponse.success(res, {
    token: 'mock-jwt-token-12345',
    user: {
      id: 'mock-user-123',
      fullName: 'Ramesh Patel',
      email: req.body.email || 'farmer@bharatfarm.org',
      role: 'farmer'
    }
  }, 'Login successful (Mock)');
});

router.post('/register', (req, res) => {
  return ApiResponse.success(res, {
    token: 'mock-jwt-token-12345',
    user: {
      id: 'mock-user-new',
      fullName: req.body.fullName || 'New Farmer',
      email: req.body.email || 'newfarmer@bharatfarm.org',
      role: 'farmer'
    }
  }, 'Registration successful (Mock)');
});

export default router;
