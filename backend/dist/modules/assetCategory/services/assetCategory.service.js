"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetCategoryService = void 0;
const appError_1 = require("../../../shared/appError");
const httpStatus_1 = require("../../../constants/httpStatus");
class AssetCategoryService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async createCategory(data) {
        const existing = await this.repo.findByName(data.name);
        if (existing) {
            throw new appError_1.AppError('Category name already exists', httpStatus_1.HTTP_STATUS.CONFLICT, 'CATEGORY_EXISTS');
        }
        return this.repo.create(data);
    }
    async getCategory(id) {
        const cat = await this.repo.findById(id);
        if (!cat)
            throw new appError_1.AppError('Category not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'CATEGORY_NOT_FOUND');
        return cat;
    }
    async getAllCategories() {
        return this.repo.findAll();
    }
    async updateCategory(id, data) {
        const cat = await this.repo.findById(id);
        if (!cat)
            throw new appError_1.AppError('Category not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'CATEGORY_NOT_FOUND');
        if (data.name && data.name !== cat.name) {
            const existing = await this.repo.findByName(data.name);
            if (existing)
                throw new appError_1.AppError('Category name already exists', httpStatus_1.HTTP_STATUS.CONFLICT, 'CATEGORY_EXISTS');
        }
        return this.repo.update(id, data);
    }
    async deleteCategory(id) {
        const cat = await this.repo.findById(id);
        if (!cat)
            throw new appError_1.AppError('Category not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'CATEGORY_NOT_FOUND');
        const hasAssets = await this.repo.hasAssets(id);
        if (hasAssets) {
            throw new appError_1.AppError('Cannot delete category with active assets', httpStatus_1.HTTP_STATUS.CONFLICT, 'CATEGORY_HAS_ASSETS');
        }
        await this.repo.delete(id);
    }
}
exports.AssetCategoryService = AssetCategoryService;
