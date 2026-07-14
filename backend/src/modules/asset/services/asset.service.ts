import { PrismaAssetRepository } from '../repositories/asset.repository';
import { CreateAssetDTO, UpdateAssetDTO, AssetDomain } from '../types/asset.types';
import { AppError } from '../../../shared/appError';
import { HTTP_STATUS } from '../../../constants/httpStatus';
import { PrismaAssetCategoryRepository } from '../../assetCategory/repositories/assetCategory.repository';
import { PrismaDepartmentRepository } from '../../department/repositories/department.repository';
import { PrismaUserRepository } from '../../user/repositories/user.repository';
import { eventBus } from '../../../shared/events/eventBus';
import { asyncLocalStorage } from '../../../shared/logger';

export class AssetService {
  constructor(
    private readonly repo: PrismaAssetRepository,
    private readonly categoryRepo: PrismaAssetCategoryRepository,
    private readonly deptRepo: PrismaDepartmentRepository,
    private readonly userRepo: PrismaUserRepository
  ) {}

  async createAsset(data: CreateAssetDTO): Promise<AssetDomain> {
    const existingTag = await this.repo.findByTag(data.assetTag);
    if (existingTag)
      throw new AppError('Asset tag already exists', HTTP_STATUS.CONFLICT, 'TAG_EXISTS');

    if (data.serialNumber) {
      const existingSerial = await this.repo.findBySerial(data.serialNumber);
      if (existingSerial)
        throw new AppError('Serial number already exists', HTTP_STATUS.CONFLICT, 'SERIAL_EXISTS');
    }

    const category = await this.categoryRepo.findById(data.categoryId);
    if (!category)
      throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND, 'CATEGORY_NOT_FOUND');

    const dept = await this.deptRepo.findById(data.departmentId);
    if (!dept)
      throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND, 'DEPARTMENT_NOT_FOUND');

    if (data.assignedUserId) {
      const user = await this.userRepo.findById(data.assignedUserId);
      if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    const context = asyncLocalStorage.getStore();
    const actorId = context?.userId || 'SYSTEM';

    const asset = await this.repo.createWithTimeline(data, actorId, actorId === 'SYSTEM' ? 'SYSTEM' : 'USER');
    
    eventBus.publish('AssetPurchased', asset, actorId);
    
    return asset;
  }

  async getAsset(id: string): Promise<AssetDomain> {
    const asset = await this.repo.findById(id);
    if (!asset) throw new AppError('Asset not found', HTTP_STATUS.NOT_FOUND, 'ASSET_NOT_FOUND');
    return asset;
  }

  async getAllAssets(page: number = 1, limit: number = 20): Promise<{ data: AssetDomain[], total: number }> {
    const skip = (page - 1) * limit;
    return this.repo.findAllPaginated(skip, limit);
  }

  async updateAsset(id: string, data: UpdateAssetDTO): Promise<AssetDomain> {
    const asset = await this.repo.findById(id);
    if (!asset) throw new AppError('Asset not found', HTTP_STATUS.NOT_FOUND, 'ASSET_NOT_FOUND');

    if (data.assetTag && data.assetTag !== asset.assetTag) {
      const existingTag = await this.repo.findByTag(data.assetTag);
      if (existingTag)
        throw new AppError('Asset tag already exists', HTTP_STATUS.CONFLICT, 'TAG_EXISTS');
    }

    if (data.serialNumber && data.serialNumber !== asset.serialNumber) {
      const existingSerial = await this.repo.findBySerial(data.serialNumber);
      if (existingSerial)
        throw new AppError('Serial number already exists', HTTP_STATUS.CONFLICT, 'SERIAL_EXISTS');
    }

    if (data.categoryId) {
      const category = await this.categoryRepo.findById(data.categoryId);
      if (!category)
        throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND, 'CATEGORY_NOT_FOUND');
    }

    if (data.departmentId) {
      const dept = await this.deptRepo.findById(data.departmentId);
      if (!dept)
        throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND, 'DEPARTMENT_NOT_FOUND');
    }

    if (data.assignedUserId) {
      const user = await this.userRepo.findById(data.assignedUserId);
      if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    return this.repo.update(id, data);
  }

  async deleteAsset(id: string): Promise<void> {
    const asset = await this.repo.findById(id);
    if (!asset) throw new AppError('Asset not found', HTTP_STATUS.NOT_FOUND, 'ASSET_NOT_FOUND');
    await this.repo.delete(id);
  }
}
