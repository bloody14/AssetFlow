"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingController = void 0;
const response_1 = require("../../../shared/response");
class ReportingController {
    service;
    constructor(service) {
        this.service = service;
    }
    getSummary = async (_req, res) => {
        const data = await this.service.getDashboardSummary();
        return (0, response_1.sendSuccess)(res, 'Dashboard summary retrieved successfully', data);
    };
    getAssetStats = async (_req, res) => {
        const data = await this.service.getAssetStatistics();
        return (0, response_1.sendSuccess)(res, 'Asset statistics retrieved successfully', data);
    };
}
exports.ReportingController = ReportingController;
