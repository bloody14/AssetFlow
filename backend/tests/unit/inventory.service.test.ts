import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryService } from '../../src/modules/inventory/services/inventory.service';
import { PrismaInventoryRepository } from '../../src/modules/inventory/repositories/inventory.repository';
import { eventBus } from '../../src/shared/events/eventBus';

describe('Inventory Service', () => {
  let service: InventoryService;
  let mockRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo = {
      createWarehouse: vi.fn(),
      getWarehouse: vi.fn(),
      updateWarehouse: vi.fn(),
      createCategory: vi.fn(),
      getCategory: vi.fn(),
      createInventoryItem: vi.fn(),
      getInventoryItem: vi.fn(),
      updateInventoryItem: vi.fn(),
      getStockLevel: vi.fn(),
      receiveStock: vi.fn(),
      consumeStock: vi.fn(),
      transferStock: vi.fn(),
      getInventoryTimeline: vi.fn(),
      reserveStock: vi.fn(),
      fulfillReservation: vi.fn(),
      cancelReservation: vi.fn(),
      getActiveReservations: vi.fn(),
      startCycleCount: vi.fn(),
      recordCount: vi.fn(),
      completeCycleCount: vi.fn(),
      checkLowStock: vi.fn(),
      getInventoryKPIs: vi.fn(),
      getWarehouseUtilization: vi.fn(),
    };
    service = new InventoryService(mockRepo as unknown as PrismaInventoryRepository);
  });

  it('should create warehouse', async () => {
    const mockWarehouse = {
      id: 'w1', name: 'Main', location: 'NY', managerId: null, status: 'ACTIVE' as const, createdAt: new Date(), updatedAt: new Date()
    };
    mockRepo.createWarehouse.mockResolvedValue(mockWarehouse);

    const result = await service.createWarehouse({ name: 'Main' });
    expect(result.id).toBe('w1');
    expect(mockRepo.createWarehouse).toHaveBeenCalledWith({ name: 'Main' });
  });

  it('should create inventory item', async () => {
    const mockItem = {
      id: 'i1', sku: 'SKU123', name: 'Cable', categoryId: 'c1', description: null,
      unitOfMeasure: 'PCS' as const, reorderPoint: 10, reorderQuantity: 50,
      createdAt: new Date(), updatedAt: new Date()
    };
    mockRepo.createInventoryItem.mockResolvedValue(mockItem);

    const result = await service.createInventoryItem({ sku: 'SKU123', name: 'Cable', categoryId: 'c1' });
    expect(result.sku).toBe('SKU123');
  });

  it('should get stock level', async () => {
    const mockStock = {
      inventoryItemId: 'i1', warehouseId: 'w1', quantityAvailable: 100, quantityReserved: 10, lastUpdated: new Date()
    };
    mockRepo.getStockLevel.mockResolvedValue(mockStock);

    const result = await service.getStockLevel('i1', 'w1');
    expect(result.quantityAvailable).toBe(100);
  });

  describe('Ledger Transactions', () => {
    it('should receive stock and emit event', async () => {
      const mockTx = { id: 'tx1', type: 'IN', quantity: 50 };
      mockRepo.receiveStock.mockResolvedValue(mockTx);
      const publishSpy = vi.spyOn(eventBus, 'publish').mockImplementation(() => {});

      const result = await service.receiveStock({ inventoryItemId: 'i1', warehouseId: 'w1', quantity: 50 }, 'actor1');
      
      expect(result.id).toBe('tx1');
      expect(mockRepo.receiveStock).toHaveBeenCalledWith({ inventoryItemId: 'i1', warehouseId: 'w1', quantity: 50 }, 'actor1');
      expect(publishSpy).toHaveBeenCalledWith('StockReceived', { transaction: mockTx }, 'actor1');
    });

    it('should consume stock and emit event', async () => {
      const mockTx = { id: 'tx2', type: 'OUT', quantity: 10 };
      mockRepo.consumeStock.mockResolvedValue(mockTx);
      mockRepo.getStockLevel.mockResolvedValue({ warehouseId: 'w1', quantityAvailable: 20 });
      mockRepo.getInventoryItem.mockResolvedValue({ id: 'i1', reorderPoint: 5, reorderQuantity: 50 });
      
      const publishSpy = vi.spyOn(eventBus, 'publish').mockImplementation(() => {});

      const result = await service.consumeStock({ inventoryItemId: 'i1', warehouseId: 'w1', quantity: 10 }, 'actor1');
      
      expect(result.id).toBe('tx2');
      expect(mockRepo.consumeStock).toHaveBeenCalledWith({ inventoryItemId: 'i1', warehouseId: 'w1', quantity: 10 }, 'actor1');
      expect(publishSpy).toHaveBeenCalledWith('StockConsumed', { transaction: mockTx }, 'actor1');
    });

    it('should transfer stock and emit event', async () => {
      const mockTxs = [{ id: 'tx3' }, { id: 'tx4' }];
      mockRepo.transferStock.mockResolvedValue(mockTxs);
      const publishSpy = vi.spyOn(eventBus, 'publish').mockImplementation(() => {});

      const payload = { inventoryItemId: 'i1', sourceWarehouseId: 'w1', destinationWarehouseId: 'w2', quantity: 5 };
      const result = await service.transferStock(payload, 'actor1');
      
      expect(result).toHaveLength(2);
      expect(mockRepo.transferStock).toHaveBeenCalledWith(payload, 'actor1');
      expect(publishSpy).toHaveBeenCalledWith('StockTransferred', { transactions: mockTxs }, 'actor1');
    });

    it('should get inventory timeline', async () => {
      const mockTimeline = [{ id: 'tx1' }, { id: 'tx2' }];
      mockRepo.getInventoryTimeline.mockResolvedValue(mockTimeline);

      const result = await service.getInventoryTimeline('i1');
      expect(result).toHaveLength(2);
      expect(mockRepo.getInventoryTimeline).toHaveBeenCalledWith('i1');
    });
  });

  describe('Stock Reservations', () => {
    it('should reserve stock and emit event', async () => {
      const mockReservation = { id: 'r1', status: 'PENDING', quantity: 10 };
      mockRepo.reserveStock.mockResolvedValue(mockReservation);
      const publishSpy = vi.spyOn(eventBus, 'publish').mockImplementation(() => {});

      const result = await service.reserveStock({ inventoryItemId: 'i1', warehouseId: 'w1', quantity: 10 }, 'actor1');
      
      expect(result.id).toBe('r1');
      expect(mockRepo.reserveStock).toHaveBeenCalledWith({ inventoryItemId: 'i1', warehouseId: 'w1', quantity: 10 }, 'actor1');
      expect(publishSpy).toHaveBeenCalledWith('StockReserved', { reservation: mockReservation }, 'actor1');
    });

    it('should fulfill reservation and emit events', async () => {
      const mockResult = { reservation: { id: 'r1', status: 'FULFILLED' }, transaction: { id: 'tx1' } };
      mockRepo.fulfillReservation.mockResolvedValue(mockResult);
      const publishSpy = vi.spyOn(eventBus, 'publish').mockImplementation(() => {});

      const result = await service.fulfillReservation('r1', 'actor1');
      
      expect(result.reservation.status).toBe('FULFILLED');
      expect(mockRepo.fulfillReservation).toHaveBeenCalledWith('r1', 'actor1');
      expect(publishSpy).toHaveBeenCalledWith('ReservationFulfilled', { reservation: mockResult.reservation, transaction: mockResult.transaction }, 'actor1');
      expect(publishSpy).toHaveBeenCalledWith('StockConsumed', { transaction: mockResult.transaction }, 'actor1');
    });

    it('should cancel reservation and emit event', async () => {
      const mockReservation = { id: 'r1', status: 'CANCELLED' };
      mockRepo.cancelReservation.mockResolvedValue(mockReservation);
      const publishSpy = vi.spyOn(eventBus, 'publish').mockImplementation(() => {});

      const result = await service.cancelReservation('r1', 'actor1');
      
      expect(result.status).toBe('CANCELLED');
      expect(mockRepo.cancelReservation).toHaveBeenCalledWith('r1', 'actor1', 'CANCELLED');
      expect(publishSpy).toHaveBeenCalledWith('ReservationCancelled', { reservation: mockReservation, reason: 'CANCELLED' }, 'actor1');
    });

    it('should get active reservations', async () => {
      const mockReservations = [{ id: 'r1' }, { id: 'r2' }];
      mockRepo.getActiveReservations.mockResolvedValue(mockReservations);

      const result = await service.getActiveReservations('i1', 'w1');
      expect(result).toHaveLength(2);
      expect(mockRepo.getActiveReservations).toHaveBeenCalledWith('i1', 'w1');
    });
  });

  describe('Cycle Counts', () => {
    it('should start cycle count', async () => {
      const mockCC = { id: 'cc1', status: 'IN_PROGRESS' };
      mockRepo.startCycleCount.mockResolvedValue(mockCC);

      const payload = { warehouseId: 'w1', inventoryItemIds: ['i1', 'i2'] };
      const result = await service.startCycleCount(payload, 'actor1');
      
      expect(result.id).toBe('cc1');
      expect(mockRepo.startCycleCount).toHaveBeenCalledWith(payload, 'actor1');
    });

    it('should record count', async () => {
      const mockItem = { id: 'cci1', countedQuantity: 10 };
      mockRepo.recordCount.mockResolvedValue(mockItem);

      const payload = { inventoryItemId: 'i1', countedQuantity: 10 };
      const result = await service.recordCount('cc1', payload, 'actor1');
      
      expect(result.countedQuantity).toBe(10);
      expect(mockRepo.recordCount).toHaveBeenCalledWith('cc1', payload);
    });

    it('should complete cycle count and emit events', async () => {
      const mockResult = { cycleCount: { id: 'cc1', status: 'COMPLETED' }, transactions: [{ id: 'tx1' }] };
      mockRepo.completeCycleCount.mockResolvedValue(mockResult);
      const publishSpy = vi.spyOn(eventBus, 'publish').mockImplementation(() => {});

      const result = await service.completeCycleCount('cc1', 'actor1');
      
      expect(result.cycleCount.status).toBe('COMPLETED');
      expect(mockRepo.completeCycleCount).toHaveBeenCalledWith('cc1', 'actor1');
      expect(publishSpy).toHaveBeenCalledWith('CycleCountCompleted', { cycleCount: mockResult.cycleCount }, 'actor1');
      expect(publishSpy).toHaveBeenCalledWith('StockAdjusted', { transactions: mockResult.transactions }, 'actor1');
    });
  });

  describe('Analytics & Low Stock', () => {
    it('should run low stock check and emit events', async () => {
      const mockLowStockItems = [
        { inventoryItemId: 'i1', sku: 'SKU1', name: 'Item 1', quantityAvailable: 5, reorderPoint: 10 }
      ];
      mockRepo.checkLowStock.mockResolvedValue(mockLowStockItems);
      const publishSpy = vi.spyOn(eventBus, 'publish').mockImplementation(() => {});

      await service.runLowStockCheck('SYSTEM');

      expect(mockRepo.checkLowStock).toHaveBeenCalled();
      expect(publishSpy).toHaveBeenCalledWith('LowStockDetected', { item: mockLowStockItems[0] }, 'SYSTEM');
    });

    it('should get inventory KPIs', async () => {
      const mockKPIs = { totalItems: 10, totalStockAvailable: 100, lowStockItemsCount: 2 };
      mockRepo.getInventoryKPIs.mockResolvedValue(mockKPIs);

      const result = await service.getInventoryKPIs();
      expect(result.totalItems).toBe(10);
      expect(mockRepo.getInventoryKPIs).toHaveBeenCalled();
    });

    it('should get warehouse utilization', async () => {
      const mockUtilization = [{ warehouseId: 'w1', warehouseName: 'W1', totalStockAvailable: 50, totalStockReserved: 5 }];
      mockRepo.getWarehouseUtilization.mockResolvedValue(mockUtilization);

      const result = await service.getWarehouseUtilization();
      expect(result).toHaveLength(1);
      expect(result[0].totalStockAvailable).toBe(50);
      expect(mockRepo.getWarehouseUtilization).toHaveBeenCalled();
    });
  });
});
