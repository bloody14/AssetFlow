import { prisma } from '../../../config/prisma';
import { CreateAssetDTO, UpdateAssetDTO, AssetDomain } from '../types/asset.types';

export class PrismaAssetRepository {
  private mapToDomain(asset: import('@prisma/client').Asset): AssetDomain {
    return {
      id: asset.id,
      assetTag: asset.assetTag,
      serialNumber: asset.serialNumber,
      name: asset.name,
      description: asset.description,
      categoryId: asset.categoryId,
      departmentId: asset.departmentId,
      assignedUserId: asset.assignedUserId,
      status: asset.status,
      purchaseDate: asset.purchaseDate,
      purchaseCost: asset.purchaseCost,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    };
  }

  async create(data: CreateAssetDTO): Promise<AssetDomain> {
    return this.mapToDomain(
      await prisma.asset.create({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: data as any,
      })
    );
  }

  async findById(id: string): Promise<AssetDomain | null> {
    const asset = await prisma.asset.findUnique({ where: { id } });
    return asset ? this.mapToDomain(asset) : null;
  }

  async findByTag(assetTag: string): Promise<AssetDomain | null> {
    const asset = await prisma.asset.findUnique({ where: { assetTag } });
    return asset ? this.mapToDomain(asset) : null;
  }

  async findBySerial(serialNumber: string): Promise<AssetDomain | null> {
    const asset = await prisma.asset.findUnique({ where: { serialNumber } });
    return asset ? this.mapToDomain(asset) : null;
  }

  async findAll(): Promise<AssetDomain[]> {
    const assets = await prisma.asset.findMany();
    return assets.map((a) => this.mapToDomain(a));
  }

  async update(id: string, data: UpdateAssetDTO): Promise<AssetDomain> {
    return this.mapToDomain(
      await prisma.asset.update({
        where: { id },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: data as any,
      })
    );
  }

  async delete(id: string): Promise<void> {
    await prisma.asset.delete({ where: { id } });
  }
}
