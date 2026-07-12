"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaMaintenanceRepository = void 0;
const prisma_1 = require("../../../config/prisma");
const appError_1 = require("../../../shared/appError");
const httpStatus_1 = require("../../../constants/httpStatus");
class PrismaMaintenanceRepository {
    mapToDomain(maintenance) {
        return {
            id: maintenance.id,
            assetId: maintenance.assetId,
            reportedById: maintenance.reportedById,
            technicianId: maintenance.technicianId,
            issue: maintenance.issue,
            resolution: maintenance.resolution,
            cost: maintenance.cost,
            status: maintenance.status,
            scheduledStart: maintenance.scheduledStart,
            scheduledEnd: maintenance.scheduledEnd,
            completedAt: maintenance.completedAt,
            createdAt: maintenance.createdAt,
            updatedAt: maintenance.updatedAt,
        };
    }
    async createRequest(data, reportedById) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const asset = await tx.asset.findUnique({ where: { id: data.assetId } });
            if (!asset)
                throw new appError_1.AppError('Asset not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'ASSET_NOT_FOUND');
            const activeAllocation = await tx.assetAllocation.findFirst({
                where: { assetId: data.assetId, status: 'ACTIVE' },
            });
            if (activeAllocation)
                throw new appError_1.AppError('Asset is currently allocated', httpStatus_1.HTTP_STATUS.CONFLICT, 'ASSET_ALLOCATED');
            const activeBooking = await tx.resourceBooking.findFirst({
                where: {
                    assetId: data.assetId,
                    status: { in: ['PENDING', 'APPROVED'] },
                    endTime: { gt: new Date() },
                },
            });
            if (activeBooking)
                throw new appError_1.AppError('Asset has active bookings', httpStatus_1.HTTP_STATUS.CONFLICT, 'ASSET_BOOKED');
            const request = await tx.maintenanceRequest.create({
                data: {
                    assetId: data.assetId,
                    reportedById,
                    issue: data.issue,
                    status: 'PENDING',
                },
            });
            await tx.asset.update({
                where: { id: data.assetId },
                data: { status: 'IN_MAINTENANCE' },
            });
            await tx.auditLog.create({
                data: {
                    entityType: 'MAINTENANCE',
                    entityId: request.id,
                    action: 'CREATE',
                    userId: reportedById,
                    details: { issue: data.issue, assetId: data.assetId },
                },
            });
            return request;
        });
        return this.mapToDomain(result);
    }
    async assignTechnician(id, data, actionUserId) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const request = await tx.maintenanceRequest.findUnique({ where: { id } });
            if (!request)
                throw new appError_1.AppError('Maintenance request not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'MAINTENANCE_NOT_FOUND');
            const tech = await tx.user.findUnique({ where: { id: data.technicianId } });
            if (!tech)
                throw new appError_1.AppError('Technician not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'TECHNICIAN_NOT_FOUND');
            const updated = await tx.maintenanceRequest.update({
                where: { id },
                data: {
                    technicianId: data.technicianId,
                    status: 'SCHEDULED',
                    scheduledStart: data.scheduledStart
                        ? new Date(data.scheduledStart)
                        : request.scheduledStart,
                    scheduledEnd: data.scheduledEnd ? new Date(data.scheduledEnd) : request.scheduledEnd,
                },
            });
            await tx.auditLog.create({
                data: {
                    entityType: 'MAINTENANCE',
                    entityId: request.id,
                    action: 'ASSIGN_TECHNICIAN',
                    userId: actionUserId,
                    details: { technicianId: data.technicianId },
                },
            });
            return updated;
        });
        return this.mapToDomain(result);
    }
    async updateStatus(id, status, actionUserId) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const request = await tx.maintenanceRequest.findUnique({ where: { id } });
            if (!request)
                throw new appError_1.AppError('Maintenance request not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'MAINTENANCE_NOT_FOUND');
            const updated = await tx.maintenanceRequest.update({
                where: { id },
                data: { status },
            });
            if (status === 'CANCELLED') {
                await tx.asset.update({
                    where: { id: request.assetId },
                    data: { status: 'AVAILABLE' },
                });
            }
            await tx.auditLog.create({
                data: {
                    entityType: 'MAINTENANCE',
                    entityId: request.id,
                    action: `UPDATE_STATUS_${status}`,
                    userId: actionUserId,
                    details: { previousStatus: request.status, newStatus: status },
                },
            });
            return updated;
        });
        return this.mapToDomain(result);
    }
    async completeMaintenance(id, data, actionUserId) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const request = await tx.maintenanceRequest.findUnique({ where: { id } });
            if (!request)
                throw new appError_1.AppError('Maintenance request not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'MAINTENANCE_NOT_FOUND');
            const completed = await tx.maintenanceRequest.update({
                where: { id },
                data: {
                    status: 'COMPLETED',
                    resolution: data.resolution,
                    cost: data.cost,
                    completedAt: new Date(),
                },
            });
            await tx.asset.update({
                where: { id: request.assetId },
                data: { status: 'AVAILABLE' },
            });
            await tx.auditLog.create({
                data: {
                    entityType: 'MAINTENANCE',
                    entityId: request.id,
                    action: 'COMPLETE',
                    userId: actionUserId,
                    details: { resolution: data.resolution, cost: data.cost },
                },
            });
            return completed;
        });
        return this.mapToDomain(result);
    }
    async getHistory(assetId) {
        const history = await prisma_1.prisma.maintenanceRequest.findMany({
            where: { assetId },
            orderBy: { createdAt: 'desc' },
        });
        return history.map((h) => this.mapToDomain(h));
    }
}
exports.PrismaMaintenanceRepository = PrismaMaintenanceRepository;
