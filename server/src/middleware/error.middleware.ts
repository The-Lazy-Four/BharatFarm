import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`[Server Error] Path: ${req.originalUrl || req.path} | Error: ${err.message}`, { stack: err.stack, query: req.query });

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';

  return ApiResponse.error(res, message, errorCode, statusCode, err.details);
};
