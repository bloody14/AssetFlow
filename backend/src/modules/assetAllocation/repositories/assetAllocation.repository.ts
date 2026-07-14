import { prisma } from '../../../config/prisma';
import {
  AllocateAssetDTO,
  ReturnAssetDTO,
  TransferAssetDTO,
  AssetAllocationDomain,
} from '../types/assetAllocation.types';
import { AppError } from '../../../shared/appError';
import { HTTP_STATUS } from '../../../constants/httpStatus';

export class PrismaAssetAllocationRepository {
  private mapToAllocationDomain(
    allocation: import('@prisma/client').AssetAllocation
  ): AssetAllocationDomain {
    return {
      id: allocation.id,
      assetId: allocation.assetId,
      allocatedToId: allocation.allocatedToId,
      allocatedById: allocation.allocatedById,
      allocatedAt: allocation.allocatedAt,
      returnedAt: allocation.returnedAt,
      returnedById: allocation.returnedById,
      returnCondition: allocation.returnCondition,
      status: allocation.status,
      notes: allocation.notes,
    };
  }

  async getAllocationHistory(assetId: string): Promise<AssetAllocationDomain[]> {
    const history = await prisma.assetAllocation.findMany({
      where: { assetId },
      orderBy: { allocatedAt: 'desc' },
    });
    return history.map((h) => this.mapToAllocationDomain(h));
  }

  async allocateAsset(
    data: AllocateAssetDTO,
    allocatedById: string
  ): Promise<AssetAllocationDomain> {
    const result = await prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({ where: { id: data.assetId } });
      if (!asset) throw new AppError('Asset not found', HTTP_STATUS.NOT_FOUND, 'ASSET_NOT_FOUND');
      if (asset.status !== 'AVAILABLE')
        throw new AppError(
          'Asset is not available for allocation',
          HTTP_STATUS.CONFLICT,
          'ASSET_NOT_AVAILABLE'
        );

      const allocation = await tx.assetAllocation.create({
        data: {
          assetId: data.assetId,
          allocatedToId: data.allocatedToId,
          allocatedById,
          notes: data.notes,
          status: 'ACTIVE',
        },
      });

      await tx.asset.update({
        where: { id: data.assetId },
        data: { status: 'ASSIGNED', assignedUserId: data.allocatedToId },
      });

      await tx.assetTimeline.create({
        data: {
          assetId: data.assetId,
          eventType: 'ALLOCATED',
          actorId: allocatedById,
          actorType: 'USER',
          notes: data.notes || `Allocated to user ${data.allocatedToId}`,
        },
      });

      await tx.auditLog.create({
        data: {
          entityType: 'ASSET',
          entityId: data.assetId,
          action: 'ALLOCATE',
          userId: allocatedById,
          details: { allocatedToId: data.allocatedToId, notes: data.notes },
        },
      });

      return allocation;
    });

    return this.mapToAllocationDomain(result);
  }

  async returnAsset(data: ReturnAssetDTO, returnedById: string): Promise<AssetAllocationDomain> {
    const result = await prisma.$transaction(async (tx) => {
      const activeAllocation = await tx.assetAllocation.findFirst({
        where: { assetId: data.assetId, status: 'ACTIVE' },
      });
      if (!activeAllocation)
        throw new AppError(
          'No active allocation found for this asset',
          HTTP_STATUS.CONFLICT,
          'NO_ACTIVE_ALLOCATION'
        );

      const returned = await tx.assetAllocation.update({
        where: { id: activeAllocation.id },
        data: {
          status: 'RETURNED',
          returnedAt: new Date(),
          returnedById,
          returnCondition: data.condition,
          notes: data.notes
            ? `${activeAllocation.notes || ''}\nReturn Notes: ${data.notes}`
            : activeAllocation.notes,
        },
      });

      const nextStatus = ['DAMAGED', 'BROKEN'].includes(data.condition) ? 'IN_MAINTENANCE' : 'AVAILABLE';

      await tx.asset.update({
        where: { id: data.assetId },
        data: { 
          status: nextStatus, 
          condition: data.condition,
          assignedUserId: null 
        },
      });

      await tx.assetTimeline.create({
        data: {
          assetId: data.assetId,
          eventType: 'RETURNED',
          actorId: returnedById,
          actorType: 'USER',
          notes: `Asset returned in ${data.condition} condition. ${data.notes || ''}`,
        },
      });

      await tx.auditLog.create({
        data: {
          entityType: 'ASSET',
          entityId: data.assetId,
          action: 'RETURN',
          userId: returnedById,
          details: { returnedFromId: activeAllocation.allocatedToId, notes: data.notes },
        },
      });

      return returned;
    });

    return this.mapToAllocationDomain(result);
  }

  async transferAsset(
    data: TransferAssetDTO,
    transferredById: string
  ): Promise<AssetAllocationDomain> {
    const result = await prisma.$transaction(async (tx) => {
      const activeAllocation = await tx.assetAllocation.findFirst({
        where: { assetId: data.assetId, status: 'ACTIVE' },
      });
      if (!activeAllocation)
        throw new AppError(
          'No active allocation found to transfer',
          HTTP_STATUS.CONFLICT,
          'NO_ACTIVE_ALLOCATION'
        );

      await tx.assetAllocation.update({
        where: { id: activeAllocation.id },
        data: {
          status: 'RETURNED',
          returnedAt: new Date(),
          returnedById: transferredById,
        },
      });

      await tx.assetTimeline.create({
        data: {
          assetId: data.assetId,
          eventType: 'TRANSFERRED',
          actorId: transferredById,
          actorType: 'USER',
          notes: `Asset transferred from ${activeAllocation.allocatedToId} to ${data.newAllocatedToId}. ${data.notes || ''}`,
        },
      });

      const newAllocation = await tx.assetAllocation.create({
        data: {
          assetId: data.assetId,
          allocatedToId: data.newAllocatedToId,
          allocatedById: transferredById,
          notes: data.notes,
          status: 'ACTIVE',
        },
      });

      await tx.asset.update({
        where: { id: data.assetId },
        data: { assignedUserId: data.newAllocatedToId },
      });

      await tx.auditLog.create({
        data: {
          entityType: 'ASSET',
          entityId: data.assetId,
          action: 'TRANSFER',
          userId: transferredById,
          details: {
            fromId: activeAllocation.allocatedToId,
            toId: data.newAllocatedToId,
            notes: data.notes,
          },
        },
      });

      return newAllocation;
    });

    return this.mapToAllocationDomain(result);
  }
}
