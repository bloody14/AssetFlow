import { z } from 'zod';

export const createAssetSchema = z.object({
  assetTag: z.string().min(2),
  serialNumber: z.string().nullable().optional(),
  name: z.string().min(2),
  description: z.string().nullable().optional(),
  categoryId: z.string().uuid(),
  departmentId: z.string().uuid(),
  assignedUserId: z.string().uuid().nullable().optional(),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'IN_MAINTENANCE', 'RETIRED', 'LOST']).optional(),
  purchaseDate: z.string().datetime().nullable().optional(),
  purchaseCost: z.number().min(0).nullable().optional(),
});

export const updateAssetSchema = z.object({
  assetTag: z.string().min(2).optional(),
  serialNumber: z.string().nullable().optional(),
  name: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  categoryId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'IN_MAINTENANCE', 'RETIRED', 'LOST']).optional(),
  purchaseDate: z.string().datetime().nullable().optional(),
  purchaseCost: z.number().min(0).nullable().optional(),
});
