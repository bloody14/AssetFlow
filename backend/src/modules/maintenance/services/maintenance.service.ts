import { PrismaMaintenanceRepository } from '../repositories/maintenance.repository';
import {
  CreateMaintenanceDTO,
  AssignTechnicianDTO,
  CompleteMaintenanceDTO,
  MaintenanceDomain,
} from '../types/maintenance.types';

export class MaintenanceService {
  constructor(private readonly repo: PrismaMaintenanceRepository) {}

  async createRequest(
    data: CreateMaintenanceDTO,
    reportedById: string
  ): Promise<MaintenanceDomain> {
    return this.repo.createRequest(data, reportedById);
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
    return this.repo.completeMaintenance(id, data, actionUserId);
  }

  async getHistory(assetId: string): Promise<MaintenanceDomain[]> {
    return this.repo.getHistory(assetId);
  }
}
