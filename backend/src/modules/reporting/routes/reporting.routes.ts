import { Router } from 'express';
import { ReportingController } from '../controllers/reporting.controller';
import { ReportingService } from '../services/reporting.service';
import { PrismaReportingRepository } from '../repositories/reporting.repository';
import { PrismaUserRepository } from '../../user/repositories/user.repository';
import { authenticate } from '../../auth/middlewares/auth.middleware';
import { requirePermission } from '../../auth/middlewares/rbac.middleware';
import { PERMISSIONS } from '../../../constants/permissions';
import { asyncHandler } from '../../../shared/asyncHandler';

const router = Router();
const userRepo = new PrismaUserRepository();
const repo = new PrismaReportingRepository();
const service = new ReportingService(repo);
const controller = new ReportingController(service);

router.use(authenticate(userRepo));

router.get(
  '/summary',
  requirePermission(PERMISSIONS.READ_ASSET),
  asyncHandler(controller.getSummary)
);
router.get(
  '/asset-stats',
  requirePermission(PERMISSIONS.READ_ASSET),
  asyncHandler(controller.getAssetStats)
);

export default router;
