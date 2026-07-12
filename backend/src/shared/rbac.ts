import { ROLE_PERMISSIONS, Permission } from '../constants/permissions';
import { Role } from '../constants/roles';

export const hasPermission = (role: string, permission: Permission): boolean => {
  const permissions = ROLE_PERMISSIONS[role as Role] || [];
  return permissions.includes(permission);
};

export const hasAnyPermission = (role: string, permissionsToCheck: Permission[]): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[role as Role] || [];
  return permissionsToCheck.some((p) => rolePermissions.includes(p));
};

export const hasAllPermissions = (role: string, permissionsToCheck: Permission[]): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[role as Role] || [];
  return permissionsToCheck.every((p) => rolePermissions.includes(p));
};
