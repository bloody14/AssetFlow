import { z } from 'zod';

export const createAssetCategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

export const updateAssetCategorySchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
});
