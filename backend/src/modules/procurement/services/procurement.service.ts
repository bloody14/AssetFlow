import { PrismaProcurementRepository } from '../repositories/procurement.repository';
import { eventBus } from '../../../shared/events/eventBus';
import {
  SupplierDomain,
  CreateSupplierDTO,
  UpdateSupplierDTO,
  SupplierContactDomain,
  CreateSupplierContactDTO,
  SupplierCatalogItemDomain,
  CreateSupplierCatalogItemDTO,
} from '../types/procurement.types';

export class ProcurementService {
  constructor(private readonly repo: PrismaProcurementRepository) {}

  // --- Supplier ---
  async createSupplier(data: CreateSupplierDTO): Promise<SupplierDomain> {
    return this.repo.createSupplier(data);
  }

  async getSupplier(id: string): Promise<SupplierDomain> {
    return this.repo.getSupplier(id);
  }

  async updateSupplier(id: string, data: UpdateSupplierDTO): Promise<SupplierDomain> {
    return this.repo.updateSupplier(id, data);
  }

  // --- Supplier Contact ---
  async addSupplierContact(data: CreateSupplierContactDTO): Promise<SupplierContactDomain> {
    return this.repo.addSupplierContact(data);
  }

  async getSupplierContacts(supplierId: string): Promise<SupplierContactDomain[]> {
    return this.repo.getSupplierContacts(supplierId);
  }

  // --- Supplier Catalog ---
  async addCatalogItem(data: CreateSupplierCatalogItemDTO): Promise<SupplierCatalogItemDomain> {
    return this.repo.addCatalogItem(data);
  }

  async getSupplierCatalog(supplierId: string): Promise<SupplierCatalogItemDomain[]> {
    return this.repo.getSupplierCatalog(supplierId);
  }

  // --- Purchase Requests ---
  async createPurchaseRequest(
    data: import('../types/procurement.types').CreatePurchaseRequestDTO
  ): Promise<import('../types/procurement.types').PurchaseRequestDomain> {
    const pr = await this.repo.createPurchaseRequest(data);

    eventBus.publish(
      'PurchaseRequestCreated',
      {
        purchaseRequestId: pr.id,
        requesterId: pr.requesterId,
        priority: pr.priority,
        items:
          pr.items?.map((i) => ({
            inventoryItemId: i.inventoryItemId,
            quantity: i.quantity,
          })) || [],
        createdAt: pr.createdAt,
      },
      pr.requesterId
    );

    return pr;
  }

  async getPurchaseRequest(
    id: string
  ): Promise<import('../types/procurement.types').PurchaseRequestDomain> {
    return this.repo.getPurchaseRequest(id);
  }

  async submitApproval(
    id: string,
    data: import('../types/procurement.types').SubmitApprovalDTO
  ): Promise<import('../types/procurement.types').PurchaseRequestDomain> {
    const pr = await this.repo.submitApproval(id, data);
    // Ideally emit event here: PurchaseRequestApproved or PurchaseRequestRejected
    return pr;
  }

  // --- Purchase Orders ---
  async generatePurchaseOrder(
    data: import('../types/procurement.types').CreatePurchaseOrderDTO
  ): Promise<import('../types/procurement.types').PurchaseOrderDomain> {
    return this.repo.generatePurchaseOrder(data);
  }

  async getPurchaseOrder(
    id: string
  ): Promise<import('../types/procurement.types').PurchaseOrderDomain> {
    return this.repo.getPurchaseOrder(id);
  }

  async issuePurchaseOrder(
    id: string
  ): Promise<import('../types/procurement.types').PurchaseOrderDomain> {
    const po = await this.repo.issuePurchaseOrder(id);
    // Ideally emit event here: PurchaseOrderIssued
    return po;
  }

  // --- Goods Receipt ---
  async executeGoodsReceipt(
    data: import('../types/procurement.types').ExecuteGoodsReceiptDTO
  ): Promise<import('../types/procurement.types').GoodsReceiptDomain> {
    const gr = await this.repo.executeGoodsReceipt(data);

    // Domain Event: GoodsReceiptCompleted
    // This explicitly complies with the architectural requirement that Procurement emits
    // the event but DOES NOT update the Inventory Ledger directly.
    eventBus.publish(
      'GoodsReceiptCompleted',
      {
        receiptNumber: gr.receiptNumber,
        purchaseOrderId: gr.purchaseOrderId,
        items: gr.items?.map((i) => ({
          inventoryItemId: i.inventoryItemId,
          quantityReceived: i.quantityReceived,
        })),
        receivedAt: gr.createdAt,
      },
      data.receivedById
    );

    return gr;
  }

  // --- Analytics ---
  async getSupplierMetrics(
    supplierId: string
  ): Promise<import('../types/procurement.types').SupplierMetricsDomain> {
    return this.repo.getSupplierMetrics(supplierId);
  }

  async recalculateSupplierMetrics(supplierId: string): Promise<void> {
    await this.repo.recalculateSupplierMetrics(supplierId);
    eventBus.publish(
      'SupplierMetricsRecalculated',
      { supplierId, timestamp: new Date() },
      'SYSTEM_PROCUREMENT'
    );
  }

  async recordTimelineEvent(
    purchaseOrderId: string | null,
    purchaseRequestId: string | null,
    eventType: string,
    payload: any
  ): Promise<void> {
    await this.repo.recordTimelineEvent(purchaseOrderId, purchaseRequestId, eventType, payload);
    eventBus.publish(
      'ProcurementTimelineEventRecorded',
      { purchaseOrderId, purchaseRequestId, eventType, timestamp: new Date() },
      'SYSTEM_PROCUREMENT'
    );
  }
}
