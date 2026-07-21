import 'dotenv/config';
import { env } from '../src/config/env';
import { prisma } from '../src/config/prisma';
import { signAccessToken } from '../src/shared/jwt';

const BASE_URL = 'http://localhost:3000/api/v1';

async function request(path: string, method = 'GET', body?: any, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data;
  const rawText = await res.text();
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    console.error(`Error on ${method} ${path}: Could not parse JSON. Raw response:`, rawText);
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  if (!res.ok) {
    console.error(`Error on ${method} ${path}:`, JSON.stringify(data, null, 2));
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return data;
}

async function runE2E() {
  console.log('--- Starting Procurement E2E Integration Test ---');

  // 1. Authenticate to get a token
  console.log('[1/7] Authenticating as admin (Seeding via Prisma)...');

  let adminUser = await prisma.user.findUnique({ where: { email: 'admin-e2e@assetflow.com' } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin-e2e@assetflow.com',
        name: 'E2E Admin',
        passwordHash: 'hashed_password', // Mock
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });
  }

  const token = signAccessToken({
    sub: adminUser.id,
    email: adminUser.email,
    role: adminUser.role,
    sid: 'mock-session-id'
  });
  const userId = adminUser.id;
  console.log('✔ Authenticated via seeded JWT');

  // Seed Supplier variables
  console.log('[2/7] Creating Supplier...');
  const supplierRes = await request('/procurement/suppliers', 'POST', {
    name: `Global Tech Supplies ${Date.now()}`,
    currency: 'USD',
    taxId: 'TX-123456'
  }, token);
  const supplierId = supplierRes.data.id;
  console.log(`✔ Supplier Created: ${supplierId}`);

  // Need a supplier catalog item and inventory item to order!
  // Wait, our DB needs some seeding. We can't easily seed a catalog item via REST because we didn't expose catalog endpoints.
  // We'll create an Inventory Item and Supplier Catalog Item via Prisma directly here.
  
  // Seed Inventory Item
  const invCat = await prisma.assetCategory.create({
    data: {
      name: `Category ${Date.now()}`,
      prefix: `CAT${Date.now()}`.substring(0, 10),
      lifespanMonths: 36,
      depreciationRate: 10
    }
  });

  const invItem = await prisma.inventoryItem.create({
    data: {
      sku: `SKU-${Date.now()}`,
      name: 'E2E Test Laptop',
      categoryId: invCat.id,
      reorderPoint: 5,
      optimalStock: 20
    }
  });

  // Seed Supplier Catalog Item
  const catalogItem = await prisma.supplierCatalogItem.create({
    data: {
      supplierId,
      inventoryItemId: invItem.id,
      supplierSku: 'SUP-LT-01',
      unitPrice: 1500,
      currency: 'USD',
      leadTimeDays: 14
    }
  });
  console.log('✔ Seeded Catalog and Inventory relationships');

  // 3. Create Purchase Request
  console.log('[3/7] Creating Purchase Request...');
  const prRes = await request('/procurement/purchase-requests', 'POST', {
    requesterId: userId,
    departmentId: null, // Optional
    priority: 'HIGH',
    items: [
      {
        inventoryItemId: invItem.id,
        quantity: 10
      }
    ],
    justification: 'E2E Test Replenishment'
  }, token);
  const prId = prRes.data.id;
  console.log(`✔ Purchase Request Created: ${prId}`);

  // 4. Approve Purchase Request
  console.log('[4/7] Approving Purchase Request...');
  const approveRes = await request(`/procurement/purchase-requests/${prId}/approve`, 'POST', {
    approverId: userId,
    comments: 'Approved by E2E'
  }, token);
  console.log(`✔ PR Approved`);

  // 5. Generate Purchase Order
  console.log('[5/7] Generating Purchase Order...');
  const poRes = await request('/procurement/purchase-orders/generate', 'POST', {
    purchaseRequestId: prId
  }, token);
  // Returns an array of POs
  const poId = poRes.data[0].id;
  const poItemId = poRes.data[0].items[0].id;
  console.log(`✔ PO Generated: ${poId}`);

  // 6. Issue PO
  console.log('[6/7] Issuing Purchase Order...');
  await request(`/procurement/purchase-orders/${poId}/issue`, 'POST', {}, token);
  console.log(`✔ PO Issued to Supplier`);

  // 7. Execute Goods Receipt
  console.log('[7/7] Executing Goods Receipt (Partial)...');
  const grRes = await request('/procurement/goods-receipt', 'POST', {
    purchaseOrderId: poId,
    receivedById: userId,
    items: [
      {
        purchaseOrderItemId: poItemId,
        quantityReceived: 5 // Partial receipt
      }
    ]
  }, token);
  console.log(`✔ Goods Receipt executed: ${grRes.data.receiptNumber}`);

  // 8. Analytics Check
  console.log('[8/8] Verifying Analytics...');
  await request(`/procurement/analytics/suppliers/${supplierId}/recalculate`, 'POST', {}, token);
  const metrics = await request(`/procurement/analytics/suppliers/${supplierId}`, 'GET', undefined, token);
  console.log(`✔ Metrics retrieved: Lead Time = ${metrics.data.averageLeadTimeDays}`);

  console.log('--- All Integration Tests Passed ---');
  await prisma.$disconnect();
}

runE2E().catch(err => {
  console.error('Integration Test Failed:', err);
  process.exit(1);
});
