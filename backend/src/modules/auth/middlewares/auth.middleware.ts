import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../../shared/jwt';
import { AppError } from '../../../shared/appError';
import { HTTP_STATUS } from '../../../constants/httpStatus';
import { AUTH_CONSTANTS } from '../../../constants/auth';
import { IUserRepository } from '../../user/repositories/user.repository.interface';
import { IUserPayload } from '../../../types/auth';

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

// 1. authenticate()
export const authenticate = (userRepository: IUserRepository) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = extractToken(req);
      if (!token) {
        throw new AppError(
          'Unauthorized: No token provided',
          HTTP_STATUS.UNAUTHORIZED,
          AUTH_CONSTANTS.ERRORS.UNAUTHORIZED
        );
      }

      const payload = verifyAccessToken(token);

      if (payload.type !== 'access') {
        throw new AppError(
          'Invalid token type',
          HTTP_STATUS.UNAUTHORIZED,
          AUTH_CONSTANTS.ERRORS.TOKEN_INVALID
        );
      }

      const user = await userRepository.findById(payload.sub);
      if (!user) {
        throw new AppError(
          'User not found',
          HTTP_STATUS.UNAUTHORIZED,
          AUTH_CONSTANTS.ERRORS.UNAUTHORIZED
        );
      }

      if (user.status !== 'ACTIVE') {
        throw new AppError(
          'Account is locked or inactive',
          HTTP_STATUS.FORBIDDEN,
          AUTH_CONSTANTS.ERRORS.ACCOUNT_LOCKED
        );
      }

      const authUser: IUserPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
        sessionId: payload.sid,
      };

      req.user = authUser;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// 2. requireRole(...roles)
export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(
        new AppError(
          'User not authenticated',
          HTTP_STATUS.UNAUTHORIZED,
          AUTH_CONSTANTS.ERRORS.UNAUTHORIZED
        )
      );
    }

    if (!roles.includes(user.role)) {
      return next(
        new AppError(
          'Forbidden: Insufficient permissions',
          HTTP_STATUS.FORBIDDEN,
          AUTH_CONSTANTS.ERRORS.UNAUTHORIZED
        )
      );
    }

    next();
  };
};

// 3. optionalAuth()
export const optionalAuth = (userRepository: IUserRepository) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = extractToken(req);
      if (!token) {
        return next();
      }

      const payload = verifyAccessToken(token);
      if (payload.type !== 'access') {
        return next();
      }

      const user = await userRepository.findById(payload.sub);
      if (user && user.status === 'ACTIVE') {
        const authUser: IUserPayload = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          departmentId: user.departmentId,
          sessionId: payload.sid,
        };
        req.user = authUser;
      }

      next();
    } catch (_error) {
      // For optional auth, if the token is invalid/expired, we just proceed as guest.
      next();
    }
  };
};

// 4. currentUser helper
export const getCurrentUser = (req: Request): IUserPayload => {
  if (!req.user) {
    throw new AppError(
      'User not authenticated',
      HTTP_STATUS.UNAUTHORIZED,
      AUTH_CONSTANTS.ERRORS.UNAUTHORIZED
    );
  }
  return req.user;
};
