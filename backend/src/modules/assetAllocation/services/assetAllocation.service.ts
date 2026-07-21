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
import { eventBus } from '../../../shared/events/eventBus';

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
    const allocation = await this.repo.allocateAsset(data, allocatedById);

    eventBus.publish('AssetAllocated', allocation, allocatedById);

    return allocation;
  }

  async returnAsset(data: ReturnAssetDTO, returnedById: string): Promise<AssetAllocationDomain> {
    const allocation = await this.repo.returnAsset(data, returnedById);
    eventBus.publish('AssetReturned', allocation, returnedById);
    return allocation;
  }

  async transferAsset(
    data: TransferAssetDTO,
    transferredById: string
  ): Promise<AssetAllocationDomain> {
    const user = await this.userRepo.findById(data.newAllocatedToId);
    if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');

    const allocation = await this.repo.transferAsset(data, transferredById);
    eventBus.publish('AssetTransferred', allocation, transferredById);
    return allocation;
  }

  async getHistory(assetId: string): Promise<AssetAllocationDomain[]> {
    return this.repo.getAllocationHistory(assetId);
  }
}
