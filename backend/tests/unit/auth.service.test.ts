import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../src/modules/auth/services/auth.service';
import { IAuthRepository } from '../../src/modules/auth/repositories/auth.repository.interface';
import { IUserRepository } from '../../src/modules/user/repositories/user.repository.interface';
import { DomainSessionStatus } from '../../src/modules/auth/types/auth.types';
import * as passwordUtils from '../../src/shared/password';
import { mock } from 'vitest-mock-extended';

vi.mock('../../src/shared/password', () => ({
  comparePassword: vi.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockAuthRepo: import('vitest-mock-extended').MockProxy<IAuthRepository>;
  let mockUserRepo: import('vitest-mock-extended').MockProxy<IUserRepository>;

  beforeEach(() => {
    mockAuthRepo = mock<IAuthRepository>();
    mockUserRepo = mock<IUserRepository>();
    authService = new AuthService(mockAuthRepo, mockUserRepo);
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should throw AppError if user does not exist', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'test@test.com', password: 'password', ipAddress: '127.0.0.1', userAgent: 'test' })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw AppError if password does not match', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash: 'hash', status: 'ACTIVE' } as any);
      (passwordUtils.comparePassword as any).mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@test.com', password: 'wrongpassword', ipAddress: '127.0.0.1', userAgent: 'test' })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should return tokens for valid login', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash: 'hash', status: 'ACTIVE', role: 'ADMIN' } as any);
      (passwordUtils.comparePassword as any).mockResolvedValue(true);
      mockAuthRepo.createSession.mockResolvedValue({ id: 'session1' } as any);

      const result = await authService.login({ email: 'test@test.com', password: 'password', ipAddress: '127.0.0.1', userAgent: 'test' });
      
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw AppError if account is inactive', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash: 'hash', status: 'INACTIVE', role: 'ADMIN' } as any);

      await expect(
        authService.login({ email: 'test@test.com', password: 'password', ipAddress: '127.0.0.1', userAgent: 'test' })
      ).rejects.toThrow('Account is locked or inactive');
    });
  });

  describe('logout', () => {
    it('should revoke session', async () => {
      mockAuthRepo.revokeSession.mockResolvedValue(undefined);
      await authService.logout('session1');
      expect(mockAuthRepo.revokeSession).toHaveBeenCalledWith('session1', 'User initiated logout', 'USER');
    });
  });

  describe('logoutAll', () => {
    it('should revoke all sessions', async () => {
      mockAuthRepo.revokeAllUserSessions.mockResolvedValue(undefined);
      await authService.logoutAll('user1');
      expect(mockAuthRepo.revokeAllUserSessions).toHaveBeenCalledWith('user1', 'User initiated global logout', 'USER');
    });
  });

  describe('refreshToken', () => {
    it('should throw AppError on invalid session', async () => {
      mockAuthRepo.findSessionByRefreshHash.mockResolvedValue(null);
      await expect(authService.refreshToken('token', '127.0.0.1')).rejects.toThrow('Invalid token');
    });

    it('should throw AppError on revoked session (replay attack)', async () => {
      mockAuthRepo.findSessionByRefreshHash.mockResolvedValue({ status: DomainSessionStatus.REVOKED } as any);
      await expect(authService.refreshToken('token', '127.0.0.1')).rejects.toThrow('Token compromised');
    });

    it('should throw AppError on expired session', async () => {
      mockAuthRepo.findSessionByRefreshHash.mockResolvedValue({ status: DomainSessionStatus.ACTIVE, expiresAt: new Date(Date.now() - 10000) } as any);
      await expect(authService.refreshToken('token', '127.0.0.1')).rejects.toThrow('Token expired');
    });

    it('should throw AppError if user is inactive during refresh', async () => {
      mockAuthRepo.findSessionByRefreshHash.mockResolvedValue({ status: DomainSessionStatus.ACTIVE, expiresAt: new Date(Date.now() + 10000), userId: '1' } as any);
      mockUserRepo.findById.mockResolvedValue({ id: '1', status: 'INACTIVE' } as any);
      await expect(authService.refreshToken('token', '127.0.0.1')).rejects.toThrow('Account is locked or inactive');
    });

    it('should return new tokens on successful refresh', async () => {
      mockAuthRepo.findSessionByRefreshHash.mockResolvedValue({ id: 'session1', status: DomainSessionStatus.ACTIVE, expiresAt: new Date(Date.now() + 10000), userId: '1', version: 1 } as any);
      mockUserRepo.findById.mockResolvedValue({ id: '1', status: 'ACTIVE', role: 'ADMIN' } as any);
      mockAuthRepo.rotateRefreshToken.mockResolvedValue({ id: 'session1' } as any);
      const result = await authService.refreshToken('token', '127.0.0.1');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });
});
