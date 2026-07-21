import { eventBus } from '../../../shared/events/eventBus';
import { GoodsReceiptCompletedPayload } from '../../../shared/events/types';
import { InventoryService } from '../services/inventory.service';
import { PrismaInventoryRepository } from '../repositories/inventory.repository';
import { prisma } from '../../../config/prisma';
import { logger, asyncLocalStorage } from '../../../shared/logger';
import { SYSTEM_ACTORS } from '../../../shared/constants/systemActors';

export class GoodsReceiptConsumer {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService(new PrismaInventoryRepository());
  }

  public register() {
    eventBus.subscribe<GoodsReceiptCompletedPayload>('GoodsReceiptCompleted', async (event) => {
      await asyncLocalStorage.run({ correlationId: event.correlationId || event.eventId }, async () => {
        try {
          const payload = event.payload;
          logger.info(`Processing GoodsReceiptCompleted event for receipt ${payload.receiptNumber}`, { 
            module: 'Inventory', 
            operation: 'GoodsReceiptConsumer',
            correlationId: event.correlationId
          });

          if (!payload.items || payload.items.length === 0) {
            logger.warn('Received GoodsReceiptCompleted event with no items. Ignoring.');
            return;
          }

          // Determine target warehouse. In a real system, the receipt might specify this, 
          // or we determine it based on business rules. We'll pick the first active warehouse.
          const defaultWarehouse = await prisma.warehouse.findFirst({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'asc' }
          });

          if (!defaultWarehouse) {
            throw new Error('No active warehouse found to receive goods into.');
          }

          // Process each item idempotently
          for (const item of payload.items) {
            await this.inventoryService.receiveStock({
              inventoryItemId: item.inventoryItemId,
              warehouseId: defaultWarehouse.id,
              quantity: item.quantityReceived,
              referenceId: payload.receiptNumber, // Used for idempotency check in repository
              notes: `Received from PO ${payload.purchaseOrderId} via Receipt ${payload.receiptNumber}`
            }, SYSTEM_ACTORS.PROCUREMENT);
          }

          logger.info(`Successfully processed GoodsReceiptCompleted event for receipt ${payload.receiptNumber}`);
        } catch (error: any) {
          logger.error(`Failed to process GoodsReceiptCompleted event: ${error.message}`, {
            error,
            module: 'Inventory',
            operation: 'GoodsReceiptConsumer'
          });
          // In a persistent EventBus setup, we would throw here so the message is nacked and retried.
          // For in-memory, we just log it.
        }
      });
    });
  }
}
