import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = { id: 'mock-user-123', email: 'farmer@bharatfarm.org', role: 'farmer' };
    return next();
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return ApiResponse.error(res, 'Authentication token missing', 'UNAUTHORIZED', 401);
  }

  req.user = { id: 'mock-user-123', email: 'farmer@bharatfarm.org', role: 'farmer' };
  next();
};
