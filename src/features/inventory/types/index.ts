export interface Warehouse {
  id: string;
  name: string;
  location: string | null;
  managerId: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface InventoryCategory {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  description: string | null;
  unitOfMeasure: 'PCS' | 'BOX' | 'PACK' | 'ROLL' | 'KG' | 'LITER' | 'METER';
  reorderPoint: number;
  reorderQuantity: number;
  createdAt: string;
  updatedAt: string;
  
  // Computed fields often returned by the API
  category?: InventoryCategory;
  stockLevels?: StockLevel[];
}

export interface StockLevel {
  inventoryItemId: string;
  warehouseId: string;
  quantityAvailable: number;
  quantityReserved: number;
  lastUpdated: string;
  warehouse?: Warehouse;
}

export interface StockTransaction {
  id: string;
  inventoryItemId: string;
  warehouseId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  referenceId: string | null;
  actorId: string;
  notes: string | null;
  createdAt: string;
}

export interface CycleCount {
  id: string;
  warehouseId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  requestedById: string;
  items?: CycleCountItem[];
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CycleCountItem {
  id: string;
  cycleCountId: string;
  inventoryItemId: string;
  expectedQuantity: number;
  countedQuantity: number | null;
  variance: number | null;
  adjustmentReason: 'SHRINKAGE' | 'DAMAGE' | 'OBSOLESCENCE' | 'FOUND' | 'OTHER' | null;
  notes: string | null;
}

export interface InventoryKPIs {
  totalItems: number;
  totalStockAvailable: number;
  lowStockItemsCount: number;
}

export interface WarehouseUtilization {
  warehouseId: string;
  warehouseName: string;
  totalStockAvailable: number;
  totalStockReserved: number;
}

// DTOs for mutations
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

export interface CreateInventoryItemDTO {
  sku: string;
  name: string;
  categoryId: string;
  description?: string;
  unitOfMeasure?: 'PCS' | 'BOX' | 'PACK' | 'ROLL' | 'KG' | 'LITER' | 'METER';
  reorderPoint?: number;
  reorderQuantity?: number;
}

export interface StockActionDTO {
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
