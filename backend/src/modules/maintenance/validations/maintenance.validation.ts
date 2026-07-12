import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  assetId: z.string().uuid(),
  issue: z.string().min(5),
});

export const assignTechnicianSchema = z
  .object({
    technicianId: z.string().uuid(),
    scheduledStart: z.string().datetime().optional(),
    scheduledEnd: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      if (data.scheduledStart && data.scheduledEnd) {
        return new Date(data.scheduledStart) < new Date(data.scheduledEnd);
      }
      return true;
    },
    {
      message: 'scheduledStart must be before scheduledEnd',
      path: ['scheduledStart'],
    }
  );

export const updateMaintenanceStatusSchema = z.object({
  status: z.enum(['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'CANCELLED']),
});

export const completeMaintenanceSchema = z.object({
  resolution: z.string().min(5),
  cost: z.number().nonnegative().optional(),
});
