import { PrismaMaintenanceRepository } from '../repositories/maintenance.repository';
import {
  CreateMaintenanceDTO,
  AssignTechnicianDTO,
  CompleteMaintenanceDTO,
  MaintenanceDomain,
} from '../types/maintenance.types';
import { eventBus } from '../../../shared/events/eventBus';

export class MaintenanceService {
  constructor(private readonly repo: PrismaMaintenanceRepository) {}

  async createRequest(
    data: CreateMaintenanceDTO,
    reportedById: string
  ): Promise<MaintenanceDomain> {
    const request = await this.repo.createRequest(data, reportedById);
    eventBus.publish('MaintenanceStarted', request, reportedById);
    return request;
  }

  async assignTechnician(
    id: string,
    data: AssignTechnicianDTO,
    assignedById: string
  ): Promise<MaintenanceDomain> {
    return this.repo.assignTechnician(id, data, assignedById);
  }

  async updateStatus(
    id: string,
    status: import('@prisma/client').MaintenanceStatus,
    actionUserId: string
  ): Promise<MaintenanceDomain> {
    return this.repo.updateStatus(id, status, actionUserId);
  }

  async completeMaintenance(
    id: string,
    data: CompleteMaintenanceDTO,
    actionUserId: string
  ): Promise<MaintenanceDomain> {
    const request = await this.repo.completeMaintenance(id, data, actionUserId);
    eventBus.publish('MaintenanceCompleted', request, actionUserId);
    return request;
  }

  async getHistory(assetId: string): Promise<MaintenanceDomain[]> {
    return this.repo.getHistory(assetId);
  }
}
