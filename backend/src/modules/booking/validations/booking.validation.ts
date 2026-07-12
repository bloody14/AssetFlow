import { z } from 'zod';

export const createBookingSchema = z
  .object({
    assetId: z.string().uuid(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    notes: z.string().optional(),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: 'startTime must be before endTime',
    path: ['startTime'],
  });

export const updateBookingStatusSchema = z.object({
  notes: z.string().optional(),
});
