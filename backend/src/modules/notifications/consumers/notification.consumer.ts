import { eventBus } from '../../../shared/events/eventBus';
import { LowStockDetectedPayload, StockReceivedPayload } from '../../../shared/events/types';
import { NotificationService } from '../services/notification.service';
import { logger, asyncLocalStorage } from '../../../shared/logger';

export class NotificationConsumer {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  public register() {
    eventBus.subscribe<LowStockDetectedPayload>('LowStockDetected', async (event) => {
      await asyncLocalStorage.run({ correlationId: event.correlationId || event.eventId }, async () => {
        try {
          await this.notificationService.dispatch({
            recipientId: 'PROCUREMENT_TEAM', // Mock role recipient
            type: 'IN_APP',
            title: 'Low Stock Alert',
            message: `Item ${event.payload.inventoryItemId} is low on stock (${event.payload.quantityAvailable} remaining).`,
            priority: 'HIGH'
          });
        } catch (error: any) {
          logger.error(`Notification failed: ${error.message}`, { error, event: 'LowStockDetected' });
        }
      });
    });

    eventBus.subscribe<StockReceivedPayload>('StockReceived', async (event) => {
      await asyncLocalStorage.run({ correlationId: event.correlationId || event.eventId }, async () => {
        try {
          await this.notificationService.dispatch({
            recipientId: 'WAREHOUSE_MANAGER',
            type: 'IN_APP',
            title: 'Stock Received',
            message: `Received ${event.payload.quantityReceived} units for item ${event.payload.inventoryItemId}.`,
            priority: 'LOW'
          });
        } catch (error: any) {
          logger.error(`Notification failed: ${error.message}`, { error, event: 'StockReceived' });
        }
      });
    });

    // Subscribing to other critical events with weakly typed payloads for MVP demonstration
    eventBus.subscribe<any>('PurchaseRequestApproved', async (event) => {
      await asyncLocalStorage.run({ correlationId: event.correlationId || event.eventId }, async () => {
        try {
          await this.notificationService.dispatch({
            recipientId: event.payload?.requesterId || 'SYSTEM_USER',
            type: 'EMAIL',
            title: 'Purchase Request Approved',
            message: `Your Purchase Request ${event.payload?.id || 'N/A'} has been approved.`,
            priority: 'MEDIUM'
          });
        } catch (error: any) {
          logger.error(`Notification failed: ${error.message}`, { error, event: 'PurchaseRequestApproved' });
        }
      });
    });

    eventBus.subscribe<any>('PurchaseOrderIssued', async (event) => {
      await asyncLocalStorage.run({ correlationId: event.correlationId || event.eventId }, async () => {
        try {
          await this.notificationService.dispatch({
            recipientId: event.payload?.supplierId || 'SUPPLIER',
            type: 'EMAIL',
            title: 'Purchase Order Issued',
            message: `A new Purchase Order ${event.payload?.id || 'N/A'} has been issued to you.`,
            priority: 'HIGH'
          });
        } catch (error: any) {
          logger.error(`Notification failed: ${error.message}`, { error, event: 'PurchaseOrderIssued' });
        }
      });
    });

    eventBus.subscribe<any>('MaintenanceRequested', async (event) => {
      await asyncLocalStorage.run({ correlationId: event.correlationId || event.eventId }, async () => {
        try {
          await this.notificationService.dispatch({
            recipientId: 'MAINTENANCE_TEAM',
            type: 'IN_APP',
            title: 'Maintenance Requested',
            message: `Maintenance requested for asset ${event.payload?.assetId || 'N/A'}.`,
            priority: 'HIGH'
          });
        } catch (error: any) {
          logger.error(`Notification failed: ${error.message}`, { error, event: 'MaintenanceRequested' });
        }
      });
    });
  }
}
