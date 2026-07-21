import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationConsumer } from '../../src/modules/notifications/consumers/notification.consumer';
import { eventBus } from '../../src/shared/events/eventBus';

vi.mock('../../src/shared/events/eventBus', () => ({
  eventBus: {
    subscribe: vi.fn(),
  }
}));

describe('NotificationConsumer', () => {
  let consumer: NotificationConsumer;

  beforeEach(() => {
    vi.clearAllMocks();
    consumer = new NotificationConsumer();
  });

  it('should register successfully to multiple events', () => {
    consumer.register();
    expect(eventBus.subscribe).toHaveBeenCalledWith('LowStockDetected', expect.any(Function));
    expect(eventBus.subscribe).toHaveBeenCalledWith('StockReceived', expect.any(Function));
    expect(eventBus.subscribe).toHaveBeenCalledWith('PurchaseRequestApproved', expect.any(Function));
    expect(eventBus.subscribe).toHaveBeenCalledWith('PurchaseOrderIssued', expect.any(Function));
    expect(eventBus.subscribe).toHaveBeenCalledWith('MaintenanceRequested', expect.any(Function));
  });

  it('should dispatch notification for LowStockDetected', async () => {
    let callback: any;
    vi.mocked(eventBus.subscribe).mockImplementation((event, cb) => {
      if (event === 'LowStockDetected') callback = cb;
    });

    consumer.register();
    const serviceAny = (consumer as any).notificationService;
    vi.spyOn(serviceAny, 'dispatch').mockResolvedValue(true);

    const mockEvent = {
      correlationId: 'corr-low-stock',
      payload: {
        inventoryItemId: 'INV-123',
        quantityAvailable: 2,
      }
    };

    await callback(mockEvent);

    expect(serviceAny.dispatch).toHaveBeenCalledWith({
      recipientId: 'PROCUREMENT_TEAM',
      type: 'IN_APP',
      title: 'Low Stock Alert',
      message: 'Item INV-123 is low on stock (2 remaining).',
      priority: 'HIGH'
    });
  });

  it('should dispatch notification for PurchaseOrderIssued', async () => {
    let callback: any;
    vi.mocked(eventBus.subscribe).mockImplementation((event, cb) => {
      if (event === 'PurchaseOrderIssued') callback = cb;
    });

    consumer.register();
    const serviceAny = (consumer as any).notificationService;
    vi.spyOn(serviceAny, 'dispatch').mockResolvedValue(true);

    const mockEvent = {
      correlationId: 'corr-po',
      payload: {
        id: 'PO-999',
        supplierId: 'SUP-456'
      }
    };

    await callback(mockEvent);

    expect(serviceAny.dispatch).toHaveBeenCalledWith({
      recipientId: 'SUP-456',
      type: 'EMAIL',
      title: 'Purchase Order Issued',
      message: 'A new Purchase Order PO-999 has been issued to you.',
      priority: 'HIGH'
    });
  });
});
