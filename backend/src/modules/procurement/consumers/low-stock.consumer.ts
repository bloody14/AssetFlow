import { eventBus } from '../../../shared/events/eventBus';
import { LowStockDetectedPayload } from '../../../shared/events/types';
import { ProcurementService } from '../services/procurement.service';
import { PrismaProcurementRepository } from '../repositories/procurement.repository';
import { prisma } from '../../../config/prisma';
import { logger, asyncLocalStorage } from '../../../shared/logger';
import { SYSTEM_ACTORS } from '../../../shared/constants/systemActors';

export class LowStockConsumer {
  private procurementService: ProcurementService;

  constructor() {
    this.procurementService = new ProcurementService(new PrismaProcurementRepository());
  }

  public register() {
    eventBus.subscribe<LowStockDetectedPayload>('LowStockDetected', async (event) => {
      await asyncLocalStorage.run({ correlationId: event.correlationId || event.eventId }, async () => {
        try {
          const payload = event.payload;
          logger.info(`Processing LowStockDetected event for item ${payload.inventoryItemId}`, {
            module: 'Procurement',
            operation: 'LowStockConsumer',
            correlationId: event.correlationId
          });

          // 1. Idempotency Check: Check if there is already a PENDING Purchase Request for this item
          const existingPR = await prisma.purchaseRequest.findFirst({
            where: {
              status: 'PENDING',
              items: {
                some: {
                  inventoryItemId: payload.inventoryItemId
                }
              }
            }
          });

          if (existingPR) {
            logger.info(`A PENDING Purchase Request (${existingPR.id}) already exists for item ${payload.inventoryItemId}. Skipping automatic PR generation.`);
            return;
          }

          // 2. Fetch a default Department to assign the PR to.
          // In reality, this might be a central Procurement Department or determined by Category.
          const defaultDepartment = await prisma.department.findFirst({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'asc' }
          });

          if (!defaultDepartment) {
            throw new Error('No active department found to assign the Purchase Request to.');
          }

          // 3. Create a DRAFT/PENDING Purchase Request
          const quantityToOrder = Math.max(
            payload.reorderQuantity || 1, 
            payload.reorderPoint - payload.quantityAvailable + 1
          );

          const pr = await this.procurementService.createPurchaseRequest({
            requesterId: SYSTEM_ACTORS.INVENTORY, // The system (Inventory) requested this
            departmentId: defaultDepartment.id,
            justification: `Automated Replenishment: Stock dropped to ${payload.quantityAvailable}, below reorder point of ${payload.reorderPoint}.`,
            priority: 'MEDIUM',
            items: [
              {
                inventoryItemId: payload.inventoryItemId,
                quantity: quantityToOrder
              }
            ]
          });

          logger.info(`Successfully created automated Purchase Request ${pr.id} for item ${payload.inventoryItemId}`);
        } catch (error: any) {
          logger.error(`Failed to process LowStockDetected event: ${error.message}`, {
            error,
            module: 'Procurement',
            operation: 'LowStockConsumer'
          });
        }
      });
    });
  }
}
