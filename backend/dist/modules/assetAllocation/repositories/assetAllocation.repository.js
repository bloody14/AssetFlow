"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAssetAllocationRepository = void 0;
const prisma_1 = require("../../../config/prisma");
const appError_1 = require("../../../shared/appError");
const httpStatus_1 = require("../../../constants/httpStatus");
class PrismaAssetAllocationRepository {
    mapToAllocationDomain(allocation) {
        return {
            id: allocation.id,
            assetId: allocation.assetId,
            allocatedToId: allocation.allocatedToId,
            allocatedById: allocation.allocatedById,
            allocatedAt: allocation.allocatedAt,
            returnedAt: allocation.returnedAt,
            returnedById: allocation.returnedById,
            status: allocation.status,
            notes: allocation.notes,
        };
    }
    async getAllocationHistory(assetId) {
        const history = await prisma_1.prisma.assetAllocation.findMany({
            where: { assetId },
            orderBy: { allocatedAt: 'desc' },
        });
        return history.map((h) => this.mapToAllocationDomain(h));
    }
    async allocateAsset(data, allocatedById) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const asset = await tx.asset.findUnique({ where: { id: data.assetId } });
            if (!asset)
                throw new appError_1.AppError('Asset not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'ASSET_NOT_FOUND');
            if (asset.status !== 'AVAILABLE')
                throw new appError_1.AppError('Asset is not available for allocation', httpStatus_1.HTTP_STATUS.CONFLICT, 'ASSET_NOT_AVAILABLE');
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
    async returnAsset(data, returnedById) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const activeAllocation = await tx.assetAllocation.findFirst({
                where: { assetId: data.assetId, status: 'ACTIVE' },
            });
            if (!activeAllocation)
                throw new appError_1.AppError('No active allocation found for this asset', httpStatus_1.HTTP_STATUS.CONFLICT, 'NO_ACTIVE_ALLOCATION');
            const returned = await tx.assetAllocation.update({
                where: { id: activeAllocation.id },
                data: {
                    status: 'RETURNED',
                    returnedAt: new Date(),
                    returnedById,
                    notes: data.notes
                        ? `${activeAllocation.notes || ''}\nReturn Notes: ${data.notes}`
                        : activeAllocation.notes,
                },
            });
            await tx.asset.update({
                where: { id: data.assetId },
                data: { status: 'AVAILABLE', assignedUserId: null },
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
    async transferAsset(data, transferredById) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const activeAllocation = await tx.assetAllocation.findFirst({
                where: { assetId: data.assetId, status: 'ACTIVE' },
            });
            if (!activeAllocation)
                throw new appError_1.AppError('No active allocation found to transfer', httpStatus_1.HTTP_STATUS.CONFLICT, 'NO_ACTIVE_ALLOCATION');
            await tx.assetAllocation.update({
                where: { id: activeAllocation.id },
                data: {
                    status: 'RETURNED',
                    returnedAt: new Date(),
                    returnedById: transferredById,
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
exports.PrismaAssetAllocationRepository = PrismaAssetAllocationRepository;
