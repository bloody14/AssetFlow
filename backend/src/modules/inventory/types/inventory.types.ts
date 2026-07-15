export interface CreateWarehouseDTO {
  name: string;
  location?: string;
  managerId?: string;
}

export interface UpdateWarehouseDTO {
  name?: string;
  location?: string;
  managerId?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface WarehouseDomain {
  id: string;
  name: string;
  location: string | null;
  managerId: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInventoryCategoryDTO {
  name: string;
  description?: string;
}

export interface InventoryCategoryDomain {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInventoryItemDTO {
  sku: string;
  name: string;
  categoryId: string;
  description?: string;
  unitOfMeasure?: 'PCS' | 'BOX' | 'PACK' | 'ROLL' | 'KG' | 'LITER' | 'METER';
  reorderPoint?: number;
  reorderQuantity?: number;
}

export interface UpdateInventoryItemDTO {
  name?: string;
  categoryId?: string;
  description?: string;
  unitOfMeasure?: 'PCS' | 'BOX' | 'PACK' | 'ROLL' | 'KG' | 'LITER' | 'METER';
  reorderPoint?: number;
  reorderQuantity?: number;
}

export interface InventoryItemDomain {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  description: string | null;
  unitOfMeasure: 'PCS' | 'BOX' | 'PACK' | 'ROLL' | 'KG' | 'LITER' | 'METER';
  reorderPoint: number;
  reorderQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockLevelDomain {
  inventoryItemId: string;
  warehouseId: string;
  quantityAvailable: number;
  quantityReserved: number;
  lastUpdated: Date;
}

export interface StockTransactionDomain {
  id: string;
  inventoryItemId: string;
  warehouseId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  referenceId: string | null;
  actorId: string;
  notes: string | null;
  createdAt: Date;
}

export interface ReceiveStockDTO {
  inventoryItemId: string;
  warehouseId: string;
  quantity: number;
  referenceId?: string;
  notes?: string;
}

export interface ConsumeStockDTO {
  inventoryItemId: string;
  warehouseId: string;
  quantity: number;
  referenceId?: string;
  notes?: string;
}

export interface TransferStockDTO {
  inventoryItemId: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  quantity: number;
  referenceId?: string;
  notes?: string;
}

export interface StockReservationDomain {
  id: string;
  inventoryItemId: string;
  warehouseId: string;
  quantity: number;
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';
  referenceId: string | null;
  notes: string | null;
  requestedById: string;
  expiresAt: Date | null;
  fulfilledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReservationDTO {
  inventoryItemId: string;
  warehouseId: string;
  quantity: number;
  referenceId?: string;
  notes?: string;
  expiresAt?: Date;
}

export interface CycleCountItemDomain {
  id: string;
  cycleCountId: string;
  inventoryItemId: string;
  expectedQuantity: number;
  countedQuantity: number | null;
  variance: number | null;
  adjustmentReason: 'SHRINKAGE' | 'DAMAGE' | 'OBSOLESCENCE' | 'FOUND' | 'OTHER' | null;
  notes: string | null;
}

export interface CycleCountDomain {
  id: string;
  warehouseId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  requestedById: string;
  items?: CycleCountItemDomain[];
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCycleCountDTO {
  warehouseId: string;
  inventoryItemIds: string[];
  notes?: string;
}

export interface RecordCountDTO {
  inventoryItemId: string;
  countedQuantity: number;
  adjustmentReason?: 'SHRINKAGE' | 'DAMAGE' | 'OBSOLESCENCE' | 'FOUND' | 'OTHER';
  notes?: string;
}

export interface InventoryKPIDomain {
  totalItems: number;
  totalStockAvailable: number;
  lowStockItemsCount: number;
}

export interface WarehouseUtilizationDomain {
  warehouseId: string;
  warehouseName: string;
  totalStockAvailable: number;
  totalStockReserved: number;
}
