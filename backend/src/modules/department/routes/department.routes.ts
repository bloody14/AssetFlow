import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller';
import { DepartmentService } from '../services/department.service';
import { PrismaDepartmentRepository } from '../repositories/department.repository';
import { authenticate } from '../../auth/middlewares/auth.middleware';
import { requirePermission } from '../../auth/middlewares/rbac.middleware';
import { validateRequest } from '../../../shared/validateRequest';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from '../validations/department.validation';
import { PERMISSIONS } from '../../../constants/permissions';
import { PrismaUserRepository } from '../../user/repositories/user.repository';
import { asyncHandler } from '../../../shared/asyncHandler';

const router = Router();

const userRepository = new PrismaUserRepository();
const authMiddleware = authenticate(userRepository);

const repo = new PrismaDepartmentRepository();
const service = new DepartmentService(repo);
const controller = new DepartmentController(service);

router.use(authMiddleware);

router.post(
  '/',
  requirePermission(PERMISSIONS.CREATE_DEPARTMENT),
  validateRequest(createDepartmentSchema),
  asyncHandler(controller.create)
);
router.get('/', requirePermission(PERMISSIONS.READ_DEPARTMENT), asyncHandler(controller.getAll));
router.get(
  '/:id',
  requirePermission(PERMISSIONS.READ_DEPARTMENT),
  asyncHandler(controller.getById)
);
router.put(
  '/:id',
  requirePermission(PERMISSIONS.UPDATE_DEPARTMENT),
  validateRequest(updateDepartmentSchema),
  asyncHandler(controller.update)
);
router.delete(
  '/:id',
  requirePermission(PERMISSIONS.DELETE_DEPARTMENT),
  asyncHandler(controller.delete)
);

export default router;
