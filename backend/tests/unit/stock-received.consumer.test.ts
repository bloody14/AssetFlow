import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StockReceivedConsumer } from '../../src/modules/asset/consumers/stock-received.consumer';
import { eventBus } from '../../src/shared/events/eventBus';
import { prisma } from '../../src/config/prisma';
import { AssetService } from '../../src/modules/asset/services/asset.service';

vi.mock('../../src/shared/events/eventBus', () => ({
  eventBus: {
    subscribe: vi.fn(),
    publish: vi.fn(),
  }
}));

vi.mock('../../src/config/prisma', () => ({
  prisma: {
    inventoryItem: {
      findUnique: vi.fn(),
    },
    assetCategory: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    department: {
      findFirst: vi.fn(),
    }
  }
}));

vi.mock('../../src/modules/asset/services/asset.service', () => ({
  AssetService: class {
    createAsset = vi.fn();
  }
}));

describe('StockReceivedConsumer', () => {
  let consumer: StockReceivedConsumer;

  beforeEach(() => {
    vi.clearAllMocks();
    consumer = new StockReceivedConsumer();
  });

  it('should register successfully', () => {
    consumer.register();
    expect(eventBus.subscribe).toHaveBeenCalledWith('StockReceived', expect.any(Function));
  });

  it('should ignore non-fixed asset items', async () => {
    let callback: any;
    vi.mocked(eventBus.subscribe).mockImplementation((event, cb) => {
      if (event === 'StockReceived') callback = cb;
    });

    consumer.register();

    const mockEvent = {
      payload: {
        inventoryItemId: 'INV-1',
        warehouseId: 'WH-1',
        quantityReceived: 5,
        transactionId: 'TX-1',
        receivedAt: new Date()
      }
    };

    vi.mocked(prisma.inventoryItem.findUnique).mockResolvedValue({
      id: 'INV-1',
      name: 'Pens',
      category: {
        isFixedAsset: false
      }
    } as any);

    await callback(mockEvent);

    expect(prisma.assetCategory.findUnique).not.toHaveBeenCalled();
    const serviceAny = (consumer as any).assetService;
    expect(serviceAny.createAsset).not.toHaveBeenCalled();
  });

  it('should create assets for fixed asset items', async () => {
    let callback: any;
    vi.mocked(eventBus.subscribe).mockImplementation((event, cb) => {
      if (event === 'StockReceived') callback = cb;
    });

    consumer.register();

    const mockEvent = {
      correlationId: 'corr-2',
      payload: {
        inventoryItemId: 'INV-2',
        warehouseId: 'WH-1',
        quantityReceived: 2,
        transactionId: 'TX-LAPTOP',
        receivedAt: new Date('2026-07-21')
      }
    };

    vi.mocked(prisma.inventoryItem.findUnique).mockResolvedValue({
      id: 'INV-2',
      name: 'MacBook Pro',
      description: 'M3 Max',
      category: {
        name: 'Laptops',
        isFixedAsset: true
      }
    } as any);

    vi.mocked(prisma.assetCategory.findUnique).mockResolvedValue({
      id: 'CAT-1',
      name: 'Laptops'
    } as any);

    vi.mocked(prisma.department.findFirst).mockResolvedValue({
      id: 'DEPT-1',
      name: 'IT'
    } as any);

    await callback(mockEvent);

    const serviceAny = (consumer as any).assetService;
    expect(serviceAny.createAsset).toHaveBeenCalledTimes(2);

    expect(serviceAny.createAsset).toHaveBeenNthCalledWith(1, {
      assetTag: 'AST-TX-LAPTO-1',
      name: 'MacBook Pro',
      description: 'M3 Max',
      categoryId: 'CAT-1',
      departmentId: 'DEPT-1',
      status: 'AVAILABLE',
      condition: 'EXCELLENT',
      purchaseDate: mockEvent.payload.receivedAt
    });

    expect(serviceAny.createAsset).toHaveBeenNthCalledWith(2, {
      assetTag: 'AST-TX-LAPTO-2',
      name: 'MacBook Pro',
      description: 'M3 Max',
      categoryId: 'CAT-1',
      departmentId: 'DEPT-1',
      status: 'AVAILABLE',
      condition: 'EXCELLENT',
      purchaseDate: mockEvent.payload.receivedAt
    });
  });

  it('should handle TAG_EXISTS gracefully for idempotency', async () => {
    let callback: any;
    vi.mocked(eventBus.subscribe).mockImplementation((event, cb) => {
      if (event === 'StockReceived') callback = cb;
    });

    consumer.register();

    const mockEvent = {
      payload: {
        inventoryItemId: 'INV-3',
        warehouseId: 'WH-1',
        quantityReceived: 1,
        transactionId: 'TX-MONITOR',
        receivedAt: new Date()
      }
    };

    vi.mocked(prisma.inventoryItem.findUnique).mockResolvedValue({
      id: 'INV-3',
      name: 'Monitor',
      category: {
        name: 'Displays',
        isFixedAsset: true
      }
    } as any);

    vi.mocked(prisma.assetCategory.findUnique).mockResolvedValue({ id: 'CAT-2' } as any);
    vi.mocked(prisma.department.findFirst).mockResolvedValue({ id: 'DEPT-1' } as any);

    const serviceAny = (consumer as any).assetService;
    serviceAny.createAsset.mockRejectedValue({ code: 'TAG_EXISTS', message: 'Asset tag already exists' });

    // Should not throw, gracefully caught
    await expect(callback(mockEvent)).resolves.not.toThrow();
  });
});
