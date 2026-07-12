import { Request, Response, NextFunction } from 'express';
import { AppError } from './appError';
import { sendError } from './response';
import { HTTP_STATUS } from '../constants/httpStatus';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message, err.details);
  }
  
  console.error('[Unhandled Error]', err);
  return sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred');
};
