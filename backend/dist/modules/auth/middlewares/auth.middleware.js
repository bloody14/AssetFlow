"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.optionalAuth = exports.requireRole = exports.authenticate = void 0;
const jwt_1 = require("../../../shared/jwt");
const appError_1 = require("../../../shared/appError");
const httpStatus_1 = require("../../../constants/httpStatus");
const auth_1 = require("../../../constants/auth");
const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
};
// 1. authenticate()
const authenticate = (userRepository) => {
    return async (req, _res, next) => {
        try {
            const token = extractToken(req);
            if (!token) {
                throw new appError_1.AppError('Unauthorized: No token provided', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, auth_1.AUTH_CONSTANTS.ERRORS.UNAUTHORIZED);
            }
            const payload = (0, jwt_1.verifyAccessToken)(token);
            if (payload.type !== 'access') {
                throw new appError_1.AppError('Invalid token type', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, auth_1.AUTH_CONSTANTS.ERRORS.TOKEN_INVALID);
            }
            const user = await userRepository.findById(payload.sub);
            if (!user) {
                throw new appError_1.AppError('User not found', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, auth_1.AUTH_CONSTANTS.ERRORS.UNAUTHORIZED);
            }
            if (user.status !== 'ACTIVE') {
                throw new appError_1.AppError('Account is locked or inactive', httpStatus_1.HTTP_STATUS.FORBIDDEN, auth_1.AUTH_CONSTANTS.ERRORS.ACCOUNT_LOCKED);
            }
            const authUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                departmentId: user.departmentId,
                sessionId: payload.sid,
            };
            req.user = authUser;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.authenticate = authenticate;
// 2. requireRole(...roles)
const requireRole = (...roles) => {
    return (req, _res, next) => {
        const user = req.user;
        if (!user) {
            return next(new appError_1.AppError('User not authenticated', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, auth_1.AUTH_CONSTANTS.ERRORS.UNAUTHORIZED));
        }
        if (!roles.includes(user.role)) {
            return next(new appError_1.AppError('Forbidden: Insufficient permissions', httpStatus_1.HTTP_STATUS.FORBIDDEN, auth_1.AUTH_CONSTANTS.ERRORS.UNAUTHORIZED));
        }
        next();
    };
};
exports.requireRole = requireRole;
// 3. optionalAuth()
const optionalAuth = (userRepository) => {
    return async (req, _res, next) => {
        try {
            const token = extractToken(req);
            if (!token) {
                return next();
            }
            const payload = (0, jwt_1.verifyAccessToken)(token);
            if (payload.type !== 'access') {
                return next();
            }
            const user = await userRepository.findById(payload.sub);
            if (user && user.status === 'ACTIVE') {
                const authUser = {
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
        }
        catch (_error) {
            // For optional auth, if the token is invalid/expired, we just proceed as guest.
            next();
        }
    };
};
exports.optionalAuth = optionalAuth;
// 4. currentUser helper
const getCurrentUser = (req) => {
    if (!req.user) {
        throw new appError_1.AppError('User not authenticated', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, auth_1.AUTH_CONSTANTS.ERRORS.UNAUTHORIZED);
    }
    return req.user;
};
exports.getCurrentUser = getCurrentUser;
