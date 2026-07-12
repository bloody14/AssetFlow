"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const response_1 = require("../../../shared/response");
const httpStatus_1 = require("../../../constants/httpStatus");
const cookie_1 = require("../../../shared/cookie");
const auth_1 = require("../../../constants/auth");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const appError_1 = require("../../../shared/appError");
class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    login = async (req, res) => {
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
        res.cookie(auth_1.AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, (0, cookie_1.getRefreshTokenCookieOptions)());
        return (0, response_1.sendSuccess)(res, 'Login successful', {
            accessToken: tokens.accessToken,
        });
    };
    refreshToken = async (req, res) => {
        const refreshToken = req.cookies?.[auth_1.AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN];
        if (!refreshToken) {
            throw new appError_1.AppError('No refresh token provided', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, auth_1.AUTH_CONSTANTS.ERRORS.UNAUTHORIZED);
        }
        const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
        const tokens = await this.authService.refreshToken(refreshToken, ipAddress);
        res.cookie(auth_1.AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, (0, cookie_1.getRefreshTokenCookieOptions)());
        return (0, response_1.sendSuccess)(res, 'Token refreshed', {
            accessToken: tokens.accessToken,
        });
    };
    logout = async (req, res) => {
        const user = (0, auth_middleware_1.getCurrentUser)(req);
        await this.authService.logout(user.sessionId, 'User initiated logout');
        res.cookie(auth_1.AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN, '', (0, cookie_1.getClearCookieOptions)());
        return (0, response_1.sendSuccess)(res, 'Logout successful');
    };
    logoutAll = async (req, res) => {
        const user = (0, auth_middleware_1.getCurrentUser)(req);
        await this.authService.logoutAll(user.id, 'User initiated global logout');
        res.cookie(auth_1.AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN, '', (0, cookie_1.getClearCookieOptions)());
        return (0, response_1.sendSuccess)(res, 'Logged out from all devices');
    };
    me = async (req, res) => {
        const user = (0, auth_middleware_1.getCurrentUser)(req);
        return (0, response_1.sendSuccess)(res, 'Current user retrieved', user);
    };
}
exports.AuthController = AuthController;
