import { PrismaAssetCategoryRepository } from '../repositories/assetCategory.repository';
import {
  CreateAssetCategoryDTO,
  UpdateAssetCategoryDTO,
  AssetCategoryDomain,
} from '../types/assetCategory.types';
import { AppError } from '../../../shared/appError';
import { HTTP_STATUS } from '../../../constants/httpStatus';

export class AssetCategoryService {
  constructor(private readonly repo: PrismaAssetCategoryRepository) {}

  async createCategory(data: CreateAssetCategoryDTO): Promise<AssetCategoryDomain> {
    const existing = await this.repo.findByName(data.name);
    if (existing) {
      throw new AppError('Category name already exists', HTTP_STATUS.CONFLICT, 'CATEGORY_EXISTS');
    }
    return this.repo.create(data);
  }

  async getCategory(id: string): Promise<AssetCategoryDomain> {
    const cat = await this.repo.findById(id);
    if (!cat) throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND, 'CATEGORY_NOT_FOUND');
    return cat;
  }

  async getAllCategories(): Promise<AssetCategoryDomain[]> {
    return this.repo.findAll();
  }

  async updateCategory(id: string, data: UpdateAssetCategoryDTO): Promise<AssetCategoryDomain> {
    const cat = await this.repo.findById(id);
    if (!cat) throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND, 'CATEGORY_NOT_FOUND');

    if (data.name && data.name !== cat.name) {
      const existing = await this.repo.findByName(data.name);
      if (existing)
        throw new AppError('Category name already exists', HTTP_STATUS.CONFLICT, 'CATEGORY_EXISTS');
    }
    return this.repo.update(id, data);
  }

  async deleteCategory(id: string): Promise<void> {
    const cat = await this.repo.findById(id);
    if (!cat) throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND, 'CATEGORY_NOT_FOUND');

    const hasAssets = await this.repo.hasAssets(id);
    if (hasAssets) {
      throw new AppError(
        'Cannot delete category with active assets',
        HTTP_STATUS.CONFLICT,
        'CATEGORY_HAS_ASSETS'
      );
    }
    await this.repo.delete(id);
  }
}
