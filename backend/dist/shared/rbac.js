"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasAllPermissions = exports.hasAnyPermission = exports.hasPermission = void 0;
const permissions_1 = require("../constants/permissions");
const hasPermission = (role, permission) => {
    const permissions = permissions_1.ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
};
exports.hasPermission = hasPermission;
const hasAnyPermission = (role, permissionsToCheck) => {
    const rolePermissions = permissions_1.ROLE_PERMISSIONS[role] || [];
    return permissionsToCheck.some((p) => rolePermissions.includes(p));
};
exports.hasAnyPermission = hasAnyPermission;
const hasAllPermissions = (role, permissionsToCheck) => {
    const rolePermissions = permissions_1.ROLE_PERMISSIONS[role] || [];
    return permissionsToCheck.every((p) => rolePermissions.includes(p));
};
exports.hasAllPermissions = hasAllPermissions;
