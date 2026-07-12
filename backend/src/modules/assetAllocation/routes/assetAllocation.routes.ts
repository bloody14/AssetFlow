import { Router } from 'express';
import { AssetAllocationController } from '../controllers/assetAllocation.controller';
import { AssetAllocationService } from '../services/assetAllocation.service';
import { PrismaAssetAllocationRepository } from '../repositories/assetAllocation.repository';
import { PrismaUserRepository } from '../../user/repositories/user.repository';
import { authenticate } from '../../auth/middlewares/auth.middleware';
import { requirePermission } from '../../auth/middlewares/rbac.middleware';
import { validateRequest } from '../../../shared/validateRequest';
import {
  allocateAssetSchema,
  returnAssetSchema,
  transferAssetSchema,
} from '../validations/assetAllocation.validation';
import { PERMISSIONS } from '../../../constants/permissions';
import { asyncHandler } from '../../../shared/asyncHandler';

const router = Router();
const userRepo = new PrismaUserRepository();
const repo = new PrismaAssetAllocationRepository();
const service = new AssetAllocationService(repo, userRepo);
const controller = new AssetAllocationController(service);

router.use(authenticate(userRepo));

router.post(
  '/allocate',
  requirePermission(PERMISSIONS.UPDATE_ASSET),
  validateRequest(allocateAssetSchema),
  asyncHandler(controller.allocate)
);
router.post(
  '/return',
  requirePermission(PERMISSIONS.UPDATE_ASSET),
  validateRequest(returnAssetSchema),
  asyncHandler(controller.returnAsset)
);
router.post(
  '/transfer',
  requirePermission(PERMISSIONS.UPDATE_ASSET),
  validateRequest(transferAssetSchema),
  asyncHandler(controller.transfer)
);
router.get(
  '/history/:assetId',
  requirePermission(PERMISSIONS.READ_ASSET),
  asyncHandler(controller.getHistory)
);

export default router;
