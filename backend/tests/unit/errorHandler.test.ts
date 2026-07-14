import { describe, it, expect, vi } from 'vitest';
import { errorHandler } from '../../src/shared/errorHandler';
import { AppError } from '../../src/shared/appError';
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../../src/constants/httpStatus';

describe('Error Handler Middleware', () => {
  it('should format AppError correctly', () => {
    const mockReq = {} as Request;
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const mockNext = vi.fn() as NextFunction;

    const error = new AppError('Resource not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: expect.objectContaining({
        code: 'NOT_FOUND',
        message: 'Resource not found',
        correlationId: null,
      }),
    });
  });

  it('should format unhandled errors as 500', () => {
    const mockReq = {} as Request;
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const mockNext = vi.fn() as NextFunction;

    const error = new Error('Unexpected database failure');

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: expect.objectContaining({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      }),
    });
  });
});
