"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetAllocationController = void 0;
const response_1 = require("../../../shared/response");
const appError_1 = require("../../../shared/appError");
const httpStatus_1 = require("../../../constants/httpStatus");
class AssetAllocationController {
    service;
    constructor(service) {
        this.service = service;
    }
    allocate = async (req, res) => {
        if (!req.user)
            throw new appError_1.AppError('Unauthorized', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
        const result = await this.service.allocateAsset(req.body, req.user.id);
        return (0, response_1.sendSuccess)(res, 'Asset allocated successfully', result);
    };
    returnAsset = async (req, res) => {
        if (!req.user)
            throw new appError_1.AppError('Unauthorized', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
        const result = await this.service.returnAsset(req.body, req.user.id);
        return (0, response_1.sendSuccess)(res, 'Asset returned successfully', result);
    };
    transfer = async (req, res) => {
        if (!req.user)
            throw new appError_1.AppError('Unauthorized', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
        const result = await this.service.transferAsset(req.body, req.user.id);
        return (0, response_1.sendSuccess)(res, 'Asset transferred successfully', result);
    };
    getHistory = async (req, res) => {
        const result = await this.service.getHistory(req.params.assetId);
        return (0, response_1.sendSuccess)(res, 'Asset allocation history retrieved successfully', result);
    };
}
exports.AssetAllocationController = AssetAllocationController;
