import { describe, it, expect } from 'vitest';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../../src/shared/rbac';
import { ROLES } from '../../src/constants/roles';
import { PERMISSIONS } from '../../src/constants/permissions';

describe('RBAC Utility', () => {
  it('hasPermission should return true for Admin having CREATE_USER', () => {
    expect(hasPermission(ROLES.ADMIN, PERMISSIONS.CREATE_USER)).toBe(true);
  });

  it('hasPermission should return false for Employee having CREATE_USER', () => {
    expect(hasPermission(ROLES.EMPLOYEE, PERMISSIONS.CREATE_USER)).toBe(false);
  });

  it('hasAnyPermission should return true if any match', () => {
    expect(hasAnyPermission(ROLES.ASSET_MANAGER, [PERMISSIONS.CREATE_USER, PERMISSIONS.READ_DEPARTMENT])).toBe(true);
  });

  it('hasAllPermissions should check all permissions', () => {
    expect(hasAllPermissions(ROLES.ADMIN, [PERMISSIONS.CREATE_USER, PERMISSIONS.READ_USER])).toBe(true);
    expect(hasAllPermissions(ROLES.ASSET_MANAGER, [PERMISSIONS.CREATE_USER, PERMISSIONS.READ_DEPARTMENT])).toBe(false);
  });
});
