import 'dotenv/config';
import { env } from '../src/config/env';
import { prisma } from '../src/config/prisma';
import { signAccessToken } from '../src/shared/jwt';
import app from '../src/app';
import request from 'supertest';

async function runE2E() {
  console.log('--- Starting Procurement E2E Integration Test (Standalone) ---');

  let adminToken = '';
  let adminId = '';
  let supplierId = '';
  let catalogItemId = '';
  let inventoryItemId = '';
  let prId = '';
  let poId = '';
  let poItemId = '';

  // 1. Authenticate to get a token
  console.log('[1/7] Authenticating as admin (Seeding via Prisma)...');

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
  console.log('✔ Authenticated via seeded JWT');

  // Seed Inventory
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

  console.log('[2/7] Creating Supplier...');
  let res = await request(app)
    .post('/api/v1/procurement/suppliers')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: `Tech Supplier ${Date.now()}`,
      currency: 'USD',
      taxId: 'TX-123'
    });
  
  if (res.status !== 201) throw new Error('Failed to create supplier: ' + res.text);
  supplierId = res.body.data.id;
  console.log('✔ Supplier Created');

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

  console.log('[3/7] Creating Purchase Request...');
  res = await request(app)
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
  if (res.status !== 201) throw new Error('Failed to create PR: ' + res.text);
  prId = res.body.data.id;
  console.log('✔ Purchase Request Created');

  console.log('[4/7] Approving Purchase Request...');
  res = await request(app)
    .post(`/api/v1/procurement/purchase-requests/${prId}/approve`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      approverId: adminId,
      comments: 'Looks good'
    });
  if (res.status !== 200) throw new Error('Failed to approve PR: ' + res.text);
  console.log('✔ Purchase Request Approved');

  console.log('[5/7] Generating Purchase Order...');
  res = await request(app)
    .post('/api/v1/procurement/purchase-orders/generate')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      purchaseRequestId: prId
    });
  if (res.status !== 201) throw new Error('Failed to generate PO: ' + res.text);
  poId = res.body.data[0].id;
  poItemId = res.body.data[0].items[0].id;
  console.log('✔ Purchase Order Generated');

  console.log('[6/7] Issuing Purchase Order...');
  res = await request(app)
    .post(`/api/v1/procurement/purchase-orders/${poId}/issue`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send();
  if (res.status !== 200) throw new Error('Failed to issue PO: ' + res.text);
  console.log('✔ Purchase Order Issued');

  console.log('[7/7] Executing Goods Receipt (Partial)...');
  res = await request(app)
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
  if (res.status !== 201) throw new Error('Failed to execute GR: ' + res.text);
  console.log('✔ Goods Receipt executed');

  console.log('[8/8] Verifying Analytics (Supplier Metrics)...');
  res = await request(app)
    .post(`/api/v1/procurement/analytics/suppliers/${supplierId}/recalculate`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send();
  
  res = await request(app)
    .get(`/api/v1/procurement/analytics/suppliers/${supplierId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  
  if (res.status !== 200) throw new Error('Failed to get metrics: ' + res.text);
  console.log('✔ Analytics metrics retrieved');

  console.log('--- All Integration Tests Passed ---');
}

runE2E()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Integration test failed:', e);
    process.exit(1);
  });
