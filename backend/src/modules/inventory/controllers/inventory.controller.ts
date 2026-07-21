import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';
import { sendSuccess, sendCreated } from '../../../shared/response';

export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // --- Warehouse ---
  createWarehouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const warehouse = await this.inventoryService.createWarehouse(req.body);
      sendCreated(res, 'Warehouse created successfully', warehouse);
    } catch (error) {
      next(error);
    }
  };

  getWarehouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const warehouse = await this.inventoryService.getWarehouse(req.params.id as string);
      sendSuccess(res, 'Warehouse retrieved successfully', warehouse);
    } catch (error) {
      next(error);
    }
  };

  updateWarehouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const warehouse = await this.inventoryService.updateWarehouse(
        req.params.id as string,
        req.body
      );
      sendSuccess(res, 'Warehouse updated successfully', warehouse);
    } catch (error) {
      next(error);
    }
  };

  // --- Category ---
  createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.inventoryService.createCategory(req.body);
      sendCreated(res, 'Inventory category created successfully', category);
    } catch (error) {
      next(error);
    }
  };

  getCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.inventoryService.getCategory(req.params.id as string);
      sendSuccess(res, 'Inventory category retrieved successfully', category);
    } catch (error) {
      next(error);
    }
  };

  // --- Inventory Item ---
  createInventoryItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.inventoryService.createInventoryItem(req.body);
      sendCreated(res, 'Inventory item created successfully', item);
    } catch (error) {
      next(error);
    }
  };

  getInventoryItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.inventoryService.getInventoryItem(req.params.id as string);
      sendSuccess(res, 'Inventory item retrieved successfully', item);
    } catch (error) {
      next(error);
    }
  };

  updateInventoryItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.inventoryService.updateInventoryItem(
        req.params.id as string,
        req.body
      );
      sendSuccess(res, 'Inventory item updated successfully', item);
    } catch (error) {
      next(error);
    }
  };

  // --- Stock Level ---
  getStockLevel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stockLevel = await this.inventoryService.getStockLevel(
        req.params.itemId as string,
        req.params.warehouseId as string
      );
      sendSuccess(res, 'Stock level retrieved successfully', stockLevel);
    } catch (error) {
      next(error);
    }
  };

  // --- Ledger / Transactions ---
  receiveStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = (req as any).user.id;
      const tx = await this.inventoryService.receiveStock(req.body, actorId);
      sendCreated(res, 'Stock received successfully', tx);
    } catch (error) {
      next(error);
    }
  };

  consumeStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = (req as any).user.id;
      const tx = await this.inventoryService.consumeStock(req.body, actorId);
      sendSuccess(res, 'Stock consumed successfully', tx);
    } catch (error) {
      next(error);
    }
  };

  transferStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = (req as any).user.id;
      const txs = await this.inventoryService.transferStock(req.body, actorId);
      sendCreated(res, 'Stock transferred successfully', txs);
    } catch (error) {
      next(error);
    }
  };

  getInventoryTimeline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const timeline = await this.inventoryService.getInventoryTimeline(
        req.params.itemId as string
      );
      sendSuccess(res, 'Inventory timeline retrieved successfully', timeline);
    } catch (error) {
      next(error);
    }
  };

  // --- Reservations ---
  reserveStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = (req as any).user.id;
      const reservation = await this.inventoryService.reserveStock(req.body, actorId);
      sendCreated(res, 'Stock reserved successfully', reservation);
    } catch (error) {
      next(error);
    }
  };

  fulfillReservation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const _actorId = (req as any).user.id;
      const result = await this.inventoryService.fulfillReservation(
        req.params.id as string,
        _actorId
      );
      sendSuccess(res, 'Reservation fulfilled successfully', result);
    } catch (error) {
      next(error);
    }
  };

  cancelReservation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = (req as any).user.id;
      const reason = req.body.reason || 'CANCELLED';
      const reservation = await this.inventoryService.cancelReservation(
        req.params.id as string,
        actorId,
        reason
      );
      sendSuccess(res, 'Reservation cancelled successfully', reservation);
    } catch (error) {
      next(error);
    }
  };

  getActiveReservations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reservations = await this.inventoryService.getActiveReservations(
        req.params.itemId as string,
        req.params.warehouseId as string
      );
      sendSuccess(res, 'Active reservations retrieved successfully', reservations);
    } catch (error) {
      next(error);
    }
  };

  // --- Cycle Counts ---
  startCycleCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = (req as any).user.id;
      const cycleCount = await this.inventoryService.startCycleCount(req.body, actorId);
      sendCreated(res, 'Cycle count started successfully', cycleCount);
    } catch (error) {
      next(error);
    }
  };

  recordCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = (req as any).user.id;
      const item = await this.inventoryService.recordCount(
        req.params.id as string,
        req.body,
        actorId
      );
      sendSuccess(res, 'Count recorded successfully', item);
    } catch (error) {
      next(error);
    }
  };

  completeCycleCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = (req as any).user.id;
      const result = await this.inventoryService.completeCycleCount(
        req.params.id as string,
        actorId
      );
      sendSuccess(res, 'Cycle count completed successfully', result);
    } catch (error) {
      next(error);
    }
  };

  // --- Analytics & Low Stock ---
  runLowStockCheck = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = (req as any).user?.id || 'SYSTEM';
      await this.inventoryService.runLowStockCheck(actorId);
      sendSuccess(res, 'Low stock check executed successfully');
    } catch (error) {
      next(error);
    }
  };

  getInventoryKPIs = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const kpis = await this.inventoryService.getInventoryKPIs();
      sendSuccess(res, 'Inventory KPIs retrieved successfully', kpis);
    } catch (error) {
      next(error);
    }
  };

  getWarehouseUtilization = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const utilization = await this.inventoryService.getWarehouseUtilization();
      sendSuccess(res, 'Warehouse utilization retrieved successfully', utilization);
    } catch (error) {
      next(error);
    }
  };
}
