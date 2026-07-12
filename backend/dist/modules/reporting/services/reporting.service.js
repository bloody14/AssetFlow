"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingService = void 0;
class ReportingService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async getDashboardSummary() {
        return this.repo.getDashboardSummary();
    }
    async getAssetStatistics() {
        return this.repo.getAssetStatistics();
    }
}
exports.ReportingService = ReportingService;
