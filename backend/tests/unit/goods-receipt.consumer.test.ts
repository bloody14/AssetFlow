import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoodsReceiptConsumer } from '../../src/modules/inventory/consumers/goods-receipt.consumer';
import { eventBus } from '../../src/shared/events/eventBus';
import { prisma } from '../../src/config/prisma';
import { InventoryService } from '../../src/modules/inventory/services/inventory.service';

vi.mock('../../src/shared/events/eventBus', () => ({
  eventBus: {
    subscribe: vi.fn(),
    publish: vi.fn(),
  }
}));

vi.mock('../../src/config/prisma', () => ({
  prisma: {
    warehouse: {
      findFirst: vi.fn(),
    }
  }
}));

vi.mock('../../src/modules/inventory/services/inventory.service', () => ({
  InventoryService: class {
    receiveStock = vi.fn();
  }
}));

describe('GoodsReceiptConsumer', () => {
  let consumer: GoodsReceiptConsumer;

  beforeEach(() => {
    vi.clearAllMocks();
    consumer = new GoodsReceiptConsumer();
  });

  it('should register successfully', () => {
    consumer.register();
    expect(eventBus.subscribe).toHaveBeenCalledWith('GoodsReceiptCompleted', expect.any(Function));
  });

  it('should process GoodsReceiptCompleted event and call receiveStock', async () => {
    // Setup the mock to capture the callback
    let callback: any;
    vi.mocked(eventBus.subscribe).mockImplementation((event, cb) => {
      if (event === 'GoodsReceiptCompleted') callback = cb;
    });

    consumer.register();
    expect(callback).toBeDefined();

    // Mock dependencies
    const mockWarehouse = { id: 'WH-123', status: 'ACTIVE' };
    vi.mocked(prisma.warehouse.findFirst).mockResolvedValue(mockWarehouse as any);

    const mockEvent = {
      correlationId: 'corr-1',
      payload: {
        receiptNumber: 'GR-001',
        purchaseOrderId: 'PO-001',
        items: [
          { inventoryItemId: 'INV-1', quantityReceived: 10 }
        ],
        receivedAt: new Date()
      }
    };

    await callback(mockEvent);

    // Verify the mock was called. Since it's a class mock, we get the instance from consumer.
    const serviceAny = (consumer as any).inventoryService;
    expect(prisma.warehouse.findFirst).toHaveBeenCalled();
    expect(serviceAny.receiveStock).toHaveBeenCalledWith({
      inventoryItemId: 'INV-1',
      warehouseId: 'WH-123',
      quantity: 10,
      referenceId: 'GR-001',
      notes: expect.stringContaining('Receipt GR-001')
    }, 'SYSTEM_PROCUREMENT');
  });

  it('should ignore events with no items', async () => {
    let callback: any;
    vi.mocked(eventBus.subscribe).mockImplementation((event, cb) => {
      if (event === 'GoodsReceiptCompleted') callback = cb;
    });

    consumer.register();

    const mockEvent = {
      payload: {
        receiptNumber: 'GR-002',
        purchaseOrderId: 'PO-002',
        items: [] // Empty
      }
    };

    await callback(mockEvent);

    expect(prisma.warehouse.findFirst).not.toHaveBeenCalled();
  });

  it('should handle missing warehouse gracefully', async () => {
    let callback: any;
    vi.mocked(eventBus.subscribe).mockImplementation((event, cb) => {
      if (event === 'GoodsReceiptCompleted') callback = cb;
    });

    consumer.register();

    vi.mocked(prisma.warehouse.findFirst).mockResolvedValue(null);

    const mockEvent = {
      payload: {
        receiptNumber: 'GR-003',
        purchaseOrderId: 'PO-003',
        items: [
          { inventoryItemId: 'INV-1', quantityReceived: 10 }
        ]
      }
    };

    // Should not throw, just log error internally
    await expect(callback(mockEvent)).resolves.not.toThrow();
  });
});
