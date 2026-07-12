import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { EmployeeService } from '../services/employee.service';
import { PrismaUserRepository } from '../../user/repositories/user.repository';
import { authenticate } from '../../auth/middlewares/auth.middleware';
import { requirePermission } from '../../auth/middlewares/rbac.middleware';
import { validateRequest } from '../../../shared/validateRequest';
import { createEmployeeSchema, updateEmployeeSchema } from '../validations/employee.validation';
import { PERMISSIONS } from '../../../constants/permissions';
import { asyncHandler } from '../../../shared/asyncHandler';

const router = Router();

const repo = new PrismaUserRepository();
const service = new EmployeeService(repo);
const controller = new EmployeeController(service);

const authMiddleware = authenticate(repo);
router.use(authMiddleware);

router.post(
  '/',
  requirePermission(PERMISSIONS.CREATE_USER),
  validateRequest(createEmployeeSchema),
  asyncHandler(controller.create)
);
router.get('/', requirePermission(PERMISSIONS.READ_USER), asyncHandler(controller.getAll));
router.get('/:id', requirePermission(PERMISSIONS.READ_USER), asyncHandler(controller.getById));
router.put(
  '/:id',
  requirePermission(PERMISSIONS.UPDATE_USER),
  validateRequest(updateEmployeeSchema),
  asyncHandler(controller.update)
);
router.delete('/:id', requirePermission(PERMISSIONS.DELETE_USER), asyncHandler(controller.delete));

export default router;
