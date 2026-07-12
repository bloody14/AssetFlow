import { Router } from 'express';
import { AssetController } from '../controllers/asset.controller';
import { AssetService } from '../services/asset.service';
import { PrismaAssetRepository } from '../repositories/asset.repository';
import { PrismaAssetCategoryRepository } from '../../assetCategory/repositories/assetCategory.repository';
import { PrismaDepartmentRepository } from '../../department/repositories/department.repository';
import { PrismaUserRepository } from '../../user/repositories/user.repository';
import { authenticate } from '../../auth/middlewares/auth.middleware';
import { requirePermission } from '../../auth/middlewares/rbac.middleware';
import { validateRequest } from '../../../shared/validateRequest';
import { createAssetSchema, updateAssetSchema } from '../validations/asset.validation';
import { PERMISSIONS } from '../../../constants/permissions';
import { asyncHandler } from '../../../shared/asyncHandler';

const router = Router();
const repo = new PrismaAssetRepository();
const categoryRepo = new PrismaAssetCategoryRepository();
const deptRepo = new PrismaDepartmentRepository();
const userRepo = new PrismaUserRepository();
const service = new AssetService(repo, categoryRepo, deptRepo, userRepo);
const controller = new AssetController(service);

router.use(authenticate(userRepo));

router.post(
  '/',
  requirePermission(PERMISSIONS.CREATE_ASSET),
  validateRequest(createAssetSchema),
  asyncHandler(controller.create)
);
router.get('/', requirePermission(PERMISSIONS.READ_ASSET), asyncHandler(controller.getAll));
router.get('/:id', requirePermission(PERMISSIONS.READ_ASSET), asyncHandler(controller.getById));
router.put(
  '/:id',
  requirePermission(PERMISSIONS.UPDATE_ASSET),
  validateRequest(updateAssetSchema),
  asyncHandler(controller.update)
);
router.delete('/:id', requirePermission(PERMISSIONS.DELETE_ASSET), asyncHandler(controller.delete));

export default router;
