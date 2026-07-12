import { Request, Response, NextFunction } from 'express';
import { Permission } from '../../../constants/permissions';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../../../shared/rbac';
import { AppError } from '../../../shared/appError';
import { HTTP_STATUS } from '../../../constants/httpStatus';
import { AUTH_CONSTANTS } from '../../../constants/auth';

export const requirePermission = (permission: Permission) => {
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

    if (!hasPermission(user.role, permission)) {
      return next(
        new AppError(
          `Forbidden: Missing permission ${permission}`,
          HTTP_STATUS.FORBIDDEN,
          AUTH_CONSTANTS.ERRORS.UNAUTHORIZED
        )
      );
    }

    next();
  };
};

export const requireAnyPermission = (permissions: Permission[]) => {
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

    if (!hasAnyPermission(user.role, permissions)) {
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

export const requireAllPermissions = (permissions: Permission[]) => {
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

    if (!hasAllPermissions(user.role, permissions)) {
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
