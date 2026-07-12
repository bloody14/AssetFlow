import { z } from 'zod';

export const allocateAssetSchema = z.object({
  assetId: z.string().uuid(),
  allocatedToId: z.string().uuid(),
  notes: z.string().optional(),
});

export const returnAssetSchema = z.object({
  assetId: z.string().uuid(),
  notes: z.string().optional(),
});

export const transferAssetSchema = z.object({
  assetId: z.string().uuid(),
  newAllocatedToId: z.string().uuid(),
  notes: z.string().optional(),
});
