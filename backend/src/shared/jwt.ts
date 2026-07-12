import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types/auth';
import { AUTH_CONSTANTS } from '../constants/auth';
import { AppError } from './appError';
import { HTTP_STATUS } from '../constants/httpStatus';

export const generateAccessToken = (
  payload: Omit<JwtPayload, 'jti' | 'iss' | 'aud' | 'iat' | 'exp'>
): string => {
  const jti = crypto.randomUUID();

  return jwt.sign({ ...payload, jti }, env.JWT_SECRET, {
    expiresIn: AUTH_CONSTANTS.TOKEN_EXPIRATION.ACCESS_TOKEN,
    algorithm: AUTH_CONSTANTS.ALGORITHMS.JWT as jwt.Algorithm,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    keyid: env.JWT_KEY_ID,
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      algorithms: [AUTH_CONSTANTS.ALGORITHMS.JWT as jwt.Algorithm],
    }) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(
        'Token has expired',
        HTTP_STATUS.UNAUTHORIZED,
        AUTH_CONSTANTS.ERRORS.TOKEN_EXPIRED
      );
    }
    throw new AppError(
      'Invalid token',
      HTTP_STATUS.UNAUTHORIZED,
      AUTH_CONSTANTS.ERRORS.TOKEN_INVALID
    );
  }
};

export const decodeAccessToken = (token: string): JwtPayload | null => {
  return jwt.decode(token) as JwtPayload | null;
};
