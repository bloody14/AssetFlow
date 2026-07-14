import { describe, it, expect, vi } from 'vitest';
import { sendSuccess, sendCreated, sendNoContent } from '../../src/shared/response';
import { Response } from 'express';

describe('Response Utility', () => {
  it('sendSuccess should return 200 with data', () => {
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    sendSuccess(mockRes, 'OK', { id: 1 });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: 'OK', data: { id: 1 } });
  });

  it('sendCreated should return 201 with data', () => {
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    sendCreated(mockRes, 'Created', { id: 2 });
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: 'Created', data: { id: 2 } });
  });

  it('sendNoContent should return 204', () => {
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as Response;

    sendNoContent(mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(204);
    expect(mockRes.send).toHaveBeenCalled();
  });
});
