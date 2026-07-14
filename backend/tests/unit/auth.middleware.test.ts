import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireRole, authenticate, optionalAuth, getCurrentUser } from '../../src/modules/auth/middlewares/auth.middleware';
import { Request, Response, NextFunction } from 'express';
import { ROLES } from '../../src/constants/roles';
import * as jwtUtils from '../../src/shared/jwt';
import { IUserRepository } from '../../src/modules/user/repositories/user.repository.interface';
import { mock } from 'vitest-mock-extended';

vi.mock('../../src/shared/jwt', () => ({
  verifyAccessToken: vi.fn(),
}));

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction;
  let mockUserRepo: import('vitest-mock-extended').MockProxy<IUserRepository>;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    nextFunction = vi.fn();
    mockUserRepo = mock<IUserRepository>();
    vi.clearAllMocks();
  });

  describe('requireRole', () => {
    it('should throw Unauthorized if user is not set on req', () => {
      const middleware = requireRole(ROLES.ADMIN);
      middleware(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      const error = (nextFunction as any).mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });

    it('should throw Forbidden if user role is insufficient', () => {
      mockReq.user = { id: '1', role: ROLES.EMPLOYEE } as any;
      const middleware = requireRole(ROLES.ADMIN);
      middleware(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      const error = (nextFunction as any).mock.calls[0][0];
      expect(error.statusCode).toBe(403);
    });

    it('should call next() if role matches', () => {
      mockReq.user = { id: '1', role: ROLES.ADMIN } as any;
      const middleware = requireRole(ROLES.ADMIN, ROLES.EMPLOYEE);
      middleware(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledWith();
    });
  });

  describe('authenticate', () => {
    it('should throw if no token provided', async () => {
      const middleware = authenticate(mockUserRepo);
      await middleware(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      const error = (nextFunction as any).mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });

    it('should authenticate valid token', async () => {
      mockReq.headers = { authorization: 'Bearer valid-token' };
      (jwtUtils.verifyAccessToken as any).mockReturnValue({ type: 'access', sub: '123', sid: 'sid' });
      mockUserRepo.findById.mockResolvedValue({ id: '123', status: 'ACTIVE', role: 'ADMIN' } as any);

      const middleware = authenticate(mockUserRepo);
      await middleware(mockReq as Request, mockRes as Response, nextFunction);

      expect(mockReq.user).toBeDefined();
      expect(mockReq.user?.id).toBe('123');
      expect(nextFunction).toHaveBeenCalledWith();
    });
  });

  describe('optionalAuth', () => {
    it('should call next if no token provided', async () => {
      const middleware = optionalAuth(mockUserRepo);
      await middleware(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockReq.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalledWith();
    });
  });

  describe('getCurrentUser', () => {
    it('should throw if not authenticated', () => {
      expect(() => getCurrentUser(mockReq as Request)).toThrow();
    });

    it('should return user if authenticated', () => {
      mockReq.user = { id: '1' } as any;
      expect(getCurrentUser(mockReq as Request)).toEqual({ id: '1' });
    });
  });
});
