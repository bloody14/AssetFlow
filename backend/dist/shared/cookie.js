"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClearCookieOptions = exports.getRefreshTokenCookieOptions = void 0;
const env_1 = require("../config/env");
const auth_1 = require("../constants/auth");
const getRefreshTokenCookieOptions = () => {
    const isProd = env_1.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax',
        maxAge: auth_1.AUTH_CONSTANTS.TOKEN_EXPIRATION.REFRESH_TOKEN_MS,
        path: '/api/v1/auth/refresh', // Restrict cookie to the refresh endpoint
    };
};
exports.getRefreshTokenCookieOptions = getRefreshTokenCookieOptions;
const getClearCookieOptions = () => {
    const isProd = env_1.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax',
        maxAge: 0,
        path: '/api/v1/auth/refresh',
    };
};
exports.getClearCookieOptions = getClearCookieOptions;
