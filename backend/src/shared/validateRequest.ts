import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from './appError';
import { HTTP_STATUS } from '../constants/httpStatus';

export const validateRequest = (schema: AnyZodObject) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError('Invalid request data', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR', error.errors));
      } else {
        next(error);
      }
    }
  };
};
