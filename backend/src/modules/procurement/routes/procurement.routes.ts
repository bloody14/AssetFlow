import { Router } from 'express';
import { ProcurementController } from '../controllers/procurement.controller';
import { ProcurementService } from '../services/procurement.service';
import { PrismaProcurementRepository } from '../repositories/procurement.repository';
import { authenticate } from '../../auth/middlewares/auth.middleware';
import { PrismaUserRepository } from '../../user/repositories/user.repository';

const router = Router();
const repo = new PrismaProcurementRepository();
const service = new ProcurementService(repo);
const controller = new ProcurementController(service);
const userRepo = new PrismaUserRepository();

// Protect all procurement routes
router.use(authenticate(userRepo));

// Supplier Management
router.post('/suppliers', controller.createSupplier);

// Purchase Requests
router.post('/purchase-requests', controller.createPurchaseRequest);
router.post('/purchase-requests/:id/approve', controller.submitApproval);

// Purchase Orders
router.post('/purchase-orders/generate', controller.generatePurchaseOrder);
router.post('/purchase-orders/:id/issue', controller.issuePurchaseOrder);

// Goods Receipt
router.post('/goods-receipt', controller.executeGoodsReceipt);

// Analytics
router.get('/analytics/suppliers/:supplierId', controller.getSupplierMetrics);
router.post('/analytics/suppliers/:supplierId/recalculate', controller.recalculateSupplierMetrics);

export default router;
