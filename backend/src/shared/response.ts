import { Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';

export const sendSuccess = (res: Response, message: string, data?: unknown) => {
  return res.status(HTTP_STATUS.OK).json({ success: true, message, data });
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
  return res.status(statusCode).json({
    success: false,
    error: { code, message, details: details || null },
  });
};
