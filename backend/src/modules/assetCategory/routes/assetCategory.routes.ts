import { Router } from 'express';
import { AssetCategoryController } from '../controllers/assetCategory.controller';
import { AssetCategoryService } from '../services/assetCategory.service';
import { PrismaAssetCategoryRepository } from '../repositories/assetCategory.repository';
import { authenticate } from '../../auth/middlewares/auth.middleware';
import { requirePermission } from '../../auth/middlewares/rbac.middleware';
import { validateRequest } from '../../../shared/validateRequest';
import {
  createAssetCategorySchema,
  updateAssetCategorySchema,
} from '../validations/assetCategory.validation';
import { PERMISSIONS } from '../../../constants/permissions';
import { PrismaUserRepository } from '../../user/repositories/user.repository';
import { asyncHandler } from '../../../shared/asyncHandler';

const router = Router();
const repo = new PrismaAssetCategoryRepository();
const service = new AssetCategoryService(repo);
const controller = new AssetCategoryController(service);

router.use(authenticate(new PrismaUserRepository()));

router.post(
  '/',
  requirePermission(PERMISSIONS.CREATE_ASSET),
  validateRequest(createAssetCategorySchema),
  asyncHandler(controller.create)
);
router.get('/', requirePermission(PERMISSIONS.READ_ASSET), asyncHandler(controller.getAll));
router.get('/:id', requirePermission(PERMISSIONS.READ_ASSET), asyncHandler(controller.getById));
router.put(
  '/:id',
  requirePermission(PERMISSIONS.UPDATE_ASSET),
  validateRequest(updateAssetCategorySchema),
  asyncHandler(controller.update)
);
router.delete('/:id', requirePermission(PERMISSIONS.DELETE_ASSET), asyncHandler(controller.delete));

export default router;
