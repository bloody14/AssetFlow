import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LowStockConsumer } from '../../src/modules/procurement/consumers/low-stock.consumer';
import { eventBus } from '../../src/shared/events/eventBus';
import { prisma } from '../../src/config/prisma';
import { ProcurementService } from '../../src/modules/procurement/services/procurement.service';
import { SYSTEM_ACTORS } from '../../src/shared/constants/systemActors';

vi.mock('../../src/shared/events/eventBus', () => ({
  eventBus: {
    subscribe: vi.fn(),
    publish: vi.fn(),
  }
}));

vi.mock('../../src/config/prisma', () => ({
  prisma: {
    purchaseRequest: {
      findFirst: vi.fn(),
    },
    department: {
      findFirst: vi.fn(),
    }
  }
}));

vi.mock('../../src/modules/procurement/services/procurement.service', () => ({
  ProcurementService: class {
    createPurchaseRequest = vi.fn().mockResolvedValue({ id: 'PR-123' });
  }
}));

describe('LowStockConsumer', () => {
  let consumer: LowStockConsumer;

  beforeEach(() => {
    vi.clearAllMocks();
    consumer = new LowStockConsumer();
  });

  it('should register successfully', () => {
    consumer.register();
    expect(eventBus.subscribe).toHaveBeenCalledWith('LowStockDetected', expect.any(Function));
  });

  it('should skip PR generation if a PENDING PR already exists', async () => {
    let callback: any;
    vi.mocked(eventBus.subscribe).mockImplementation((event, cb) => {
      if (event === 'LowStockDetected') callback = cb;
    });

    consumer.register();

    const mockEvent = {
      payload: {
        inventoryItemId: 'INV-1',
        warehouseId: 'WH-1',
        quantityAvailable: 5,
        reorderPoint: 10,
        reorderQuantity: 50,
        detectedAt: new Date()
      }
    };

    // Mock existing PR
    vi.mocked(prisma.purchaseRequest.findFirst).mockResolvedValue({ id: 'PR-EXISTING' } as any);

    await callback(mockEvent);

    expect(prisma.department.findFirst).not.toHaveBeenCalled();
    const serviceAny = (consumer as any).procurementService;
    expect(serviceAny.createPurchaseRequest).not.toHaveBeenCalled();
  });

  it('should generate a PR if no PENDING PR exists', async () => {
    let callback: any;
    vi.mocked(eventBus.subscribe).mockImplementation((event, cb) => {
      if (event === 'LowStockDetected') callback = cb;
    });

    consumer.register();

    const mockEvent = {
      payload: {
        inventoryItemId: 'INV-2',
        warehouseId: 'WH-1',
        quantityAvailable: 5,
        reorderPoint: 10,
        reorderQuantity: 20,
        detectedAt: new Date()
      }
    };

    vi.mocked(prisma.purchaseRequest.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.department.findFirst).mockResolvedValue({ id: 'DEPT-1' } as any);

    await callback(mockEvent);

    const serviceAny = (consumer as any).procurementService;
    expect(serviceAny.createPurchaseRequest).toHaveBeenCalledWith({
      requesterId: SYSTEM_ACTORS.INVENTORY,
      departmentId: 'DEPT-1',
      justification: expect.stringContaining('Automated Replenishment'),
      priority: 'MEDIUM',
      items: [
        {
          inventoryItemId: 'INV-2',
          quantity: 20 // Since reorderQuantity (20) > reorderPoint - available + 1 (10 - 5 + 1 = 6)
        }
      ]
    });
  });

  it('should calculate quantity correctly when reorderQuantity is small', async () => {
    let callback: any;
    vi.mocked(eventBus.subscribe).mockImplementation((event, cb) => {
      if (event === 'LowStockDetected') callback = cb;
    });

    consumer.register();

    const mockEvent = {
      payload: {
        inventoryItemId: 'INV-3',
        warehouseId: 'WH-1',
        quantityAvailable: 2,
        reorderPoint: 10,
        reorderQuantity: 0, // Fallback to calculate
        detectedAt: new Date()
      }
    };

    vi.mocked(prisma.purchaseRequest.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.department.findFirst).mockResolvedValue({ id: 'DEPT-1' } as any);

    await callback(mockEvent);

    const serviceAny = (consumer as any).procurementService;
    expect(serviceAny.createPurchaseRequest).toHaveBeenCalledWith(expect.objectContaining({
      items: [
        {
          inventoryItemId: 'INV-3',
          quantity: 9 // 10 - 2 + 1 = 9
        }
      ]
    }));
  });
});
