"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_CONSTANTS = void 0;
exports.AUTH_CONSTANTS = {
    TOKEN_EXPIRATION: {
        ACCESS_TOKEN: '15m',
        REFRESH_TOKEN: '7d',
        REFRESH_TOKEN_MS: 7 * 24 * 60 * 60 * 1000,
    },
    COOKIE_NAMES: {
        REFRESH_TOKEN: 'refresh_token',
    },
    ALGORITHMS: {
        JWT: 'HS256',
    },
    ERRORS: {
        INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
        TOKEN_EXPIRED: 'TOKEN_EXPIRED',
        TOKEN_INVALID: 'TOKEN_INVALID',
        UNAUTHORIZED: 'UNAUTHORIZED',
        ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
    },
    PASSWORD_RULES: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 128,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBER: true,
        REQUIRE_SPECIAL: true,
    },
    RATE_LIMITS: {
        MAX_LOGIN_ATTEMPTS: 5,
        LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
    },
};
