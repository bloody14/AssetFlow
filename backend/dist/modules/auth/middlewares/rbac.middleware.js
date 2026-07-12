"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAllPermissions = exports.requireAnyPermission = exports.requirePermission = void 0;
const rbac_1 = require("../../../shared/rbac");
const appError_1 = require("../../../shared/appError");
const httpStatus_1 = require("../../../constants/httpStatus");
const auth_1 = require("../../../constants/auth");
const requirePermission = (permission) => {
    return (req, _res, next) => {
        const user = req.user;
        if (!user) {
            return next(new appError_1.AppError('User not authenticated', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, auth_1.AUTH_CONSTANTS.ERRORS.UNAUTHORIZED));
        }
        if (!(0, rbac_1.hasPermission)(user.role, permission)) {
            return next(new appError_1.AppError(`Forbidden: Missing permission ${permission}`, httpStatus_1.HTTP_STATUS.FORBIDDEN, auth_1.AUTH_CONSTANTS.ERRORS.UNAUTHORIZED));
        }
        next();
    };
};
exports.requirePermission = requirePermission;
const requireAnyPermission = (permissions) => {
    return (req, _res, next) => {
        const user = req.user;
        if (!user) {
            return next(new appError_1.AppError('User not authenticated', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, auth_1.AUTH_CONSTANTS.ERRORS.UNAUTHORIZED));
        }
        if (!(0, rbac_1.hasAnyPermission)(user.role, permissions)) {
            return next(new appError_1.AppError('Forbidden: Insufficient permissions', httpStatus_1.HTTP_STATUS.FORBIDDEN, auth_1.AUTH_CONSTANTS.ERRORS.UNAUTHORIZED));
        }
        next();
    };
};
exports.requireAnyPermission = requireAnyPermission;
const requireAllPermissions = (permissions) => {
    return (req, _res, next) => {
        const user = req.user;
        if (!user) {
            return next(new appError_1.AppError('User not authenticated', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, auth_1.AUTH_CONSTANTS.ERRORS.UNAUTHORIZED));
        }
        if (!(0, rbac_1.hasAllPermissions)(user.role, permissions)) {
            return next(new appError_1.AppError('Forbidden: Insufficient permissions', httpStatus_1.HTTP_STATUS.FORBIDDEN, auth_1.AUTH_CONSTANTS.ERRORS.UNAUTHORIZED));
        }
        next();
    };
};
exports.requireAllPermissions = requireAllPermissions;
