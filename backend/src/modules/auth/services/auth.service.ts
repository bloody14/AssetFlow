import { IAuthService, LoginDTO } from './auth.service.interface';
import { IAuthRepository } from '../repositories/auth.repository.interface';
import { IUserRepository } from '../../user/repositories/user.repository.interface';
import { TokenPair } from '../../../types/auth';
import { AppError } from '../../../shared/appError';
import { HTTP_STATUS } from '../../../constants/httpStatus';
import { AUTH_CONSTANTS } from '../../../constants/auth';
import { comparePassword } from '../../../shared/password';
import { generateAccessToken } from '../../../shared/jwt';
import { generateRefreshToken, hashRefreshToken } from '../../../shared/refreshToken';
import { DomainSessionStatus, DomainRevokedBy } from '../types/auth.types';

export class AuthService implements IAuthService {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async login(dto: LoginDTO): Promise<TokenPair> {
    // 1. Identify User
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new AppError(
        'Invalid credentials',
        HTTP_STATUS.UNAUTHORIZED,
        AUTH_CONSTANTS.ERRORS.INVALID_CREDENTIALS
      );
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError(
        'Account is locked or inactive',
        HTTP_STATUS.FORBIDDEN,
        AUTH_CONSTANTS.ERRORS.ACCOUNT_LOCKED
      );
    }

    // 2. Authenticate
    const isValid = await comparePassword(dto.password, user.passwordHash);
    if (!isValid) {
      throw new AppError(
        'Invalid credentials',
        HTTP_STATUS.UNAUTHORIZED,
        AUTH_CONSTANTS.ERRORS.INVALID_CREDENTIALS
      );
    }

    // 3. Generate Cryptographically Secure Refresh Token
    const rawRefreshToken = generateRefreshToken();
    const hashedRefreshToken = hashRefreshToken(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + AUTH_CONSTANTS.TOKEN_EXPIRATION.REFRESH_TOKEN_MS);

    // 4. Establish Persistent Session
    const session = await this.authRepository.createSession({
      userId: user.id,
      refreshTokenHash: hashedRefreshToken,
      expiresAt,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
    });

    // 5. Generate Access Token (JWT)
    const accessToken = generateAccessToken({
      sub: user.id,
      role: user.role,
      sid: session.id,
      type: 'access',
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  async refreshToken(refreshToken: string, _ipAddress: string): Promise<TokenPair> {
    const hashedToken = hashRefreshToken(refreshToken);
    const session = await this.authRepository.findSessionByRefreshHash(hashedToken);

    if (!session) {
      throw new AppError(
        'Invalid token',
        HTTP_STATUS.UNAUTHORIZED,
        AUTH_CONSTANTS.ERRORS.TOKEN_INVALID
      );
    }

    // Detect Replay Attacks
    if (
      session.status === DomainSessionStatus.REVOKED ||
      session.status === DomainSessionStatus.COMPROMISED
    ) {
      await this.authRepository.revokeTokenFamily(
        session.tokenFamily,
        'Replay attack detected on revoked token',
        DomainRevokedBy.SECURITY_ENGINE
      );
      throw new AppError(
        'Token compromised',
        HTTP_STATUS.UNAUTHORIZED,
        AUTH_CONSTANTS.ERRORS.TOKEN_INVALID
      );
    }

    if (session.status === DomainSessionStatus.EXPIRED || session.expiresAt < new Date()) {
      throw new AppError(
        'Token expired',
        HTTP_STATUS.UNAUTHORIZED,
        AUTH_CONSTANTS.ERRORS.TOKEN_EXPIRED
      );
    }

    // Validate User State
    const user = await this.userRepository.findById(session.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new AppError(
        'Account is locked or inactive',
        HTTP_STATUS.FORBIDDEN,
        AUTH_CONSTANTS.ERRORS.ACCOUNT_LOCKED
      );
    }

    // Token Rotation
    const newRawRefreshToken = generateRefreshToken();
    const newHashedToken = hashRefreshToken(newRawRefreshToken);
    const newExpiresAt = new Date();
    newExpiresAt.setTime(newExpiresAt.getTime() + AUTH_CONSTANTS.TOKEN_EXPIRATION.REFRESH_TOKEN_MS);

    const updatedSession = await this.authRepository.rotateRefreshToken(
      session.id,
      newHashedToken,
      newExpiresAt,
      session.version
    );

    // Issue New Access Token
    const accessToken = generateAccessToken({
      sub: user.id,
      role: user.role,
      sid: updatedSession.id,
      type: 'access',
    });

    return {
      accessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  async logout(sessionId: string, reason: string = 'User initiated logout'): Promise<void> {
    await this.authRepository.revokeSession(sessionId, reason, DomainRevokedBy.USER);
  }

  async logoutAll(userId: string, reason: string = 'User initiated global logout'): Promise<void> {
    await this.authRepository.revokeAllUserSessions(userId, reason, DomainRevokedBy.USER);
  }
}
