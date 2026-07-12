export const ROLES = {
  ADMIN: 'ADMIN',
  ASSET_MANAGER: 'ASSET_MANAGER',
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
