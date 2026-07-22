import { BaseEntity } from '@/types';

export interface User extends BaseEntity {
  email: string;
  name: string;
  roleId: string;
  departmentId: string;
}

export interface AuthResponse {
  user: User;
  // Note: token is stored in HTTP-only cookie, so it might not be in the body depending on backend config
}

export interface LoginCredentials {
  email: string;
  password: string;
}
