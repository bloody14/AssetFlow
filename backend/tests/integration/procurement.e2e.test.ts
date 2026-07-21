import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/prisma';
import { signAccessToken } from '../../src/shared/jwt';

describe('Procurement E2E Workflow', () => {
  let adminToken = '';
  let adminId = '';
  let supplierId = '';
  let catalogItemId = '';
  let inventoryItemId = '';
  let prId = '';
  let poId = '';
  let poItemId = '';

  beforeAll(async () => {
    // 1. Seed Admin User
    let admin = await prisma.user.findUnique({ where: { email: 'e2e-admin@assetflow.com' } });
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: 'e2e-admin@assetflow.com',
          name: 'E2E Admin',
          passwordHash: 'hashed_password',
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      });
    }
    adminId = admin.id;

    adminToken = signAccessToken({
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      sid: 'mock-session-id'
    });

    // 2. Seed Inventory
    const invCat = await prisma.assetCategory.create({
      data: {
        name: `CAT ${Date.now()}`,
        prefix: `CAT${Date.now()}`.substring(0, 10),
        lifespanMonths: 36,
        depreciationRate: 10
      }
    });

    const invItem = await prisma.inventoryItem.create({
      data: {
        sku: `SKU-${Date.now()}`,
        name: 'E2E Laptop',
        categoryId: invCat.id,
        reorderPoint: 5,
        optimalStock: 20
      }
    });
    inventoryItemId = invItem.id;
  });

  afterAll(async () => {
    // Ideally cleanup DB here, but since it's dev/test db, we can leave it or write cleanup logic
  });

  it('1. Create Supplier', async () => {
    const res = await request(app)
      .post('/api/v1/procurement/suppliers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Tech Supplier ${Date.now()}`,
        currency: 'USD',
        taxId: 'TX-123'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    supplierId = res.body.data.id;

    // Seed Catalog Item
    const catalogItem = await prisma.supplierCatalogItem.create({
      data: {
        supplierId,
        inventoryItemId,
        supplierSku: 'SUP-01',
        unitPrice: 1500,
        currency: 'USD',
        leadTimeDays: 14
      }
    });
    catalogItemId = catalogItem.id;
  });

  it('2. Create Purchase Request', async () => {
    const res = await request(app)
      .post('/api/v1/procurement/purchase-requests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        requesterId: adminId,
        priority: 'HIGH',
        justification: 'Need laptops for E2E tests',
        items: [
          {
            inventoryItemId,
            quantity: 10
          }
        ]
      });

    expect(res.status).toBe(201);
    prId = res.body.data.id;
  });

  it('3. Approve Purchase Request', async () => {
    const res = await request(app)
      .post(`/api/v1/procurement/purchase-requests/${prId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        approverId: adminId,
        comments: 'Looks good'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('APPROVED');
  });

  it('4. Generate Purchase Order', async () => {
    const res = await request(app)
      .post('/api/v1/procurement/purchase-orders/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        purchaseRequestId: prId
      });

    expect(res.status).toBe(201);
    expect(Array.isArray(res.body.data)).toBe(true);
    poId = res.body.data[0].id;
    poItemId = res.body.data[0].items[0].id;
  });

  it('5. Issue Purchase Order', async () => {
    const res = await request(app)
      .post(`/api/v1/procurement/purchase-orders/${poId}/issue`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ISSUED');
  });

  it('6. Execute Goods Receipt', async () => {
    const res = await request(app)
      .post('/api/v1/procurement/goods-receipt')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        purchaseOrderId: poId,
        receivedById: adminId,
        items: [
          {
            purchaseOrderItemId: poItemId,
            quantityReceived: 5 // Partial receipt
          }
        ],
        notes: 'Partial shipment arrived'
      });

    expect(res.status).toBe(201);
  });

  it('7. Verify Analytics (Supplier Metrics)', async () => {
    // Wait for event bus to process recalculation or trigger it manually
    await request(app)
      .post(`/api/v1/procurement/analytics/suppliers/${supplierId}/recalculate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();

    const res = await request(app)
      .get(`/api/v1/procurement/analytics/suppliers/${supplierId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    // Since PO isn't fully fulfilled, metrics might still be defaults, but endpoint should work
    expect(res.body.data.averageLeadTimeDays).toBeDefined();
  });
});
