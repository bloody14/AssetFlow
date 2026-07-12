import { Router } from 'express';
import { MaintenanceController } from '../controllers/maintenance.controller';
import { MaintenanceService } from '../services/maintenance.service';
import { PrismaMaintenanceRepository } from '../repositories/maintenance.repository';
import { PrismaUserRepository } from '../../user/repositories/user.repository';
import { authenticate } from '../../auth/middlewares/auth.middleware';
import { requirePermission } from '../../auth/middlewares/rbac.middleware';
import { validateRequest } from '../../../shared/validateRequest';
import {
  createMaintenanceSchema,
  assignTechnicianSchema,
  updateMaintenanceStatusSchema,
  completeMaintenanceSchema,
} from '../validations/maintenance.validation';
import { PERMISSIONS } from '../../../constants/permissions';
import { asyncHandler } from '../../../shared/asyncHandler';

const router = Router();
const userRepo = new PrismaUserRepository();
const repo = new PrismaMaintenanceRepository();
const service = new MaintenanceService(repo);
const controller = new MaintenanceController(service);

router.use(authenticate(userRepo));

router.post(
  '/',
  requirePermission(PERMISSIONS.UPDATE_ASSET),
  validateRequest(createMaintenanceSchema),
  asyncHandler(controller.create)
);
router.post(
  '/:id/assign',
  requirePermission(PERMISSIONS.UPDATE_ASSET),
  validateRequest(assignTechnicianSchema),
  asyncHandler(controller.assign)
);
router.put(
  '/:id/status',
  requirePermission(PERMISSIONS.UPDATE_ASSET),
  validateRequest(updateMaintenanceStatusSchema),
  asyncHandler(controller.updateStatus)
);
router.post(
  '/:id/complete',
  requirePermission(PERMISSIONS.UPDATE_ASSET),
  validateRequest(completeMaintenanceSchema),
  asyncHandler(controller.complete)
);
router.get(
  '/history/:assetId',
  requirePermission(PERMISSIONS.READ_ASSET),
  asyncHandler(controller.history)
);

export default router;
