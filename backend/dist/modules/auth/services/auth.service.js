"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const appError_1 = require("../../../shared/appError");
const httpStatus_1 = require("../../../constants/httpStatus");
const auth_1 = require("../../../constants/auth");
const password_1 = require("../../../shared/password");
const jwt_1 = require("../../../shared/jwt");
const refreshToken_1 = require("../../../shared/refreshToken");
const auth_types_1 = require("../types/auth.types");
class AuthService {
    authRepository;
    userRepository;
    constructor(authRepository, userRepository) {
        this.authRepository = authRepository;
        this.userRepository = userRepository;
    }
    async login(dto) {
        // 1. Identify User
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
            throw new appError_1.AppError('Invalid credentials', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, auth_1.AUTH_CONSTANTS.ERRORS.INVALID_CREDENTIALS);
        }
        if (user.status !== 'ACTIVE') {
            throw new appError_1.AppError('Account is locked or inactive', httpStatus_1.HTTP_STATUS.FORBIDDEN, auth_1.AUTH_CONSTANTS.ERRORS.ACCOUNT_LOCKED);
        }
        // 2. Authenticate
        const isValid = await (0, password_1.comparePassword)(dto.password, user.passwordHash);
        if (!isValid) {
            throw new appError_1.AppError('Invalid credentials', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, auth_1.AUTH_CONSTANTS.ERRORS.INVALID_CREDENTIALS);
        }
        // 3. Generate Cryptographically Secure Refresh Token
        const rawRefreshToken = (0, refreshToken_1.generateRefreshToken)();
        const hashedRefreshToken = (0, refreshToken_1.hashRefreshToken)(rawRefreshToken);
        const expiresAt = new Date();
        expiresAt.setTime(expiresAt.getTime() + auth_1.AUTH_CONSTANTS.TOKEN_EXPIRATION.REFRESH_TOKEN_MS);
        // 4. Establish Persistent Session
        const session = await this.authRepository.createSession({
            userId: user.id,
            refreshTokenHash: hashedRefreshToken,
            expiresAt,
            ipAddress: dto.ipAddress,
            userAgent: dto.userAgent,
        });
        // 5. Generate Access Token (JWT)
        const accessToken = (0, jwt_1.generateAccessToken)({
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
    async refreshToken(refreshToken, _ipAddress) {
        const hashedToken = (0, refreshToken_1.hashRefreshToken)(refreshToken);
        const session = await this.authRepository.findSessionByRefreshHash(hashedToken);
        if (!session) {
            throw new appError_1.AppError('Invalid token', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, auth_1.AUTH_CONSTANTS.ERRORS.TOKEN_INVALID);
        }
        // Detect Replay Attacks
        if (session.status === auth_types_1.DomainSessionStatus.REVOKED ||
            session.status === auth_types_1.DomainSessionStatus.COMPROMISED) {
            await this.authRepository.revokeTokenFamily(session.tokenFamily, 'Replay attack detected on revoked token', auth_types_1.DomainRevokedBy.SECURITY_ENGINE);
            throw new appError_1.AppError('Token compromised', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, auth_1.AUTH_CONSTANTS.ERRORS.TOKEN_INVALID);
        }
        if (session.status === auth_types_1.DomainSessionStatus.EXPIRED || session.expiresAt < new Date()) {
            throw new appError_1.AppError('Token expired', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, auth_1.AUTH_CONSTANTS.ERRORS.TOKEN_EXPIRED);
        }
        // Validate User State
        const user = await this.userRepository.findById(session.userId);
        if (!user || user.status !== 'ACTIVE') {
            throw new appError_1.AppError('Account is locked or inactive', httpStatus_1.HTTP_STATUS.FORBIDDEN, auth_1.AUTH_CONSTANTS.ERRORS.ACCOUNT_LOCKED);
        }
        // Token Rotation
        const newRawRefreshToken = (0, refreshToken_1.generateRefreshToken)();
        const newHashedToken = (0, refreshToken_1.hashRefreshToken)(newRawRefreshToken);
        const newExpiresAt = new Date();
        newExpiresAt.setTime(newExpiresAt.getTime() + auth_1.AUTH_CONSTANTS.TOKEN_EXPIRATION.REFRESH_TOKEN_MS);
        const updatedSession = await this.authRepository.rotateRefreshToken(session.id, newHashedToken, newExpiresAt, session.version);
        // Issue New Access Token
        const accessToken = (0, jwt_1.generateAccessToken)({
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
    async logout(sessionId, reason = 'User initiated logout') {
        await this.authRepository.revokeSession(sessionId, reason, auth_types_1.DomainRevokedBy.USER);
    }
    async logoutAll(userId, reason = 'User initiated global logout') {
        await this.authRepository.revokeAllUserSessions(userId, reason, auth_types_1.DomainRevokedBy.USER);
    }
}
exports.AuthService = AuthService;
