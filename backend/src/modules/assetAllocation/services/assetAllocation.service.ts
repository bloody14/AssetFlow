import { PrismaAssetAllocationRepository } from '../repositories/assetAllocation.repository';
import {
  AllocateAssetDTO,
  ReturnAssetDTO,
  TransferAssetDTO,
  AssetAllocationDomain,
} from '../types/assetAllocation.types';
import { PrismaUserRepository } from '../../user/repositories/user.repository';
import { AppError } from '../../../shared/appError';
import { HTTP_STATUS } from '../../../constants/httpStatus';

export class AssetAllocationService {
  constructor(
    private readonly repo: PrismaAssetAllocationRepository,
    private readonly userRepo: PrismaUserRepository
  ) {}

  async allocateAsset(
    data: AllocateAssetDTO,
    allocatedById: string
  ): Promise<AssetAllocationDomain> {
    const user = await this.userRepo.findById(data.allocatedToId);
    if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    return this.repo.allocateAsset(data, allocatedById);
  }

  async returnAsset(data: ReturnAssetDTO, returnedById: string): Promise<AssetAllocationDomain> {
    return this.repo.returnAsset(data, returnedById);
  }

  async transferAsset(
    data: TransferAssetDTO,
    transferredById: string
  ): Promise<AssetAllocationDomain> {
    const user = await this.userRepo.findById(data.newAllocatedToId);
    if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    return this.repo.transferAsset(data, transferredById);
  }

  async getHistory(assetId: string): Promise<AssetAllocationDomain[]> {
    return this.repo.getAllocationHistory(assetId);
  }
}
