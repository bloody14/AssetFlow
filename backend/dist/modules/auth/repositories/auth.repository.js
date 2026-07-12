"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAuthRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PrismaAuthRepository {
    mapToDomain(session) {
        return {
            ...session,
            status: session.status,
            revokedBy: session.revokedBy ? session.revokedBy : null,
        };
    }
    async createSession(data) {
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
    async findSessionById(sessionId) {
        const session = await prisma.session.findUnique({ where: { id: sessionId } });
        return session ? this.mapToDomain(session) : null;
    }
    async findSessionByRefreshHash(hash) {
        const session = await prisma.session.findUnique({ where: { refreshTokenHash: hash } });
        return session ? this.mapToDomain(session) : null;
    }
    async revokeSession(sessionId, reason, revokedBy) {
        const result = await prisma.session.updateMany({
            where: { id: sessionId, status: client_1.SessionStatus.ACTIVE },
            data: {
                status: client_1.SessionStatus.REVOKED,
                revokedAt: new Date(),
                revokeReason: reason,
                revokedBy: revokedBy,
            },
        });
        return result.count > 0;
    }
    async revokeTokenFamily(tokenFamily, reason, revokedBy) {
        const result = await prisma.session.updateMany({
            where: {
                tokenFamily,
                status: {
                    notIn: [client_1.SessionStatus.REVOKED, client_1.SessionStatus.COMPROMISED, client_1.SessionStatus.ARCHIVED],
                },
            },
            data: {
                status: client_1.SessionStatus.COMPROMISED,
                revokedAt: new Date(),
                revokeReason: reason,
                revokedBy: revokedBy,
            },
        });
        return result.count;
    }
    async revokeAllUserSessions(userId, reason, revokedBy) {
        const result = await prisma.session.updateMany({
            where: { userId, status: client_1.SessionStatus.ACTIVE },
            data: {
                status: client_1.SessionStatus.REVOKED,
                revokedAt: new Date(),
                revokeReason: reason,
                revokedBy: revokedBy,
            },
        });
        return result.count;
    }
    async updateLastActivity(sessionId) {
        await prisma.session.updateMany({
            where: { id: sessionId, status: client_1.SessionStatus.ACTIVE },
            data: { lastActiveAt: new Date() },
        });
    }
    async rotateRefreshToken(sessionId, newHash, newExpiresAt, currentVersion) {
        try {
            const session = await prisma.session.update({
                where: { id: sessionId, version: currentVersion, status: client_1.SessionStatus.ACTIVE },
                data: {
                    refreshTokenHash: newHash,
                    expiresAt: newExpiresAt,
                    refreshCounter: { increment: 1 },
                    lastRefreshAt: new Date(),
                    version: { increment: 1 },
                },
            });
            return this.mapToDomain(session);
        }
        catch (error) {
            if (typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === 'P2025') {
                throw new Error('Optimistic concurrency failure: Session not found, inactive, or version mismatch');
            }
            throw error;
        }
    }
    async cleanupExpiredSessions(retentionDays) {
        const now = new Date();
        // 1. Mark ACTIVE sessions as EXPIRED if past their expiration date
        await prisma.session.updateMany({
            where: { status: client_1.SessionStatus.ACTIVE, expiresAt: { lt: now } },
            data: { status: client_1.SessionStatus.EXPIRED },
        });
        // 2. Archive sessions that have passed the retention window
        const cutoffDate = new Date();
        cutoffDate.setDate(now.getDate() - retentionDays);
        const result = await prisma.session.updateMany({
            where: {
                status: { in: [client_1.SessionStatus.EXPIRED, client_1.SessionStatus.REVOKED, client_1.SessionStatus.COMPROMISED] },
                updatedAt: { lt: cutoffDate },
            },
            data: {
                status: client_1.SessionStatus.ARCHIVED,
            },
        });
        return result.count;
    }
}
exports.PrismaAuthRepository = PrismaAuthRepository;
