import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Request successful', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      message
    });
  }

  static error(res: Response, message = 'An error occurred', code = 'INTERNAL_ERROR', statusCode = 500, details?: any) {
    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        details
      }
    });
  }
}
