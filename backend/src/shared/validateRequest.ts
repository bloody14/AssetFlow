import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './appError';
import { HTTP_STATUS } from '../constants/httpStatus';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const zodError = error as ZodError<any>;
        next(
          new AppError(
            'Invalid request data',
            HTTP_STATUS.BAD_REQUEST,
            'VALIDATION_ERROR',
            zodError.issues
          )
        );
      } else {
        next(error);
      }
    }
  };
};
