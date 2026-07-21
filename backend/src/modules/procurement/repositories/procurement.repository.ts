import { prisma } from '../../../config/prisma';
import { AppError } from '../../../shared/appError';
import { HTTP_STATUS } from '../../../constants/httpStatus';
import {
  SupplierDomain,
  CreateSupplierDTO,
  UpdateSupplierDTO,
  SupplierContactDomain,
  CreateSupplierContactDTO,
  SupplierCatalogItemDomain,
  CreateSupplierCatalogItemDTO,
} from '../types/procurement.types';

export class PrismaProcurementRepository {
  // --- Supplier ---
  private mapToSupplierDomain(s: import('@prisma/client').Supplier): SupplierDomain {
    return {
      id: s.id,
      name: s.name,
      code: s.code,
      taxId: s.taxId,
      website: s.website,
      status: s.status as SupplierDomain['status'],
      rating: s.rating,
      leadTimeDays: s.leadTimeDays,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      deletedAt: s.deletedAt,
    };
  }

  async createSupplier(data: CreateSupplierDTO): Promise<SupplierDomain> {
    const existing = await prisma.supplier.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new AppError(
        'Supplier name already exists',
        HTTP_STATUS.CONFLICT,
        'DUPLICATE_SUPPLIER_NAME'
      );
    }

    if (data.code) {
      const existingCode = await prisma.supplier.findUnique({ where: { code: data.code } });
      if (existingCode) {
        throw new AppError(
          'Supplier code already exists',
          HTTP_STATUS.CONFLICT,
          'DUPLICATE_SUPPLIER_CODE'
        );
      }
    }

    const supplier = await prisma.supplier.create({
      data: { ...data, status: data.status || 'PENDING_APPROVAL' },
    });
    return this.mapToSupplierDomain(supplier);
  }

  async getSupplier(id: string): Promise<SupplierDomain> {
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      throw new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND, 'SUPPLIER_NOT_FOUND');
    }
    return this.mapToSupplierDomain(supplier);
  }

  async updateSupplier(id: string, data: UpdateSupplierDTO): Promise<SupplierDomain> {
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      throw new AppError('Supplier not found', HTTP_STATUS.NOT_FOUND, 'SUPPLIER_NOT_FOUND');
    }
    const updated = await prisma.supplier.update({ where: { id }, data });
    return this.mapToSupplierDomain(updated);
  }

  // --- Supplier Contact ---
  private mapToSupplierContactDomain(
    c: import('@prisma/client').SupplierContact
  ): SupplierContactDomain {
    return {
      id: c.id,
      supplierId: c.supplierId,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      isPrimary: c.isPrimary,
      role: c.role,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  async addSupplierContact(data: CreateSupplierContactDTO): Promise<SupplierContactDomain> {
    const existing = await prisma.supplierContact.findUnique({
      where: {
        supplierId_email: {
          supplierId: data.supplierId,
          email: data.email,
        },
      },
    });

    if (existing) {
      throw new AppError(
        'Supplier contact with this email already exists for this supplier',
        HTTP_STATUS.CONFLICT,
        'DUPLICATE_CONTACT_EMAIL'
      );
    }

    if (data.isPrimary) {
      await prisma.supplierContact.updateMany({
        where: { supplierId: data.supplierId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const contact = await prisma.supplierContact.create({ data });
    return this.mapToSupplierContactDomain(contact);
  }

  async getSupplierContacts(supplierId: string): Promise<SupplierContactDomain[]> {
    const contacts = await prisma.supplierContact.findMany({ where: { supplierId } });
    return contacts.map((c) => this.mapToSupplierContactDomain(c));
  }

  // --- Supplier Catalog ---
  private mapToSupplierCatalogItemDomain(
    c: import('@prisma/client').SupplierCatalogItem
  ): SupplierCatalogItemDomain {
    return {
      id: c.id,
      supplierId: c.supplierId,
      inventoryItemId: c.inventoryItemId,
      supplierSku: c.supplierSku,
      price: c.price,
      currency: c.currency,
      minimumOrderQty: c.minimumOrderQty,
      leadTimeDays: c.leadTimeDays,
      isActive: c.isActive,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  async addCatalogItem(data: CreateSupplierCatalogItemDTO): Promise<SupplierCatalogItemDomain> {
    const existingSku = await prisma.supplierCatalogItem.findUnique({
      where: {
        supplierId_supplierSku: {
          supplierId: data.supplierId,
          supplierSku: data.supplierSku,
        },
      },
    });

    if (existingSku) {
      throw new AppError(
        'Supplier already has this SKU in their catalog',
        HTTP_STATUS.CONFLICT,
        'DUPLICATE_SUPPLIER_SKU'
      );
    }

    const existingInventoryItemMap = await prisma.supplierCatalogItem.findUnique({
      where: {
        supplierId_inventoryItemId: {
          supplierId: data.supplierId,
          inventoryItemId: data.inventoryItemId,
        },
      },
    });

    if (existingInventoryItemMap) {
      throw new AppError(
        'Supplier already has an entry for this inventory item',
        HTTP_STATUS.CONFLICT,
        'DUPLICATE_INVENTORY_ITEM_MAPPING'
      );
    }

    const item = await prisma.supplierCatalogItem.create({ data });
    return this.mapToSupplierCatalogItemDomain(item);
  }

  async getSupplierCatalog(supplierId: string): Promise<SupplierCatalogItemDomain[]> {
    const catalog = await prisma.supplierCatalogItem.findMany({ where: { supplierId } });
    return catalog.map((c) => this.mapToSupplierCatalogItemDomain(c));
  }

  // --- Purchase Requests ---
  private mapToPurchaseRequestDomain(
    pr: import('@prisma/client').PurchaseRequest & {
      items?: import('@prisma/client').PurchaseRequestItem[];
      approvals?: import('@prisma/client').PurchaseRequestApproval[];
    }
  ): import('../types/procurement.types').PurchaseRequestDomain {
    return {
      id: pr.id,
      requesterId: pr.requesterId,
      departmentId: pr.departmentId,
      justification: pr.justification,
      priority: pr.priority as import('../types/procurement.types').PurchaseRequestPriority,
      status: pr.status as import('../types/procurement.types').ApprovalStatus,
      createdAt: pr.createdAt,
      updatedAt: pr.updatedAt,
      deletedAt: pr.deletedAt,
      items: pr.items?.map((i) => ({
        id: i.id,
        purchaseRequestId: i.purchaseRequestId,
        inventoryItemId: i.inventoryItemId,
        quantity: i.quantity,
        estimatedPrice: i.estimatedPrice,
        currency: i.currency,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      })),
      approvals: pr.approvals?.map((a) => ({
        id: a.id,
        purchaseRequestId: a.purchaseRequestId,
        approverId: a.approverId,
        status: a.status as import('../types/procurement.types').ApprovalStatus,
        comments: a.comments,
        step: a.step,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
    };
  }

  async createPurchaseRequest(
    data: import('../types/procurement.types').CreatePurchaseRequestDTO
  ): Promise<import('../types/procurement.types').PurchaseRequestDomain> {
    const pr = await prisma.purchaseRequest.create({
      data: {
        requesterId: data.requesterId,
        departmentId: data.departmentId,
        justification: data.justification,
        priority: data.priority || 'MEDIUM',
        status: 'PENDING',
        items: {
          create: data.items.map((item) => ({
            inventoryItemId: item.inventoryItemId,
            quantity: item.quantity,
            estimatedPrice: item.estimatedPrice,
            currency: item.currency || 'USD',
          })),
        },
      },
      include: {
        items: true,
      },
    });
    return this.mapToPurchaseRequestDomain(pr);
  }

  async getPurchaseRequest(
    id: string
  ): Promise<import('../types/procurement.types').PurchaseRequestDomain> {
    const pr = await prisma.purchaseRequest.findUnique({
      where: { id },
      include: {
        items: true,
        approvals: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!pr) {
      throw new AppError('Purchase request not found', HTTP_STATUS.NOT_FOUND, 'PR_NOT_FOUND');
    }

    return this.mapToPurchaseRequestDomain(pr);
  }

  async submitApproval(
    id: string,
    data: import('../types/procurement.types').SubmitApprovalDTO
  ): Promise<import('../types/procurement.types').PurchaseRequestDomain> {
    const result = await prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.findUnique({ where: { id } });
      if (!pr) {
        throw new AppError('Purchase request not found', HTTP_STATUS.NOT_FOUND, 'PR_NOT_FOUND');
      }

      if (pr.status !== 'PENDING') {
        throw new AppError(
          'Purchase request is no longer pending',
          HTTP_STATUS.BAD_REQUEST,
          'PR_NOT_PENDING'
        );
      }

      // Record approval
      await tx.purchaseRequestApproval.create({
        data: {
          purchaseRequestId: id,
          approverId: data.approverId,
          status: data.status,
          comments: data.comments,
          step: 1, // Phase 4.2 supports single step base currently
        },
      });

      // Update PR status
      const updatedPr = await tx.purchaseRequest.update({
        where: { id },
        data: {
          status: data.status, // If rejected, PR is rejected. If approved, PR is approved.
        },
        include: {
          items: true,
          approvals: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      return updatedPr;
    });

    return this.mapToPurchaseRequestDomain(result);
  }

  // --- Purchase Orders ---
  private mapToPurchaseOrderDomain(
    po: import('@prisma/client').PurchaseOrder & {
      items?: import('@prisma/client').PurchaseOrderItem[];
    }
  ): import('../types/procurement.types').PurchaseOrderDomain {
    return {
      id: po.id,
      orderNumber: po.orderNumber,
      purchaseRequestId: po.purchaseRequestId,
      supplierId: po.supplierId,
      status: po.status as import('../types/procurement.types').PurchaseOrderStatus,
      expectedDelivery: po.expectedDelivery,
      createdAt: po.createdAt,
      updatedAt: po.updatedAt,
      deletedAt: po.deletedAt,
      items: po.items?.map((i) => ({
        id: i.id,
        purchaseOrderId: i.purchaseOrderId,
        purchaseRequestItemId: i.purchaseRequestItemId,
        inventoryItemId: i.inventoryItemId,
        quantityOrdered: i.quantityOrdered,
        quantityReceived: i.quantityReceived,
        unitPrice: i.unitPrice,
        currency: i.currency,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      })),
    };
  }

  async generatePurchaseOrder(
    data: import('../types/procurement.types').CreatePurchaseOrderDTO
  ): Promise<import('../types/procurement.types').PurchaseOrderDomain> {
    const result = await prisma.$transaction(async (tx) => {
      const pr = await tx.purchaseRequest.findUnique({
        where: { id: data.purchaseRequestId },
        include: { items: true },
      });

      if (!pr) {
        throw new AppError('Purchase request not found', HTTP_STATUS.NOT_FOUND, 'PR_NOT_FOUND');
      }

      if (pr.status !== 'APPROVED') {
        throw new AppError(
          'Purchase request must be APPROVED to generate an order',
          HTTP_STATUS.BAD_REQUEST,
          'PR_NOT_APPROVED'
        );
      }

      const supplierCatalog = await tx.supplierCatalogItem.findMany({
        where: { supplierId: data.supplierId },
      });

      const poItems = [];
      for (const prItem of pr.items) {
        const catalogEntry = supplierCatalog.find(
          (c) => c.inventoryItemId === prItem.inventoryItemId
        );
        if (catalogEntry) {
          poItems.push({
            purchaseRequestItemId: prItem.id,
            inventoryItemId: prItem.inventoryItemId,
            quantityOrdered: prItem.quantity,
            unitPrice: catalogEntry.price,
            currency: catalogEntry.currency,
          });
        }
      }

      if (poItems.length === 0) {
        throw new AppError(
          'No items in the Purchase Request are supplied by this Supplier',
          HTTP_STATUS.BAD_REQUEST,
          'NO_MATCHING_ITEMS'
        );
      }

      const orderNumber = `PO-${Date.now()}`;

      const po = await tx.purchaseOrder.create({
        data: {
          orderNumber,
          purchaseRequestId: data.purchaseRequestId,
          supplierId: data.supplierId,
          expectedDelivery: data.expectedDelivery,
          status: 'DRAFT',
          items: {
            create: poItems,
          },
        },
        include: { items: true },
      });

      return po;
    });

    return this.mapToPurchaseOrderDomain(result);
  }

  async getPurchaseOrder(
    id: string
  ): Promise<import('../types/procurement.types').PurchaseOrderDomain> {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!po) {
      throw new AppError('Purchase order not found', HTTP_STATUS.NOT_FOUND, 'PO_NOT_FOUND');
    }

    return this.mapToPurchaseOrderDomain(po);
  }

  async issuePurchaseOrder(
    id: string
  ): Promise<import('../types/procurement.types').PurchaseOrderDomain> {
    const po = await prisma.purchaseOrder.findUnique({ where: { id } });

    if (!po) {
      throw new AppError('Purchase order not found', HTTP_STATUS.NOT_FOUND, 'PO_NOT_FOUND');
    }

    if (po.status !== 'DRAFT') {
      throw new AppError(
        'Only DRAFT purchase orders can be issued',
        HTTP_STATUS.BAD_REQUEST,
        'PO_NOT_DRAFT'
      );
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'ISSUED' },
      include: { items: true },
    });

    return this.mapToPurchaseOrderDomain(updated);
  }

  // --- Goods Receipt ---
  private mapToGoodsReceiptDomain(
    gr: import('@prisma/client').GoodsReceipt & {
      items?: import('@prisma/client').GoodsReceiptItem[];
    }
  ): import('../types/procurement.types').GoodsReceiptDomain {
    return {
      id: gr.id,
      receiptNumber: gr.receiptNumber,
      purchaseOrderId: gr.purchaseOrderId,
      receivedById: gr.receivedById,
      createdAt: gr.createdAt,
      updatedAt: gr.updatedAt,
      deletedAt: gr.deletedAt,
      items: gr.items?.map((i) => ({
        id: i.id,
        goodsReceiptId: i.goodsReceiptId,
        purchaseOrderItemId: i.purchaseOrderItemId,
        inventoryItemId: i.inventoryItemId,
        quantityReceived: i.quantityReceived,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      })),
    };
  }

  async executeGoodsReceipt(
    data: import('../types/procurement.types').ExecuteGoodsReceiptDTO
  ): Promise<import('../types/procurement.types').GoodsReceiptDomain> {
    const result = await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id: data.purchaseOrderId },
        include: { items: true },
      });

      if (!po) {
        throw new AppError('Purchase order not found', HTTP_STATUS.NOT_FOUND, 'PO_NOT_FOUND');
      }

      if (po.status !== 'ISSUED' && po.status !== 'PARTIALLY_RECEIVED') {
        throw new AppError(
          'Purchase order must be ISSUED or PARTIALLY_RECEIVED to receive goods',
          HTTP_STATUS.BAD_REQUEST,
          'PO_NOT_RECEIVABLE'
        );
      }

      const receiptNumber = `GR-${Date.now()}`;
      const grItems = [];

      for (const item of data.items) {
        const poItem = po.items.find((i) => i.id === item.purchaseOrderItemId);
        if (!poItem) {
          throw new AppError(
            `PO Item ${item.purchaseOrderItemId} does not belong to this PO`,
            HTTP_STATUS.BAD_REQUEST,
            'INVALID_PO_ITEM'
          );
        }

        const remainingQuantity = poItem.quantityOrdered - poItem.quantityReceived;
        if (item.quantityReceived > remainingQuantity) {
          throw new AppError(
            `Cannot receive more than ordered for item ${item.purchaseOrderItemId}`,
            HTTP_STATUS.BAD_REQUEST,
            'OVER_RECEIPT'
          );
        }

        // Update PO Item quantity
        await tx.purchaseOrderItem.update({
          where: { id: poItem.id },
          data: { quantityReceived: poItem.quantityReceived + item.quantityReceived },
        });

        grItems.push({
          purchaseOrderItemId: poItem.id,
          inventoryItemId: poItem.inventoryItemId,
          quantityReceived: item.quantityReceived,
        });
      }

      const gr = await tx.goodsReceipt.create({
        data: {
          receiptNumber,
          purchaseOrderId: data.purchaseOrderId,
          receivedById: data.receivedById,
          items: {
            create: grItems,
          },
        },
        include: { items: true },
      });

      // Recalculate PO Status
      const updatedPoItems = await tx.purchaseOrderItem.findMany({
        where: { purchaseOrderId: po.id },
      });

      const isFullyReceived = updatedPoItems.every((i) => i.quantityReceived === i.quantityOrdered);
      const isPartiallyReceived = updatedPoItems.some((i) => i.quantityReceived > 0);

      let newStatus: import('../types/procurement.types').PurchaseOrderStatus = po.status;
      if (isFullyReceived) {
        newStatus = 'FULFILLED';
      } else if (isPartiallyReceived) {
        newStatus = 'PARTIALLY_RECEIVED';
      }

      if (newStatus !== po.status) {
        await tx.purchaseOrder.update({
          where: { id: po.id },
          data: { status: newStatus },
        });
      }

      return gr;
    });

    return this.mapToGoodsReceiptDomain(result);
  }

  // --- Procurement Analytics ---
  async recordTimelineEvent(
    purchaseOrderId: string | null,
    purchaseRequestId: string | null,
    eventType: string,
    payload: any
  ): Promise<void> {
    await prisma.procurementTimeline.create({
      data: {
        purchaseOrderId,
        purchaseRequestId,
        eventType,
        eventPayload: payload,
      },
    });
  }

  async getSupplierMetrics(
    supplierId: string
  ): Promise<import('../types/procurement.types').SupplierMetricsDomain> {
    const metrics = await prisma.supplierMetrics.findUnique({
      where: { supplierId },
    });

    if (!metrics) {
      throw new AppError('Supplier metrics not found', HTTP_STATUS.NOT_FOUND, 'METRICS_NOT_FOUND');
    }

    return {
      id: metrics.id,
      supplierId: metrics.supplierId,
      averageLeadTimeDays: metrics.averageLeadTimeDays,
      qualityScore: metrics.qualityScore,
      totalOrdersFulfilled: metrics.totalOrdersFulfilled,
      calculatedAt: metrics.calculatedAt,
      calculationVersion: metrics.calculationVersion,
      updatedAt: metrics.updatedAt,
    };
  }

  async recalculateSupplierMetrics(supplierId: string): Promise<void> {
    // In a real system, this would aggregate Goods Receipts against Purchase Orders to calculate lead times.
    // For Phase 4.5, we will scaffold the metrics calculation logic to update the numbers.
    const pos = await prisma.purchaseOrder.findMany({
      where: { supplierId, status: 'FULFILLED' },
      include: { goodsReceipts: true },
    });

    const totalOrders = pos.length;
    let totalLeadTimeDays = 0;

    for (const po of pos) {
      if (po.goodsReceipts.length > 0) {
        // Calculate days between PO creation and final goods receipt
        const finalReceipt = po.goodsReceipts.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )[0];
        const diffMs = finalReceipt.createdAt.getTime() - po.createdAt.getTime();
        totalLeadTimeDays += diffMs / (1000 * 60 * 60 * 24);
      }
    }

    const avgLeadTime = totalOrders > 0 ? totalLeadTimeDays / totalOrders : 0;

    await prisma.supplierMetrics.upsert({
      where: { supplierId },
      create: {
        supplierId,
        averageLeadTimeDays: avgLeadTime,
        qualityScore: 100, // Scaffolded
        totalOrdersFulfilled: totalOrders,
        calculatedAt: new Date(),
        calculationVersion: 'v1',
      },
      update: {
        averageLeadTimeDays: avgLeadTime,
        totalOrdersFulfilled: totalOrders,
        calculatedAt: new Date(),
        calculationVersion: 'v1',
      },
    });
  }
}
