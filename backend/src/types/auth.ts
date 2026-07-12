export interface JwtPayload {
  sub: string; // Subject (userId)
  role: string; // Custom claim
  sid: string; // Session ID
  type: 'access'; // Token type
  amr?: string[]; // Authentication Methods Reference (e.g., ['pwd', 'mfa'])
  provider?: string; // e.g., 'local', 'google'

  // Standard claims (will be populated by jsonwebtoken)
  jti?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId?: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface SessionInfo {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent?: string;
  deviceId?: string;
  lastActiveAt: Date;
  attemptTime: Date;
  isRevoked: boolean;
}

export interface IUserPayload extends AuthenticatedUser {
  sessionId: string;
}
