import { eventBus } from '../../../shared/events/eventBus';
import { StockReceivedPayload } from '../../../shared/events/types';
import { AssetService } from '../services/asset.service';
import { PrismaAssetRepository } from '../repositories/asset.repository';
import { PrismaAssetCategoryRepository } from '../../assetCategory/repositories/assetCategory.repository';
import { PrismaDepartmentRepository } from '../../department/repositories/department.repository';
import { PrismaUserRepository } from '../../user/repositories/user.repository';
import { prisma } from '../../../config/prisma';
import { logger, asyncLocalStorage } from '../../../shared/logger';

export class StockReceivedConsumer {
  private assetService: AssetService;

  constructor() {
    this.assetService = new AssetService(
      new PrismaAssetRepository(),
      new PrismaAssetCategoryRepository(),
      new PrismaDepartmentRepository(),
      new PrismaUserRepository()
    );
  }

  public register() {
    eventBus.subscribe<StockReceivedPayload>('StockReceived', async (event) => {
      await asyncLocalStorage.run({ correlationId: event.correlationId || event.eventId }, async () => {
        try {
          const payload = event.payload;
          logger.info(`Processing StockReceived event for transaction ${payload.transactionId}`, { 
            module: 'Asset', 
            operation: 'StockReceivedConsumer',
            correlationId: event.correlationId
          });

          // 1. Fetch Inventory Item & Category to check if it's a fixed asset
          const inventoryItem = await prisma.inventoryItem.findUnique({
            where: { id: payload.inventoryItemId },
            include: { category: true }
          });

          if (!inventoryItem) {
            logger.warn(`InventoryItem ${payload.inventoryItemId} not found for StockReceived event.`);
            return;
          }

          if (!inventoryItem.category.isFixedAsset) {
            logger.info(`InventoryItem ${inventoryItem.name} is not a fixed asset. Ignoring event.`);
            return;
          }

          // 2. Prepare dependencies for Asset Creation
          // Find or create a matching AssetCategory
          let assetCategory = await prisma.assetCategory.findUnique({
            where: { name: inventoryItem.category.name }
          });
          if (!assetCategory) {
            assetCategory = await prisma.assetCategory.create({
              data: {
                name: inventoryItem.category.name,
                description: `Auto-created from Inventory Category: ${inventoryItem.category.name}`
              }
            });
          }

          // Find a default department (e.g. first active one) to assign the new asset to temporarily
          const defaultDepartment = await prisma.department.findFirst({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'asc' }
          });

          if (!defaultDepartment) {
            throw new Error('No active department found to assign the new asset to.');
          }

          // 3. Create an Asset for each unit received
          for (let i = 0; i < payload.quantityReceived; i++) {
            // Idempotency: Generate a deterministic tag based on transactionId
            // so if this event is redelivered, we get the same tag and catch the Conflict.
            const assetTag = `AST-${payload.transactionId.substring(0, 8).toUpperCase()}-${i + 1}`;

            try {
              await this.assetService.createAsset({
                assetTag,
                name: inventoryItem.name,
                description: inventoryItem.description || `Auto-created from Stock Receipt`,
                categoryId: assetCategory.id,
                departmentId: defaultDepartment.id,
                status: 'AVAILABLE',
                condition: 'EXCELLENT',
                purchaseDate: payload.receivedAt
              });
              
              logger.info(`Auto-created Fixed Asset ${assetTag} from Inventory transaction.`);
            } catch (error: any) {
              // Check for TAG_EXISTS to support idempotency
              if (error.code === 'TAG_EXISTS' || (error.message && error.message.includes('already exists'))) {
                logger.info(`Asset ${assetTag} already exists. Skipping duplicate creation.`);
              } else {
                throw error; // Re-throw unexpected errors
              }
            }
          }

          logger.info(`Successfully processed StockReceived event for transaction ${payload.transactionId}`);
        } catch (error: any) {
          logger.error(`Failed to process StockReceived event: ${error.message}`, {
            error,
            module: 'Asset',
            operation: 'StockReceivedConsumer'
          });
        }
      });
    });
  }
}
