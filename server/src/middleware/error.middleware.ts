import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : err.message || 'An unexpected error occurred';

  return ApiResponse.error(res, message, errorCode, statusCode, err.details);
};
