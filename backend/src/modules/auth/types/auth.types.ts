export enum DomainSessionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
  COMPROMISED = 'COMPROMISED',
  ARCHIVED = 'ARCHIVED',
}

export enum DomainRevokedBy {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM',
  SECURITY_ENGINE = 'SECURITY_ENGINE',
}

export interface CreateSessionDTO {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
}

export interface SessionDomain {
  id: string;
  userId: string;
  refreshTokenHash: string;
  tokenFamily: string;
  status: DomainSessionStatus;
  refreshCounter: number;
  lastRefreshAt: Date | null;
  deviceId: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  lastActiveAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  revokeReason: string | null;
  revokedBy: DomainRevokedBy | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
