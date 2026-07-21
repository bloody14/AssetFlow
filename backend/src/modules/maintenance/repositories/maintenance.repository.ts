import { prisma } from '../../../config/prisma';
import {
  MaintenanceDomain,
  CreateMaintenanceDTO,
  AssignTechnicianDTO,
  CompleteMaintenanceDTO,
} from '../types/maintenance.types';
import { AppError } from '../../../shared/appError';
import { HTTP_STATUS } from '../../../constants/httpStatus';

export class PrismaMaintenanceRepository {
  private mapToDomain(maintenance: import('@prisma/client').MaintenanceRequest): MaintenanceDomain {
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
      attachments: maintenance.attachments as Record<string, unknown> | null,
      createdAt: maintenance.createdAt,
      updatedAt: maintenance.updatedAt,
    };
  }

  async createRequest(
    data: CreateMaintenanceDTO,
    reportedById: string
  ): Promise<MaintenanceDomain> {
    const result = await prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({ where: { id: data.assetId } });
      if (!asset) throw new AppError('Asset not found', HTTP_STATUS.NOT_FOUND, 'ASSET_NOT_FOUND');

      const activeAllocation = await tx.assetAllocation.findFirst({
        where: { assetId: data.assetId, status: 'ACTIVE' },
      });
      if (activeAllocation)
        throw new AppError('Asset is currently allocated', HTTP_STATUS.CONFLICT, 'ASSET_ALLOCATED');

      const activeBooking = await tx.resourceBooking.findFirst({
        where: {
          assetId: data.assetId,
          status: { in: ['PENDING', 'APPROVED'] },
          endTime: { gt: new Date() },
        },
      });
      if (activeBooking)
        throw new AppError('Asset has active bookings', HTTP_STATUS.CONFLICT, 'ASSET_BOOKED');

      const request = await tx.maintenanceRequest.create({
        data: {
          assetId: data.assetId,
          reportedById,
          issue: data.issue,
          attachments: data.attachments ? (data.attachments as any) : undefined,
          status: 'PENDING',
        },
      });

      await tx.asset.update({
        where: { id: data.assetId },
        data: { status: 'IN_MAINTENANCE' },
      });

      await tx.assetTimeline.create({
        data: {
          assetId: data.assetId,
          eventType: 'MAINTENANCE_STARTED',
          actorId: reportedById,
          actorType: 'USER',
          notes: `Maintenance request created. Issue: ${data.issue}`,
        },
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

  async assignTechnician(
    id: string,
    data: AssignTechnicianDTO,
    actionUserId: string
  ): Promise<MaintenanceDomain> {
    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.findUnique({ where: { id } });
      if (!request)
        throw new AppError(
          'Maintenance request not found',
          HTTP_STATUS.NOT_FOUND,
          'MAINTENANCE_NOT_FOUND'
        );

      const tech = await tx.user.findUnique({ where: { id: data.technicianId } });
      if (!tech)
        throw new AppError('Technician not found', HTTP_STATUS.NOT_FOUND, 'TECHNICIAN_NOT_FOUND');

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

  async updateStatus(
    id: string,
    status: import('@prisma/client').MaintenanceStatus,
    actionUserId: string
  ): Promise<MaintenanceDomain> {
    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.findUnique({ where: { id } });
      if (!request)
        throw new AppError(
          'Maintenance request not found',
          HTTP_STATUS.NOT_FOUND,
          'MAINTENANCE_NOT_FOUND'
        );

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

  async completeMaintenance(
    id: string,
    data: CompleteMaintenanceDTO,
    actionUserId: string
  ): Promise<MaintenanceDomain> {
    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.findUnique({ where: { id } });
      if (!request)
        throw new AppError(
          'Maintenance request not found',
          HTTP_STATUS.NOT_FOUND,
          'MAINTENANCE_NOT_FOUND'
        );

      const completed = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          resolution: data.resolution,
          cost: data.cost,
          attachments: data.attachments ? (data.attachments as any) : request.attachments,
          completedAt: new Date(),
        },
      });

      await tx.asset.update({
        where: { id: request.assetId },
        data: {
          status: 'AVAILABLE',
          ...(data.condition ? { condition: data.condition } : {}),
        },
      });

      await tx.assetTimeline.create({
        data: {
          assetId: request.assetId,
          eventType: 'MAINTENANCE_COMPLETED',
          actorId: actionUserId,
          actorType: 'USER',
          notes: `Maintenance completed. Resolution: ${data.resolution}. Cost: ${data.cost || 0}`,
        },
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

  async getHistory(assetId: string): Promise<MaintenanceDomain[]> {
    const history = await prisma.maintenanceRequest.findMany({
      where: { assetId },
      orderBy: { createdAt: 'desc' },
    });
    return history.map((h) => this.mapToDomain(h));
  }
}
