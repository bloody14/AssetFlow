import { Request, Response } from 'express';
import { z } from 'zod';
import { IAuthService } from '../services/auth.service.interface';
import { sendSuccess } from '../../../shared/response';
import { HTTP_STATUS } from '../../../constants/httpStatus';
import { getRefreshTokenCookieOptions, getClearCookieOptions } from '../../../shared/cookie';
import { AUTH_CONSTANTS } from '../../../constants/auth';
import { getCurrentUser } from '../middlewares/auth.middleware';
import { AppError } from '../../../shared/appError';

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  login = async (req: Request, res: Response) => {
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // 2. Call Service
    const tokens = await this.authService.login({
      email: req.body.email,
      password: req.body.password,
      ipAddress,
      userAgent,
    });

    // 3. Return Standard Response
    res.cookie(
      AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN,
      tokens.refreshToken,
      getRefreshTokenCookieOptions()
    );

    return sendSuccess(res, 'Login successful', {
      accessToken: tokens.accessToken,
    });
  };

  refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN];
    if (!refreshToken) {
      throw new AppError(
        'No refresh token provided',
        HTTP_STATUS.UNAUTHORIZED,
        AUTH_CONSTANTS.ERRORS.UNAUTHORIZED
      );
    }

    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    const tokens = await this.authService.refreshToken(refreshToken, ipAddress);

    res.cookie(
      AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN,
      tokens.refreshToken,
      getRefreshTokenCookieOptions()
    );

    return sendSuccess(res, 'Token refreshed', {
      accessToken: tokens.accessToken,
    });
  };

  logout = async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    await this.authService.logout(user.sessionId, 'User initiated logout');

    res.cookie(AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN, '', getClearCookieOptions());
    return sendSuccess(res, 'Logout successful');
  };

  logoutAll = async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    await this.authService.logoutAll(user.id, 'User initiated global logout');

    res.cookie(AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN, '', getClearCookieOptions());
    return sendSuccess(res, 'Logged out from all devices');
  };

  me = async (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    return sendSuccess(res, 'Current user retrieved', user);
  };
}
