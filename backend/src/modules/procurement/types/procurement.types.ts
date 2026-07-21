export type SupplierStatus =
  'ACTIVE' | 'PENDING_APPROVAL' | 'INACTIVE' | 'SUSPENDED' | 'BLACKLISTED';

export interface SupplierDomain {
  id: string;
  name: string;
  code: string | null;
  taxId: string | null;
  website: string | null;
  status: SupplierStatus;
  rating: number | null;
  leadTimeDays: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateSupplierDTO {
  name: string;
  code?: string;
  taxId?: string;
  website?: string;
  status?: SupplierStatus;
  rating?: number;
  leadTimeDays?: number;
}

export interface UpdateSupplierDTO {
  name?: string;
  code?: string;
  taxId?: string;
  website?: string;
  status?: SupplierStatus;
  rating?: number;
  leadTimeDays?: number;
}

export interface SupplierContactDomain {
  id: string;
  supplierId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isPrimary: boolean;
  role: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSupplierContactDTO {
  supplierId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isPrimary?: boolean;
  role?: string;
}

export interface SupplierCatalogItemDomain {
  id: string;
  supplierId: string;
  inventoryItemId: string;
  supplierSku: string;
  price: number;
  currency: string;
  minimumOrderQty: number;
  leadTimeDays: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSupplierCatalogItemDTO {
  supplierId: string;
  inventoryItemId: string;
  supplierSku: string;
  price: number;
  currency?: string;
  minimumOrderQty?: number;
  leadTimeDays?: number;
  isActive?: boolean;
}

// ------------------------------------------------------
// Phase 4.2: Purchase Requests
// ------------------------------------------------------

export type PurchaseRequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PurchaseRequestDomain {
  id: string;
  requesterId: string;
  departmentId: string;
  justification: string;
  priority: PurchaseRequestPriority;
  status: ApprovalStatus;
  items?: PurchaseRequestItemDomain[];
  approvals?: PurchaseRequestApprovalDomain[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface PurchaseRequestItemDomain {
  id: string;
  purchaseRequestId: string;
  inventoryItemId: string;
  quantity: number;
  estimatedPrice: number | null;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseRequestApprovalDomain {
  id: string;
  purchaseRequestId: string;
  approverId: string;
  status: ApprovalStatus;
  comments: string | null;
  step: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePurchaseRequestDTO {
  requesterId: string;
  departmentId: string;
  justification: string;
  priority?: PurchaseRequestPriority;
  items: {
    inventoryItemId: string;
    quantity: number;
    estimatedPrice?: number;
    currency?: string;
  }[];
}

export interface SubmitApprovalDTO {
  approverId: string;
  status: 'APPROVED' | 'REJECTED';
  comments?: string;
}

// ------------------------------------------------------
// Phase 4.3: Purchase Orders
// ------------------------------------------------------

export type PurchaseOrderStatus =
  'DRAFT' | 'ISSUED' | 'PARTIALLY_RECEIVED' | 'FULFILLED' | 'CANCELLED';

export interface PurchaseOrderDomain {
  id: string;
  orderNumber: string;
  purchaseRequestId: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  expectedDelivery: Date | null;
  items?: PurchaseOrderItemDomain[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface PurchaseOrderItemDomain {
  id: string;
  purchaseOrderId: string;
  purchaseRequestItemId: string | null;
  inventoryItemId: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePurchaseOrderDTO {
  purchaseRequestId: string;
  supplierId: string;
  expectedDelivery?: Date;
}

export interface IssuePurchaseOrderDTO {
  // Empty for now, but explicit intent
}

// ------------------------------------------------------
// Phase 4.4: Goods Receipt
// ------------------------------------------------------

export interface GoodsReceiptDomain {
  id: string;
  receiptNumber: string;
  purchaseOrderId: string;
  receivedById: string;
  items?: GoodsReceiptItemDomain[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface GoodsReceiptItemDomain {
  id: string;
  goodsReceiptId: string;
  purchaseOrderItemId: string;
  inventoryItemId: string;
  quantityReceived: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecuteGoodsReceiptDTO {
  purchaseOrderId: string;
  receivedById: string;
  items: {
    purchaseOrderItemId: string;
    quantityReceived: number;
  }[];
}

// ------------------------------------------------------
// Phase 4.5: Procurement Analytics
// ------------------------------------------------------

export interface ProcurementTimelineDomain {
  id: string;
  purchaseOrderId: string | null;
  purchaseRequestId: string | null;
  eventType: string;
  eventPayload: any;
  createdAt: Date;
}

export interface SupplierMetricsDomain {
  id: string;
  supplierId: string;
  averageLeadTimeDays: number;
  qualityScore: number;
  totalOrdersFulfilled: number;
  calculatedAt: Date;
  calculationVersion: string;
  updatedAt: Date;
}
