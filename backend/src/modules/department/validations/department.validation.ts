import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(2),
  parentDepartmentId: z.string().uuid().optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(2).optional(),
  parentDepartmentId: z.string().uuid().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
