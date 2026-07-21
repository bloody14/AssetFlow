import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProcurementService } from '../../src/modules/procurement/services/procurement.service';
import { PrismaProcurementRepository } from '../../src/modules/procurement/repositories/procurement.repository';
import { eventBus } from '../../src/shared/events/eventBus';

describe('ProcurementService', () => {
  let service: ProcurementService;
  let mockRepo: Partial<PrismaProcurementRepository>;

  beforeEach(() => {
    mockRepo = {
      createSupplier: vi.fn(),
      getSupplier: vi.fn(),
      updateSupplier: vi.fn(),
      addSupplierContact: vi.fn(),
      getSupplierContacts: vi.fn(),
      addCatalogItem: vi.fn(),
      getSupplierCatalog: vi.fn(),
    };
    service = new ProcurementService(mockRepo as unknown as PrismaProcurementRepository);
  });

  describe('Supplier Management', () => {
    it('should create a supplier', async () => {
      const dto = { name: 'Tech Vendor', status: 'ACTIVE' as const };
      const domain = { id: 's1', ...dto, code: 'TV1', taxId: null, website: null, rating: null, leadTimeDays: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockRepo.createSupplier.mockResolvedValue(domain);

      const result = await service.createSupplier(dto);
      expect(result.id).toBe('s1');
      expect(mockRepo.createSupplier).toHaveBeenCalledWith(dto);
    });

    it('should get a supplier', async () => {
      const domain = { id: 's1', name: 'Tech Vendor', status: 'ACTIVE' as const, code: 'TV1', taxId: null, website: null, rating: null, leadTimeDays: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockRepo.getSupplier.mockResolvedValue(domain);

      const result = await service.getSupplier('s1');
      expect(result.name).toBe('Tech Vendor');
      expect(mockRepo.getSupplier).toHaveBeenCalledWith('s1');
    });

    it('should update a supplier', async () => {
      const dto = { rating: 4.5 };
      const domain = { id: 's1', name: 'Tech Vendor', status: 'ACTIVE' as const, code: 'TV1', taxId: null, website: null, rating: 4.5, leadTimeDays: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockRepo.updateSupplier.mockResolvedValue(domain);

      const result = await service.updateSupplier('s1', dto);
      expect(result.rating).toBe(4.5);
      expect(mockRepo.updateSupplier).toHaveBeenCalledWith('s1', dto);
    });
  });

  describe('Supplier Contacts', () => {
    it('should add a contact', async () => {
      const dto = { supplierId: 's1', firstName: 'John', lastName: 'Doe', email: 'john@techvendor.com' };
      const domain = { id: 'c1', ...dto, phone: null, isPrimary: false, role: null, createdAt: new Date(), updatedAt: new Date() };
      mockRepo.addSupplierContact.mockResolvedValue(domain);

      const result = await service.addSupplierContact(dto);
      expect(result.id).toBe('c1');
      expect(mockRepo.addSupplierContact).toHaveBeenCalledWith(dto);
    });

    it('should get contacts', async () => {
      const domain = [{ id: 'c1', supplierId: 's1', firstName: 'John', lastName: 'Doe', email: 'john@techvendor.com', phone: null, isPrimary: false, role: null, createdAt: new Date(), updatedAt: new Date() }];
      mockRepo.getSupplierContacts.mockResolvedValue(domain);

      const result = await service.getSupplierContacts('s1');
      expect(result).toHaveLength(1);
      expect(mockRepo.getSupplierContacts).toHaveBeenCalledWith('s1');
    });
  });

  describe('Supplier Catalog', () => {
    it('should add a catalog item', async () => {
      const dto = { supplierId: 's1', inventoryItemId: 'i1', supplierSku: 'SKU123', price: 100 };
      const domain = { id: 'ci1', ...dto, currency: 'USD', minimumOrderQty: 1, leadTimeDays: null, isActive: true, createdAt: new Date(), updatedAt: new Date() };
      mockRepo.addCatalogItem.mockResolvedValue(domain);

      const result = await service.addCatalogItem(dto);
      expect(result.id).toBe('ci1');
      expect(mockRepo.addCatalogItem).toHaveBeenCalledWith(dto);
    });

    it('should get catalog', async () => {
      const domain = [{ id: 'ci1', supplierId: 's1', inventoryItemId: 'i1', supplierSku: 'SKU123', price: 100, currency: 'USD', minimumOrderQty: 1, leadTimeDays: null, isActive: true, createdAt: new Date(), updatedAt: new Date() }];
      mockRepo.getSupplierCatalog.mockResolvedValue(domain);

      const result = await service.getSupplierCatalog('s1');
      expect(result).toHaveLength(1);
      expect(mockRepo.getSupplierCatalog).toHaveBeenCalledWith('s1');
    });
  });

  describe('Purchase Requests', () => {
    it('should create a purchase request', async () => {
      const dto = { requesterId: 'u1', departmentId: 'd1', justification: 'Need laptops', priority: 'HIGH' as const, items: [{ inventoryItemId: 'i1', quantity: 5 }] };
      const domain = { id: 'pr1', requesterId: 'u1', departmentId: 'd1', justification: 'Need laptops', priority: 'HIGH' as const, status: 'PENDING' as const, items: [], approvals: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockRepo.createPurchaseRequest = vi.fn().mockResolvedValue(domain);

      const result = await service.createPurchaseRequest(dto);
      expect(result.id).toBe('pr1');
      expect(mockRepo.createPurchaseRequest).toHaveBeenCalledWith(dto);
    });

    it('should get a purchase request', async () => {
      const domain = { id: 'pr1', requesterId: 'u1', departmentId: 'd1', justification: 'Need laptops', priority: 'HIGH' as const, status: 'PENDING' as const, items: [], approvals: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockRepo.getPurchaseRequest = vi.fn().mockResolvedValue(domain);

      const result = await service.getPurchaseRequest('pr1');
      expect(result.id).toBe('pr1');
      expect(mockRepo.getPurchaseRequest).toHaveBeenCalledWith('pr1');
    });

    it('should submit approval', async () => {
      const dto = { approverId: 'u2', status: 'APPROVED' as const };
      const domain = { id: 'pr1', requesterId: 'u1', departmentId: 'd1', justification: 'Need laptops', priority: 'HIGH' as const, status: 'APPROVED' as const, items: [], approvals: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockRepo.submitApproval = vi.fn().mockResolvedValue(domain);

      const result = await service.submitApproval('pr1', dto);
      expect(result.status).toBe('APPROVED');
      expect(mockRepo.submitApproval).toHaveBeenCalledWith('pr1', dto);
    });
  });

  describe('Purchase Orders', () => {
    it('should generate a purchase order from PR', async () => {
      const dto = { purchaseRequestId: 'pr1', supplierId: 's1' };
      const domain = { id: 'po1', orderNumber: 'PO-123', purchaseRequestId: 'pr1', supplierId: 's1', status: 'DRAFT' as const, expectedDelivery: null, items: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockRepo.generatePurchaseOrder = vi.fn().mockResolvedValue(domain);

      const result = await service.generatePurchaseOrder(dto);
      expect(result.id).toBe('po1');
      expect(mockRepo.generatePurchaseOrder).toHaveBeenCalledWith(dto);
    });

    it('should get a purchase order', async () => {
      const domain = { id: 'po1', orderNumber: 'PO-123', purchaseRequestId: 'pr1', supplierId: 's1', status: 'DRAFT' as const, expectedDelivery: null, items: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockRepo.getPurchaseOrder = vi.fn().mockResolvedValue(domain);

      const result = await service.getPurchaseOrder('po1');
      expect(result.id).toBe('po1');
      expect(mockRepo.getPurchaseOrder).toHaveBeenCalledWith('po1');
    });

    it('should issue a purchase order', async () => {
      const domain = { id: 'po1', orderNumber: 'PO-123', purchaseRequestId: 'pr1', supplierId: 's1', status: 'ISSUED' as const, expectedDelivery: null, items: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockRepo.issuePurchaseOrder = vi.fn().mockResolvedValue(domain);

      const result = await service.issuePurchaseOrder('po1');
      expect(result.status).toBe('ISSUED');
      expect(mockRepo.issuePurchaseOrder).toHaveBeenCalledWith('po1');
    });
  });

  describe('Goods Receipt', () => {
    it('should execute a goods receipt and publish event', async () => {
      const dto = { purchaseOrderId: 'po1', receivedById: 'u1', items: [{ purchaseOrderItemId: 'poi1', quantityReceived: 10 }] };
      const domain = { id: 'gr1', receiptNumber: 'GR-123', purchaseOrderId: 'po1', receivedById: 'u1', items: [{ id: 'gri1', goodsReceiptId: 'gr1', purchaseOrderItemId: 'poi1', inventoryItemId: 'i1', quantityReceived: 10, createdAt: new Date(), updatedAt: new Date() }], createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      mockRepo.executeGoodsReceipt = vi.fn().mockResolvedValue(domain);
      
      const publishSpy = vi.spyOn(eventBus, 'publish').mockImplementation(() => {});

      const result = await service.executeGoodsReceipt(dto);
      
      expect(result.id).toBe('gr1');
      expect(mockRepo.executeGoodsReceipt).toHaveBeenCalledWith(dto);
      expect(publishSpy).toHaveBeenCalledWith('GoodsReceiptCompleted', expect.objectContaining({
        receiptNumber: 'GR-123',
        purchaseOrderId: 'po1'
      }), 'u1');
    });
  });

  describe('Analytics & Metrics', () => {
    it('should retrieve supplier metrics', async () => {
      const domain = { id: 'm1', supplierId: 's1', averageLeadTimeDays: 5, qualityScore: 98, totalOrdersFulfilled: 10, calculatedAt: new Date(), calculationVersion: 'v1', updatedAt: new Date() };
      mockRepo.getSupplierMetrics = vi.fn().mockResolvedValue(domain);

      const result = await service.getSupplierMetrics('s1');
      expect(result.averageLeadTimeDays).toBe(5);
      expect(mockRepo.getSupplierMetrics).toHaveBeenCalledWith('s1');
    });

    it('should recalculate supplier metrics and publish event', async () => {
      mockRepo.recalculateSupplierMetrics = vi.fn().mockResolvedValue(undefined);
      const publishSpy = vi.spyOn(eventBus, 'publish').mockImplementation(() => {});

      await service.recalculateSupplierMetrics('s1');
      expect(mockRepo.recalculateSupplierMetrics).toHaveBeenCalledWith('s1');
      expect(publishSpy).toHaveBeenCalledWith('SupplierMetricsRecalculated', expect.objectContaining({ supplierId: 's1' }), 'SYSTEM_PROCUREMENT');
    });

    it('should record a timeline event and publish event', async () => {
      mockRepo.recordTimelineEvent = vi.fn().mockResolvedValue(undefined);
      const publishSpy = vi.spyOn(eventBus, 'publish').mockImplementation(() => {});

      await service.recordTimelineEvent('po1', null, 'OrderIssued', { note: 'Sent via email' });
      expect(mockRepo.recordTimelineEvent).toHaveBeenCalledWith('po1', null, 'OrderIssued', { note: 'Sent via email' });
      expect(publishSpy).toHaveBeenCalledWith('ProcurementTimelineEventRecorded', expect.objectContaining({ purchaseOrderId: 'po1' }), 'SYSTEM_PROCUREMENT');
    });
  });
});
