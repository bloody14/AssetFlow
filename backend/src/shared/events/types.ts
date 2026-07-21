export interface DomainEvent<T = unknown> {
  eventId: string;
  eventType: string;
  timestamp: Date;
  correlationId?: string;
  actor: {
    id: string;
    type: string;
  };
  version: number;
  payload: T;
}

export type EventHandler<T = unknown> = (event: DomainEvent<T>) => Promise<void> | void;

// Epic 5: Domain Event Payloads

export interface GoodsReceiptCompletedPayload {
  receiptNumber: string;
  purchaseOrderId: string;
  items?: {
    inventoryItemId: string;
    quantityReceived: number;
  }[];
  receivedAt: Date;
}

export interface StockReceivedPayload {
  inventoryItemId: string;
  warehouseId: string;
  quantityReceived: number;
  transactionId: string;
  receivedAt: Date;
}

export interface AssetCreatedPayload {
  assetId: string;
  assetTag: string;
  inventoryItemId: string;
  createdAt: Date;
}

export interface LowStockDetectedPayload {
  inventoryItemId: string;
  warehouseId: string;
  quantityAvailable: number;
  reorderPoint: number;
  reorderQuantity: number;
  detectedAt: Date;
}

export interface PurchaseRequestCreatedPayload {
  purchaseRequestId: string;
  requesterId: string;
  priority: string;
  items: {
    inventoryItemId: string;
    quantity: number;
  }[];
  createdAt: Date;
}
