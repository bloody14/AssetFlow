import { PrismaClient, SessionStatus, RevokedBy } from '@prisma/client';
import { IAuthRepository } from './auth.repository.interface';
import {
  CreateSessionDTO,
  SessionDomain,
  DomainSessionStatus,
  DomainRevokedBy,
} from '../types/auth.types';
import { prisma } from '../../../config/prisma';

export class PrismaAuthRepository implements IAuthRepository {
  private mapToDomain(session: import('@prisma/client').Session): SessionDomain {
    return {
      ...session,
      status: session.status as unknown as DomainSessionStatus,
      revokedBy: session.revokedBy ? (session.revokedBy as unknown as DomainRevokedBy) : null,
    };
  }

  async createSession(data: CreateSessionDTO): Promise<SessionDomain> {
    const session = await prisma.session.create({
      data: {
        userId: data.userId,
        refreshTokenHash: data.refreshTokenHash,
        expiresAt: data.expiresAt,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        deviceId: data.deviceId,
      },
    });
    return this.mapToDomain(session);
  }

  async findSessionById(sessionId: string): Promise<SessionDomain | null> {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    return session ? this.mapToDomain(session) : null;
  }

  async findSessionByRefreshHash(hash: string): Promise<SessionDomain | null> {
    const session = await prisma.session.findUnique({ where: { refreshTokenHash: hash } });
    return session ? this.mapToDomain(session) : null;
  }

  async revokeSession(
    sessionId: string,
    reason: string,
    revokedBy: DomainRevokedBy
  ): Promise<boolean> {
    const result = await prisma.session.updateMany({
      where: { id: sessionId, status: SessionStatus.ACTIVE },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
        revokeReason: reason,
        revokedBy: revokedBy as unknown as RevokedBy,
      },
    });
    return result.count > 0;
  }

  async revokeTokenFamily(
    tokenFamily: string,
    reason: string,
    revokedBy: DomainRevokedBy
  ): Promise<number> {
    const result = await prisma.session.updateMany({
      where: {
        tokenFamily,
        status: {
          notIn: [SessionStatus.REVOKED, SessionStatus.COMPROMISED, SessionStatus.ARCHIVED],
        },
      },
      data: {
        status: SessionStatus.COMPROMISED,
        revokedAt: new Date(),
        revokeReason: reason,
        revokedBy: revokedBy as unknown as RevokedBy,
      },
    });
    return result.count;
  }

  async revokeAllUserSessions(
    userId: string,
    reason: string,
    revokedBy: DomainRevokedBy
  ): Promise<number> {
    const result = await prisma.session.updateMany({
      where: { userId, status: SessionStatus.ACTIVE },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
        revokeReason: reason,
        revokedBy: revokedBy as unknown as RevokedBy,
      },
    });
    return result.count;
  }

  async updateLastActivity(sessionId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { id: sessionId, status: SessionStatus.ACTIVE },
      data: { lastActiveAt: new Date() },
    });
  }

  async rotateRefreshToken(
    sessionId: string,
    newHash: string,
    newExpiresAt: Date,
    currentVersion: number
  ): Promise<SessionDomain> {
    try {
      const session = await prisma.session.update({
        where: { id: sessionId, version: currentVersion, status: SessionStatus.ACTIVE },
        data: {
          refreshTokenHash: newHash,
          expiresAt: newExpiresAt,
          refreshCounter: { increment: 1 },
          lastRefreshAt: new Date(),
          version: { increment: 1 },
        },
      });
      return this.mapToDomain(session);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2025'
      ) {
        throw new Error(
          'Optimistic concurrency failure: Session not found, inactive, or version mismatch'
        );
      }
      throw error;
    }
  }

  async cleanupExpiredSessions(retentionDays: number): Promise<number> {
    const now = new Date();

    // 1. Mark ACTIVE sessions as EXPIRED if past their expiration date
    await prisma.session.updateMany({
      where: { status: SessionStatus.ACTIVE, expiresAt: { lt: now } },
      data: { status: SessionStatus.EXPIRED },
    });

    // 2. Archive sessions that have passed the retention window
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - retentionDays);

    const result = await prisma.session.updateMany({
      where: {
        status: { in: [SessionStatus.EXPIRED, SessionStatus.REVOKED, SessionStatus.COMPROMISED] },
        updatedAt: { lt: cutoffDate },
      },
      data: {
        status: SessionStatus.ARCHIVED,
      },
    });

    return result.count;
  }
}
