import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!schema) return next();
    const { error } = schema.validate ? schema.validate(req.body) : { error: null };
    if (error) {
      return ApiResponse.error(res, error.message, 'VALIDATION_ERROR', 400);
    }
    next();
  };
};
