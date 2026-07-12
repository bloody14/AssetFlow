"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceController = void 0;
const response_1 = require("../../../shared/response");
const appError_1 = require("../../../shared/appError");
const httpStatus_1 = require("../../../constants/httpStatus");
class MaintenanceController {
    service;
    constructor(service) {
        this.service = service;
    }
    create = async (req, res) => {
        if (!req.user)
            throw new appError_1.AppError('Unauthorized', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
        const result = await this.service.createRequest(req.body, req.user.id);
        return (0, response_1.sendSuccess)(res, 'Maintenance request created successfully', result);
    };
    assign = async (req, res) => {
        if (!req.user)
            throw new appError_1.AppError('Unauthorized', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
        const result = await this.service.assignTechnician(req.params.id, req.body, req.user.id);
        return (0, response_1.sendSuccess)(res, 'Technician assigned successfully', result);
    };
    updateStatus = async (req, res) => {
        if (!req.user)
            throw new appError_1.AppError('Unauthorized', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
        const result = await this.service.updateStatus(req.params.id, req.body.status, req.user.id);
        return (0, response_1.sendSuccess)(res, 'Maintenance status updated', result);
    };
    complete = async (req, res) => {
        if (!req.user)
            throw new appError_1.AppError('Unauthorized', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
        const result = await this.service.completeMaintenance(req.params.id, req.body, req.user.id);
        return (0, response_1.sendSuccess)(res, 'Maintenance completed successfully', result);
    };
    history = async (req, res) => {
        const result = await this.service.getHistory(req.params.assetId);
        return (0, response_1.sendSuccess)(res, 'Maintenance history retrieved', result);
    };
}
exports.MaintenanceController = MaintenanceController;
