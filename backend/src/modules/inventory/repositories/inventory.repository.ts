import { prisma } from '../../../config/prisma';
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
import { AppError } from '../../../shared/appError';
import { HTTP_STATUS } from '../../../constants/httpStatus';

export class PrismaInventoryRepository {
  // --- Warehouse ---
  private mapToWarehouseDomain(w: import('@prisma/client').Warehouse): WarehouseDomain {
    return {
      id: w.id,
      name: w.name,
      location: w.location,
      managerId: w.managerId,
      status: w.status,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    };
  }

  async createWarehouse(data: CreateWarehouseDTO): Promise<WarehouseDomain> {
    const existing = await prisma.warehouse.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new AppError('Warehouse name already exists', HTTP_STATUS.CONFLICT, 'DUPLICATE_NAME');
    }
    const warehouse = await prisma.warehouse.create({ data });
    return this.mapToWarehouseDomain(warehouse);
  }

  async getWarehouse(id: string): Promise<WarehouseDomain> {
    const warehouse = await prisma.warehouse.findUnique({ where: { id } });
    if (!warehouse) {
      throw new AppError('Warehouse not found', HTTP_STATUS.NOT_FOUND, 'WAREHOUSE_NOT_FOUND');
    }
    return this.mapToWarehouseDomain(warehouse);
  }

  async updateWarehouse(id: string, data: UpdateWarehouseDTO): Promise<WarehouseDomain> {
    const warehouse = await prisma.warehouse.findUnique({ where: { id } });
    if (!warehouse) {
      throw new AppError('Warehouse not found', HTTP_STATUS.NOT_FOUND, 'WAREHOUSE_NOT_FOUND');
    }
    const updated = await prisma.warehouse.update({ where: { id }, data });
    return this.mapToWarehouseDomain(updated);
  }

  // --- Category ---
  private mapToCategoryDomain(
    c: import('@prisma/client').InventoryCategory
  ): InventoryCategoryDomain {
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  async createCategory(data: CreateInventoryCategoryDTO): Promise<InventoryCategoryDomain> {
    const existing = await prisma.inventoryCategory.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new AppError('Category name already exists', HTTP_STATUS.CONFLICT, 'DUPLICATE_NAME');
    }
    const category = await prisma.inventoryCategory.create({ data });
    return this.mapToCategoryDomain(category);
  }

  async getCategory(id: string): Promise<InventoryCategoryDomain> {
    const category = await prisma.inventoryCategory.findUnique({ where: { id } });
    if (!category) {
      throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND, 'CATEGORY_NOT_FOUND');
    }
    return this.mapToCategoryDomain(category);
  }

  // --- Inventory Item ---
  private mapToItemDomain(i: import('@prisma/client').InventoryItem): InventoryItemDomain {
    return {
      id: i.id,
      sku: i.sku,
      name: i.name,
      categoryId: i.categoryId,
      description: i.description,
      unitOfMeasure: i.unitOfMeasure,
      reorderPoint: i.reorderPoint,
      reorderQuantity: i.reorderQuantity,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    };
  }

  async createInventoryItem(data: CreateInventoryItemDTO): Promise<InventoryItemDomain> {
    const existingSku = await prisma.inventoryItem.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
      throw new AppError('SKU already exists', HTTP_STATUS.CONFLICT, 'DUPLICATE_SKU');
    }
    const item = await prisma.inventoryItem.create({ data });
    return this.mapToItemDomain(item);
  }

  async getInventoryItem(id: string): Promise<InventoryItemDomain> {
    const item = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) {
      throw new AppError('Inventory item not found', HTTP_STATUS.NOT_FOUND, 'ITEM_NOT_FOUND');
    }
    return this.mapToItemDomain(item);
  }

  async updateInventoryItem(
    id: string,
    data: UpdateInventoryItemDTO
  ): Promise<InventoryItemDomain> {
    const item = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) {
      throw new AppError('Inventory item not found', HTTP_STATUS.NOT_FOUND, 'ITEM_NOT_FOUND');
    }
    const updated = await prisma.inventoryItem.update({ where: { id }, data });
    return this.mapToItemDomain(updated);
  }

  // --- Stock Level ---
  private mapToStockLevelDomain(s: import('@prisma/client').StockLevel): StockLevelDomain {
    return {
      inventoryItemId: s.inventoryItemId,
      warehouseId: s.warehouseId,
      quantityAvailable: s.quantityAvailable,
      quantityReserved: s.quantityReserved,
      lastUpdated: s.lastUpdated,
    };
  }

  async getStockLevel(inventoryItemId: string, warehouseId: string): Promise<StockLevelDomain> {
    const level = await prisma.stockLevel.findUnique({
      where: { inventoryItemId_warehouseId: { inventoryItemId, warehouseId } },
    });
    if (!level) {
      return {
        inventoryItemId,
        warehouseId,
        quantityAvailable: 0,
        quantityReserved: 0,
        lastUpdated: new Date(),
      };
    }
    return this.mapToStockLevelDomain(level);
  }

  // --- Ledger / Transactions ---
  private mapToTransactionDomain(
    t: import('@prisma/client').StockTransaction
  ): StockTransactionDomain {
    return {
      id: t.id,
      inventoryItemId: t.inventoryItemId,
      warehouseId: t.warehouseId,
      type: t.type,
      quantity: t.quantity,
      referenceId: t.referenceId,
      actorId: t.actorId,
      notes: t.notes,
      createdAt: t.createdAt,
    };
  }

  async receiveStock(data: ReceiveStockDTO, actorId: string): Promise<StockTransactionDomain> {
    const result = await prisma.$transaction(async (tx) => {
      // Idempotency check: if referenceId is provided, ensure we haven't already processed it
      if (data.referenceId) {
        const existingTx = await tx.stockTransaction.findFirst({
          where: {
            referenceId: data.referenceId,
            type: 'IN',
            inventoryItemId: data.inventoryItemId,
            warehouseId: data.warehouseId,
          },
        });
        if (existingTx) {
          return existingTx;
        }
      }

      // Upsert stock level
      await tx.stockLevel.upsert({
        where: {
          inventoryItemId_warehouseId: {
            inventoryItemId: data.inventoryItemId,
            warehouseId: data.warehouseId,
          },
        },
        create: {
          inventoryItemId: data.inventoryItemId,
          warehouseId: data.warehouseId,
          quantityAvailable: data.quantity,
        },
        update: { quantityAvailable: { increment: data.quantity } },
      });

      // Create transaction
      return tx.stockTransaction.create({
        data: {
          inventoryItemId: data.inventoryItemId,
          warehouseId: data.warehouseId,
          type: 'IN',
          quantity: data.quantity,
          referenceId: data.referenceId,
          notes: data.notes,
          actorId,
        },
      });
    });

    return this.mapToTransactionDomain(result);
  }

  async consumeStock(data: ConsumeStockDTO, actorId: string): Promise<StockTransactionDomain> {
    const result = await prisma.$transaction(async (tx) => {
      const stockLevel = await tx.stockLevel.findUnique({
        where: {
          inventoryItemId_warehouseId: {
            inventoryItemId: data.inventoryItemId,
            warehouseId: data.warehouseId,
          },
        },
      });

      if (!stockLevel || stockLevel.quantityAvailable < data.quantity) {
        throw new AppError(
          'Insufficient stock available',
          HTTP_STATUS.BAD_REQUEST,
          'INSUFFICIENT_STOCK'
        );
      }

      await tx.stockLevel.update({
        where: {
          inventoryItemId_warehouseId: {
            inventoryItemId: data.inventoryItemId,
            warehouseId: data.warehouseId,
          },
        },
        data: { quantityAvailable: { decrement: data.quantity } },
      });

      return tx.stockTransaction.create({
        data: {
          inventoryItemId: data.inventoryItemId,
          warehouseId: data.warehouseId,
          type: 'OUT',
          quantity: data.quantity,
          referenceId: data.referenceId,
          notes: data.notes,
          actorId,
        },
      });
    });

    return this.mapToTransactionDomain(result);
  }

  async transferStock(data: TransferStockDTO, actorId: string): Promise<StockTransactionDomain[]> {
    const results = await prisma.$transaction(async (tx) => {
      const sourceStock = await tx.stockLevel.findUnique({
        where: {
          inventoryItemId_warehouseId: {
            inventoryItemId: data.inventoryItemId,
            warehouseId: data.sourceWarehouseId,
          },
        },
      });

      if (!sourceStock || sourceStock.quantityAvailable < data.quantity) {
        throw new AppError(
          'Insufficient stock at source warehouse',
          HTTP_STATUS.BAD_REQUEST,
          'INSUFFICIENT_STOCK'
        );
      }

      await tx.stockLevel.update({
        where: {
          inventoryItemId_warehouseId: {
            inventoryItemId: data.inventoryItemId,
            warehouseId: data.sourceWarehouseId,
          },
        },
        data: { quantityAvailable: { decrement: data.quantity } },
      });

      await tx.stockLevel.upsert({
        where: {
          inventoryItemId_warehouseId: {
            inventoryItemId: data.inventoryItemId,
            warehouseId: data.destinationWarehouseId,
          },
        },
        create: {
          inventoryItemId: data.inventoryItemId,
          warehouseId: data.destinationWarehouseId,
          quantityAvailable: data.quantity,
        },
        update: { quantityAvailable: { increment: data.quantity } },
      });

      const outTx = await tx.stockTransaction.create({
        data: {
          inventoryItemId: data.inventoryItemId,
          warehouseId: data.sourceWarehouseId,
          type: 'TRANSFER',
          quantity: -data.quantity,
          referenceId: data.referenceId,
          notes: data.notes
            ? `Transfer OUT: ${data.notes}`
            : `Transfer to ${data.destinationWarehouseId}`,
          actorId,
        },
      });

      const inTx = await tx.stockTransaction.create({
        data: {
          inventoryItemId: data.inventoryItemId,
          warehouseId: data.destinationWarehouseId,
          type: 'TRANSFER',
          quantity: data.quantity,
          referenceId: data.referenceId,
          notes: data.notes
            ? `Transfer IN: ${data.notes}`
            : `Transfer from ${data.sourceWarehouseId}`,
          actorId,
        },
      });

      return [outTx, inTx];
    });

    return results.map((t) => this.mapToTransactionDomain(t));
  }

  async getInventoryTimeline(inventoryItemId: string): Promise<StockTransactionDomain[]> {
    const transactions = await prisma.stockTransaction.findMany({
      where: { inventoryItemId },
      orderBy: { createdAt: 'desc' },
    });
    return transactions.map((t) => this.mapToTransactionDomain(t));
  }

  // --- Reservations ---
  private mapToReservationDomain(
    r: import('@prisma/client').StockReservation
  ): StockReservationDomain {
    return {
      id: r.id,
      inventoryItemId: r.inventoryItemId,
      warehouseId: r.warehouseId,
      quantity: r.quantity,
      status: r.status,
      referenceId: r.referenceId,
      notes: r.notes,
      requestedById: r.requestedById,
      expiresAt: r.expiresAt,
      fulfilledAt: r.fulfilledAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  async reserveStock(data: CreateReservationDTO, actorId: string): Promise<StockReservationDomain> {
    const result = await prisma.$transaction(async (tx) => {
      const stockLevel = await tx.stockLevel.findUnique({
        where: {
          inventoryItemId_warehouseId: {
            inventoryItemId: data.inventoryItemId,
            warehouseId: data.warehouseId,
          },
        },
      });

      // quantityAvailable - quantityReserved must be >= data.quantity
      const available = stockLevel ? stockLevel.quantityAvailable - stockLevel.quantityReserved : 0;
      if (available < data.quantity) {
        throw new AppError(
          'Insufficient unreserved stock available',
          HTTP_STATUS.BAD_REQUEST,
          'INSUFFICIENT_STOCK'
        );
      }

      await tx.stockLevel.update({
        where: {
          inventoryItemId_warehouseId: {
            inventoryItemId: data.inventoryItemId,
            warehouseId: data.warehouseId,
          },
        },
        data: { quantityReserved: { increment: data.quantity } },
      });

      return tx.stockReservation.create({
        data: {
          inventoryItemId: data.inventoryItemId,
          warehouseId: data.warehouseId,
          quantity: data.quantity,
          referenceId: data.referenceId,
          notes: data.notes,
          expiresAt: data.expiresAt,
          requestedById: actorId,
          status: 'PENDING',
        },
      });
    });

    return this.mapToReservationDomain(result);
  }

  async fulfillReservation(
    id: string,
    actorId: string
  ): Promise<{ reservation: StockReservationDomain; transaction: StockTransactionDomain }> {
    const result = await prisma.$transaction(async (tx) => {
      const reservation = await tx.stockReservation.findUnique({ where: { id } });
      if (!reservation || reservation.status !== 'PENDING') {
        throw new AppError(
          'Reservation not found or not pending',
          HTTP_STATUS.BAD_REQUEST,
          'INVALID_RESERVATION'
        );
      }

      // Decrement reserved and available
      await tx.stockLevel.update({
        where: {
          inventoryItemId_warehouseId: {
            inventoryItemId: reservation.inventoryItemId,
            warehouseId: reservation.warehouseId,
          },
        },
        data: {
          quantityReserved: { decrement: reservation.quantity },
          quantityAvailable: { decrement: reservation.quantity },
        },
      });

      const updatedReservation = await tx.stockReservation.update({
        where: { id },
        data: { status: 'FULFILLED', fulfilledAt: new Date() },
      });

      const transaction = await tx.stockTransaction.create({
        data: {
          inventoryItemId: reservation.inventoryItemId,
          warehouseId: reservation.warehouseId,
          type: 'OUT',
          quantity: reservation.quantity,
          referenceId: reservation.referenceId || `RES-${reservation.id}`,
          notes: `Fulfillment of reservation ${reservation.id}`,
          actorId,
        },
      });

      return { reservation: updatedReservation, transaction };
    });

    return {
      reservation: this.mapToReservationDomain(result.reservation),
      transaction: this.mapToTransactionDomain(result.transaction),
    };
  }

  async cancelReservation(
    id: string,
    _actorId: string,
    reason: 'CANCELLED' | 'EXPIRED'
  ): Promise<StockReservationDomain> {
    const result = await prisma.$transaction(async (tx) => {
      const reservation = await tx.stockReservation.findUnique({ where: { id } });
      if (!reservation || reservation.status !== 'PENDING') {
        throw new AppError(
          'Reservation not found or not pending',
          HTTP_STATUS.BAD_REQUEST,
          'INVALID_RESERVATION'
        );
      }

      // Decrement reserved (freeing it up)
      await tx.stockLevel.update({
        where: {
          inventoryItemId_warehouseId: {
            inventoryItemId: reservation.inventoryItemId,
            warehouseId: reservation.warehouseId,
          },
        },
        data: { quantityReserved: { decrement: reservation.quantity } },
      });

      return tx.stockReservation.update({
        where: { id },
        data: { status: reason },
      });
    });

    return this.mapToReservationDomain(result);
  }

  async getActiveReservations(
    inventoryItemId: string,
    warehouseId: string
  ): Promise<StockReservationDomain[]> {
    const reservations = await prisma.stockReservation.findMany({
      where: { inventoryItemId, warehouseId, status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    });
    return reservations.map((r) => this.mapToReservationDomain(r));
  }

  // --- Cycle Counts ---
  private mapToCycleCountDomain(
    c: import('@prisma/client').CycleCount & { items?: import('@prisma/client').CycleCountItem[] }
  ): CycleCountDomain {
    return {
      id: c.id,
      warehouseId: c.warehouseId,
      status: c.status,
      notes: c.notes,
      requestedById: c.requestedById,
      completedAt: c.completedAt,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      items: c.items
        ? c.items.map((i) => ({
            id: i.id,
            cycleCountId: i.cycleCountId,
            inventoryItemId: i.inventoryItemId,
            expectedQuantity: i.expectedQuantity,
            countedQuantity: i.countedQuantity,
            variance: i.variance,
            adjustmentReason: i.adjustmentReason,
            notes: i.notes,
          }))
        : undefined,
    };
  }

  async startCycleCount(data: CreateCycleCountDTO, actorId: string): Promise<CycleCountDomain> {
    const result = await prisma.$transaction(async (tx) => {
      // Build items with expected quantities
      const itemsData = await Promise.all(
        data.inventoryItemIds.map(async (itemId) => {
          const stockLevel = await tx.stockLevel.findUnique({
            where: {
              inventoryItemId_warehouseId: {
                inventoryItemId: itemId,
                warehouseId: data.warehouseId,
              },
            },
          });
          return {
            inventoryItemId: itemId,
            expectedQuantity: stockLevel ? stockLevel.quantityAvailable : 0,
          };
        })
      );

      return tx.cycleCount.create({
        data: {
          warehouseId: data.warehouseId,
          status: 'IN_PROGRESS',
          notes: data.notes,
          requestedById: actorId,
          items: {
            create: itemsData,
          },
        },
        include: { items: true },
      });
    });

    return this.mapToCycleCountDomain(result);
  }

  async recordCount(cycleCountId: string, data: RecordCountDTO): Promise<CycleCountItemDomain> {
    const item = await prisma.cycleCountItem.findUnique({
      where: {
        cycleCountId_inventoryItemId: { cycleCountId, inventoryItemId: data.inventoryItemId },
      },
    });
    if (!item) {
      throw new AppError(
        'Item not found in this cycle count',
        HTTP_STATUS.NOT_FOUND,
        'INVALID_ITEM'
      );
    }

    const variance = data.countedQuantity - item.expectedQuantity;

    const updatedItem = await prisma.cycleCountItem.update({
      where: { id: item.id },
      data: {
        countedQuantity: data.countedQuantity,
        variance,
        adjustmentReason: data.adjustmentReason,
        notes: data.notes,
      },
    });

    return {
      id: updatedItem.id,
      cycleCountId: updatedItem.cycleCountId,
      inventoryItemId: updatedItem.inventoryItemId,
      expectedQuantity: updatedItem.expectedQuantity,
      countedQuantity: updatedItem.countedQuantity,
      variance: updatedItem.variance,
      adjustmentReason: updatedItem.adjustmentReason,
      notes: updatedItem.notes,
    };
  }

  async completeCycleCount(
    id: string,
    actorId: string
  ): Promise<{ cycleCount: CycleCountDomain; transactions: StockTransactionDomain[] }> {
    const result = await prisma.$transaction(async (tx) => {
      const cycleCount = await tx.cycleCount.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!cycleCount || cycleCount.status !== 'IN_PROGRESS') {
        throw new AppError(
          'Cycle count not found or not in progress',
          HTTP_STATUS.BAD_REQUEST,
          'INVALID_CYCLE_COUNT'
        );
      }

      // Check if all items are counted
      const uncounted = cycleCount.items.filter((i) => i.countedQuantity === null);
      if (uncounted.length > 0) {
        throw new AppError(
          'Cannot complete cycle count with uncounted items',
          HTTP_STATUS.BAD_REQUEST,
          'UNCOUNTED_ITEMS'
        );
      }

      const transactions: StockTransactionDomain[] = [];

      // Process variances
      for (const item of cycleCount.items) {
        if (item.variance && item.variance !== 0) {
          // Issue adjustment transaction
          const t = await tx.stockTransaction.create({
            data: {
              inventoryItemId: item.inventoryItemId,
              warehouseId: cycleCount.warehouseId,
              type: 'ADJUSTMENT',
              quantity: item.variance,
              referenceId: `CC-${cycleCount.id}`,
              notes: item.adjustmentReason
                ? `Adjustment for ${item.adjustmentReason}`
                : `Cycle Count Adjustment`,
              actorId,
            },
          });

          // Update stock level
          await tx.stockLevel.upsert({
            where: {
              inventoryItemId_warehouseId: {
                inventoryItemId: item.inventoryItemId,
                warehouseId: cycleCount.warehouseId,
              },
            },
            create: {
              inventoryItemId: item.inventoryItemId,
              warehouseId: cycleCount.warehouseId,
              quantityAvailable: item.variance > 0 ? item.variance : 0,
            },
            update: { quantityAvailable: { increment: item.variance } },
          });

          transactions.push(this.mapToTransactionDomain(t));
        }
      }

      const updatedCycleCount = await tx.cycleCount.update({
        where: { id },
        data: { status: 'COMPLETED', completedAt: new Date() },
        include: { items: true },
      });

      return { cycleCount: updatedCycleCount, transactions };
    });

    return {
      cycleCount: this.mapToCycleCountDomain(result.cycleCount),
      transactions: result.transactions,
    };
  }

  // --- Analytics & Low Stock ---
  async checkLowStock(): Promise<
    {
      inventoryItemId: string;
      sku: string;
      name: string;
      quantityAvailable: number;
      reorderPoint: number;
    }[]
  > {
    // Get all items with their total stock available across all warehouses
    const items = await prisma.inventoryItem.findMany({
      include: {
        stockLevels: true,
      },
    });

    const lowStockItems = [];
    for (const item of items) {
      const totalAvailable = item.stockLevels.reduce(
        (sum, level) => sum + level.quantityAvailable,
        0
      );
      if (totalAvailable <= item.reorderPoint) {
        lowStockItems.push({
          inventoryItemId: item.id,
          sku: item.sku,
          name: item.name,
          quantityAvailable: totalAvailable,
          reorderPoint: item.reorderPoint,
        });
      }
    }
    return lowStockItems;
  }

  async getInventoryKPIs(): Promise<InventoryKPIDomain> {
    const totalItems = await prisma.inventoryItem.count();
    const stockLevels = await prisma.stockLevel.findMany();
    const totalStockAvailable = stockLevels.reduce(
      (sum, level) => sum + level.quantityAvailable,
      0
    );
    const lowStockList = await this.checkLowStock();

    return {
      totalItems,
      totalStockAvailable,
      lowStockItemsCount: lowStockList.length,
    };
  }

  async getWarehouseUtilization(): Promise<WarehouseUtilizationDomain[]> {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        stockLevels: true,
      },
    });

    return warehouses.map((w) => ({
      warehouseId: w.id,
      warehouseName: w.name,
      totalStockAvailable: w.stockLevels.reduce((sum, level) => sum + level.quantityAvailable, 0),
      totalStockReserved: w.stockLevels.reduce((sum, level) => sum + level.quantityReserved, 0),
    }));
  }
}
