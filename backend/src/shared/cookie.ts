import { env } from '../config/env';
import { AUTH_CONSTANTS } from '../constants/auth';

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
}

export const getRefreshTokenCookieOptions = (): CookieOptions => {
  const isProd = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: AUTH_CONSTANTS.TOKEN_EXPIRATION.REFRESH_TOKEN_MS,
    path: '/api/v1/auth/refresh', // Restrict cookie to the refresh endpoint
  };
};

export const getClearCookieOptions = (): CookieOptions => {
  const isProd = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 0,
    path: '/api/v1/auth/refresh',
  };
};
