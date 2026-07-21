import { Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';
import { asyncLocalStorage } from './logger';

export const sendSuccess = (res: Response, message: string, data?: unknown) => {
  return res.status(HTTP_STATUS.OK).json({ success: true, message, data });
};

export const sendPaginatedSuccess = (
  res: Response,
  message: string,
  data: unknown,
  meta: { total: number; page: number; limit: number; totalPages: number }
) => {
  return res.status(HTTP_STATUS.OK).json({ success: true, message, data, meta });
};

export const sendCreated = (res: Response, message: string, data?: unknown) => {
  return res.status(HTTP_STATUS.CREATED).json({ success: true, message, data });
};

export const sendNoContent = (res: Response) => {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
};

export const sendError = (
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
) => {
  const context = asyncLocalStorage.getStore();
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: details || null,
      correlationId: context?.correlationId || null,
    },
  });
};
