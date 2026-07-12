import { z } from 'zod';

export const createEmployeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.enum(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE']).optional(),
  departmentId: z.string().uuid().optional(),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE']).optional(),
  departmentId: z.string().uuid().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
