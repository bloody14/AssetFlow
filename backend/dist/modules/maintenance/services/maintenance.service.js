"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceService = void 0;
class MaintenanceService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async createRequest(data, reportedById) {
        return this.repo.createRequest(data, reportedById);
    }
    async assignTechnician(id, data, assignedById) {
        return this.repo.assignTechnician(id, data, assignedById);
    }
    async updateStatus(id, status, actionUserId) {
        return this.repo.updateStatus(id, status, actionUserId);
    }
    async completeMaintenance(id, data, actionUserId) {
        return this.repo.completeMaintenance(id, data, actionUserId);
    }
    async getHistory(assetId) {
        return this.repo.getHistory(assetId);
    }
}
exports.MaintenanceService = MaintenanceService;
