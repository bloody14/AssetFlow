import { PrismaInventoryRepository } from '../repositories/inventory.repository';
import {
  CreateWarehouseDTO,
  UpdateWarehouseDTO,
  WarehouseDomain,
  CreateInventoryCategoryDTO,
  InventoryCategoryDomain,
  CreateInventoryItemDTO,
  UpdateInventoryItemDTO,
  InventoryItemDomain,
  StockLevelDomain,
  StockTransactionDomain,
  ReceiveStockDTO,
  ConsumeStockDTO,
  TransferStockDTO,
  StockReservationDomain,
  CreateReservationDTO,
  CycleCountDomain,
  CycleCountItemDomain,
  CreateCycleCountDTO,
  RecordCountDTO,
  InventoryKPIDomain,
  WarehouseUtilizationDomain,
} from '../types/inventory.types';
import { eventBus } from '../../../shared/events/eventBus';

export class InventoryService {
  constructor(private readonly repo: PrismaInventoryRepository) {}

  // --- Warehouse ---
  async createWarehouse(data: CreateWarehouseDTO): Promise<WarehouseDomain> {
    return this.repo.createWarehouse(data);
  }

  async getWarehouse(id: string): Promise<WarehouseDomain> {
    return this.repo.getWarehouse(id);
  }

  async updateWarehouse(id: string, data: UpdateWarehouseDTO): Promise<WarehouseDomain> {
    return this.repo.updateWarehouse(id, data);
  }

  // --- Category ---
  async createCategory(data: CreateInventoryCategoryDTO): Promise<InventoryCategoryDomain> {
    return this.repo.createCategory(data);
  }

  async getCategory(id: string): Promise<InventoryCategoryDomain> {
    return this.repo.getCategory(id);
  }

  // --- Inventory Item ---
  async createInventoryItem(data: CreateInventoryItemDTO): Promise<InventoryItemDomain> {
    return this.repo.createInventoryItem(data);
  }

  async getInventoryItem(id: string): Promise<InventoryItemDomain> {
    return this.repo.getInventoryItem(id);
  }

  async updateInventoryItem(id: string, data: UpdateInventoryItemDTO): Promise<InventoryItemDomain> {
    return this.repo.updateInventoryItem(id, data);
  }

  // --- Stock Level ---
  async getStockLevel(inventoryItemId: string, warehouseId: string): Promise<StockLevelDomain> {
    return this.repo.getStockLevel(inventoryItemId, warehouseId);
  }

  // --- Ledger / Transactions ---
  async receiveStock(data: ReceiveStockDTO, actorId: string): Promise<StockTransactionDomain> {
    const tx = await this.repo.receiveStock(data, actorId);
    eventBus.publish('StockReceived', { transaction: tx }, actorId);
    return tx;
  }

  async consumeStock(data: ConsumeStockDTO, actorId: string): Promise<StockTransactionDomain> {
    const tx = await this.repo.consumeStock(data, actorId);
    eventBus.publish('StockConsumed', { transaction: tx }, actorId);
    return tx;
  }

  async transferStock(data: TransferStockDTO, actorId: string): Promise<StockTransactionDomain[]> {
    const txs = await this.repo.transferStock(data, actorId);
    eventBus.publish('StockTransferred', { transactions: txs }, actorId);
    return txs;
  }

  async getInventoryTimeline(inventoryItemId: string): Promise<StockTransactionDomain[]> {
    return this.repo.getInventoryTimeline(inventoryItemId);
  }

  // --- Reservations ---
  async reserveStock(data: CreateReservationDTO, actorId: string): Promise<StockReservationDomain> {
    const reservation = await this.repo.reserveStock(data, actorId);
    eventBus.publish('StockReserved', { reservation }, actorId);
    return reservation;
  }

  async fulfillReservation(id: string, actorId: string): Promise<{ reservation: StockReservationDomain, transaction: StockTransactionDomain }> {
    const result = await this.repo.fulfillReservation(id, actorId);
    eventBus.publish('ReservationFulfilled', { reservation: result.reservation, transaction: result.transaction }, actorId);
    // Note: We also emit StockConsumed here because a fulfillment consumes stock
    eventBus.publish('StockConsumed', { transaction: result.transaction }, actorId);
    return result;
  }

  async cancelReservation(id: string, actorId: string, reason: 'CANCELLED' | 'EXPIRED' = 'CANCELLED'): Promise<StockReservationDomain> {
    const reservation = await this.repo.cancelReservation(id, actorId, reason);
    eventBus.publish('ReservationCancelled', { reservation, reason }, actorId);
    return reservation;
  }

  async getActiveReservations(inventoryItemId: string, warehouseId: string): Promise<StockReservationDomain[]> {
    return this.repo.getActiveReservations(inventoryItemId, warehouseId);
  }

  // --- Cycle Counts ---
  async startCycleCount(data: CreateCycleCountDTO, actorId: string): Promise<CycleCountDomain> {
    return this.repo.startCycleCount(data, actorId);
  }

  async recordCount(cycleCountId: string, data: RecordCountDTO, _actorId: string): Promise<CycleCountItemDomain> {
    // Ideally verify actorId has access, for now pass through
    return this.repo.recordCount(cycleCountId, data);
  }

  async completeCycleCount(id: string, actorId: string): Promise<{ cycleCount: CycleCountDomain, transactions: StockTransactionDomain[] }> {
    const result = await this.repo.completeCycleCount(id, actorId);
    eventBus.publish('CycleCountCompleted', { cycleCount: result.cycleCount }, actorId);
    if (result.transactions.length > 0) {
      eventBus.publish('StockAdjusted', { transactions: result.transactions }, actorId);
    }
    return result;
  }

  // --- Analytics & Low Stock ---
  async runLowStockCheck(actorId: string = 'SYSTEM'): Promise<void> {
    const lowStockItems = await this.repo.checkLowStock();
    for (const item of lowStockItems) {
      eventBus.publish('LowStockDetected', { item }, actorId);
    }
  }

  async getInventoryKPIs(): Promise<InventoryKPIDomain> {
    return this.repo.getInventoryKPIs();
  }

  async getWarehouseUtilization(): Promise<WarehouseUtilizationDomain[]> {
    return this.repo.getWarehouseUtilization();
  }
}
