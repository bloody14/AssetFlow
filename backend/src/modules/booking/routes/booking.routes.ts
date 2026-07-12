import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { BookingService } from '../services/booking.service';
import { PrismaBookingRepository } from '../repositories/booking.repository';
import { PrismaUserRepository } from '../../user/repositories/user.repository';
import { authenticate } from '../../auth/middlewares/auth.middleware';
import { requirePermission } from '../../auth/middlewares/rbac.middleware';
import { validateRequest } from '../../../shared/validateRequest';
import { createBookingSchema, updateBookingStatusSchema } from '../validations/booking.validation';
import { PERMISSIONS } from '../../../constants/permissions';
import { asyncHandler } from '../../../shared/asyncHandler';

const router = Router();
const userRepo = new PrismaUserRepository();
const repo = new PrismaBookingRepository();
const service = new BookingService(repo);
const controller = new BookingController(service);

router.use(authenticate(userRepo));

router.post(
  '/',
  requirePermission(PERMISSIONS.CREATE_ASSET),
  validateRequest(createBookingSchema),
  asyncHandler(controller.create)
);
router.post(
  '/:id/approve',
  requirePermission(PERMISSIONS.UPDATE_ASSET),
  validateRequest(updateBookingStatusSchema),
  asyncHandler(controller.approve)
);
router.post(
  '/:id/reject',
  requirePermission(PERMISSIONS.UPDATE_ASSET),
  validateRequest(updateBookingStatusSchema),
  asyncHandler(controller.reject)
);
router.post(
  '/:id/cancel',
  requirePermission(PERMISSIONS.READ_ASSET),
  validateRequest(updateBookingStatusSchema),
  asyncHandler(controller.cancel)
);
router.get(
  '/calendar',
  requirePermission(PERMISSIONS.READ_ASSET),
  asyncHandler(controller.calendar)
);
router.get(
  '/history/:assetId',
  requirePermission(PERMISSIONS.READ_ASSET),
  asyncHandler(controller.history)
);

export default router;
