import { Request, Response, NextFunction } from 'express';
import { ProcurementService } from '../services/procurement.service';
import { sendSuccess, sendCreated } from '../../../shared/response';

export class ProcurementController {
  constructor(private readonly service: ProcurementService) {}

  createSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const supplier = await this.service.createSupplier(req.body);
      sendCreated(res, 'Supplier created successfully', supplier);
    } catch (error) {
      next(error);
    }
  };

  getSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const supplier = await this.service.getSupplier(req.params.id as string);
      sendSuccess(res, 'Supplier retrieved successfully', supplier);
    } catch (error) {
      next(error);
    }
  };

  updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const supplier = await this.service.updateSupplier(req.params.id as string, req.body);
      sendSuccess(res, 'Supplier updated successfully', supplier);
    } catch (error) {
      next(error);
    }
  };

  addSupplierContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contact = await this.service.addSupplierContact(req.body);
      sendCreated(res, 'Supplier contact added successfully', contact);
    } catch (error) {
      next(error);
    }
  };

  getSupplierContacts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contacts = await this.service.getSupplierContacts(req.params.supplierId as string);
      sendSuccess(res, 'Supplier contacts retrieved successfully', contacts);
    } catch (error) {
      next(error);
    }
  };

  addCatalogItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.service.addCatalogItem(req.body);
      sendCreated(res, 'Supplier catalog item added successfully', item);
    } catch (error) {
      next(error);
    }
  };

  getSupplierCatalog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const catalog = await this.service.getSupplierCatalog(req.params.supplierId as string);
      sendSuccess(res, 'Supplier catalog retrieved successfully', catalog);
    } catch (error) {
      next(error);
    }
  };

  createPurchaseRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pr = await this.service.createPurchaseRequest(req.body);
      sendCreated(res, 'Purchase request created successfully', pr);
    } catch (error) {
      next(error);
    }
  };

  getPurchaseRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pr = await this.service.getPurchaseRequest(req.params.id as string);
      sendSuccess(res, 'Purchase request retrieved successfully', pr);
    } catch (error) {
      next(error);
    }
  };

  submitApproval = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pr = await this.service.submitApproval(req.params.id as string, req.body);
      sendSuccess(res, 'Purchase request approval submitted successfully', pr);
    } catch (error) {
      next(error);
    }
  };

  generatePurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const po = await this.service.generatePurchaseOrder(req.body);
      sendCreated(res, 'Purchase order generated successfully', po);
    } catch (error) {
      next(error);
    }
  };

  getPurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const po = await this.service.getPurchaseOrder(req.params.id as string);
      sendSuccess(res, 'Purchase order retrieved successfully', po);
    } catch (error) {
      next(error);
    }
  };

  issuePurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const po = await this.service.issuePurchaseOrder(req.params.id as string);
      sendSuccess(res, 'Purchase order issued successfully', po);
    } catch (error) {
      next(error);
    }
  };

  executeGoodsReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const gr = await this.service.executeGoodsReceipt(req.body);
      sendCreated(res, 'Goods receipt executed successfully', gr);
    } catch (error) {
      next(error);
    }
  };

  // --- Analytics ---
  getSupplierMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const metrics = await this.service.getSupplierMetrics(req.params.supplierId as string);
      sendSuccess(res, 'Supplier metrics retrieved successfully', metrics);
    } catch (error) {
      next(error);
    }
  };

  recalculateSupplierMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.recalculateSupplierMetrics(req.params.supplierId as string);
      sendSuccess(res, 'Supplier metrics recalculated successfully', null);
    } catch (error) {
      next(error);
    }
  };
}
