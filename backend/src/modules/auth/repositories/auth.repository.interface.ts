import { CreateSessionDTO, SessionDomain, DomainRevokedBy } from '../types/auth.types';

export interface IAuthRepository {
  createSession(data: CreateSessionDTO): Promise<SessionDomain>;
  findSessionById(sessionId: string): Promise<SessionDomain | null>;
  findSessionByRefreshHash(hash: string): Promise<SessionDomain | null>;
  revokeSession(sessionId: string, reason: string, revokedBy: DomainRevokedBy): Promise<boolean>;
  revokeTokenFamily(
    tokenFamily: string,
    reason: string,
    revokedBy: DomainRevokedBy
  ): Promise<number>;
  revokeAllUserSessions(
    userId: string,
    reason: string,
    revokedBy: DomainRevokedBy
  ): Promise<number>;
  updateLastActivity(sessionId: string): Promise<void>;
  rotateRefreshToken(
    sessionId: string,
    newHash: string,
    newExpiresAt: Date,
    currentVersion: number
  ): Promise<SessionDomain>;
  cleanupExpiredSessions(retentionDays: number): Promise<number>;
}
