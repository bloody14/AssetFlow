"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetAllocationService = void 0;
const appError_1 = require("../../../shared/appError");
const httpStatus_1 = require("../../../constants/httpStatus");
class AssetAllocationService {
    repo;
    userRepo;
    constructor(repo, userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }
    async allocateAsset(data, allocatedById) {
        const user = await this.userRepo.findById(data.allocatedToId);
        if (!user)
            throw new appError_1.AppError('User not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
        return this.repo.allocateAsset(data, allocatedById);
    }
    async returnAsset(data, returnedById) {
        return this.repo.returnAsset(data, returnedById);
    }
    async transferAsset(data, transferredById) {
        const user = await this.userRepo.findById(data.newAllocatedToId);
        if (!user)
            throw new appError_1.AppError('User not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
        return this.repo.transferAsset(data, transferredById);
    }
    async getHistory(assetId) {
        return this.repo.getAllocationHistory(assetId);
    }
}
exports.AssetAllocationService = AssetAllocationService;
