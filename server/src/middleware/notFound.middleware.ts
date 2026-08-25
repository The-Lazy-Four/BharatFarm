import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';

export const notFoundHandler = (req: Request, res: Response) => {
  return ApiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND', 404);
};
