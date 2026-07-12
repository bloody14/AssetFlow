"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetService = void 0;
const appError_1 = require("../../../shared/appError");
const httpStatus_1 = require("../../../constants/httpStatus");
class AssetService {
    repo;
    categoryRepo;
    deptRepo;
    userRepo;
    constructor(repo, categoryRepo, deptRepo, userRepo) {
        this.repo = repo;
        this.categoryRepo = categoryRepo;
        this.deptRepo = deptRepo;
        this.userRepo = userRepo;
    }
    async createAsset(data) {
        const existingTag = await this.repo.findByTag(data.assetTag);
        if (existingTag)
            throw new appError_1.AppError('Asset tag already exists', httpStatus_1.HTTP_STATUS.CONFLICT, 'TAG_EXISTS');
        if (data.serialNumber) {
            const existingSerial = await this.repo.findBySerial(data.serialNumber);
            if (existingSerial)
                throw new appError_1.AppError('Serial number already exists', httpStatus_1.HTTP_STATUS.CONFLICT, 'SERIAL_EXISTS');
        }
        const category = await this.categoryRepo.findById(data.categoryId);
        if (!category)
            throw new appError_1.AppError('Category not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'CATEGORY_NOT_FOUND');
        const dept = await this.deptRepo.findById(data.departmentId);
        if (!dept)
            throw new appError_1.AppError('Department not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'DEPARTMENT_NOT_FOUND');
        if (data.assignedUserId) {
            const user = await this.userRepo.findById(data.assignedUserId);
            if (!user)
                throw new appError_1.AppError('User not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
        }
        return this.repo.create(data);
    }
    async getAsset(id) {
        const asset = await this.repo.findById(id);
        if (!asset)
            throw new appError_1.AppError('Asset not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'ASSET_NOT_FOUND');
        return asset;
    }
    async getAllAssets() {
        return this.repo.findAll();
    }
    async updateAsset(id, data) {
        const asset = await this.repo.findById(id);
        if (!asset)
            throw new appError_1.AppError('Asset not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'ASSET_NOT_FOUND');
        if (data.assetTag && data.assetTag !== asset.assetTag) {
            const existingTag = await this.repo.findByTag(data.assetTag);
            if (existingTag)
                throw new appError_1.AppError('Asset tag already exists', httpStatus_1.HTTP_STATUS.CONFLICT, 'TAG_EXISTS');
        }
        if (data.serialNumber && data.serialNumber !== asset.serialNumber) {
            const existingSerial = await this.repo.findBySerial(data.serialNumber);
            if (existingSerial)
                throw new appError_1.AppError('Serial number already exists', httpStatus_1.HTTP_STATUS.CONFLICT, 'SERIAL_EXISTS');
        }
        if (data.categoryId) {
            const category = await this.categoryRepo.findById(data.categoryId);
            if (!category)
                throw new appError_1.AppError('Category not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'CATEGORY_NOT_FOUND');
        }
        if (data.departmentId) {
            const dept = await this.deptRepo.findById(data.departmentId);
            if (!dept)
                throw new appError_1.AppError('Department not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'DEPARTMENT_NOT_FOUND');
        }
        if (data.assignedUserId) {
            const user = await this.userRepo.findById(data.assignedUserId);
            if (!user)
                throw new appError_1.AppError('User not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
        }
        return this.repo.update(id, data);
    }
    async deleteAsset(id) {
        const asset = await this.repo.findById(id);
        if (!asset)
            throw new appError_1.AppError('Asset not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'ASSET_NOT_FOUND');
        await this.repo.delete(id);
    }
}
exports.AssetService = AssetService;
