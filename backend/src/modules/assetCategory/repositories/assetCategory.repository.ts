import { prisma } from '../../../config/prisma';
import {
  CreateAssetCategoryDTO,
  UpdateAssetCategoryDTO,
  AssetCategoryDomain,
} from '../types/assetCategory.types';

export class PrismaAssetCategoryRepository {
  private mapToDomain(cat: import('@prisma/client').AssetCategory): AssetCategoryDomain {
    return {
      id: cat.id,
      name: cat.name,
      description: cat.description,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    };
  }
  async create(data: CreateAssetCategoryDTO): Promise<AssetCategoryDomain> {
    return this.mapToDomain(await prisma.assetCategory.create({ data }));
  }
  async findById(id: string): Promise<AssetCategoryDomain | null> {
    const cat = await prisma.assetCategory.findUnique({ where: { id } });
    return cat ? this.mapToDomain(cat) : null;
  }
  async findByName(name: string): Promise<AssetCategoryDomain | null> {
    const cat = await prisma.assetCategory.findUnique({ where: { name } });
    return cat ? this.mapToDomain(cat) : null;
  }
  async findAll(): Promise<AssetCategoryDomain[]> {
    const cats = await prisma.assetCategory.findMany();
    return cats.map((c) => this.mapToDomain(c));
  }
  async update(id: string, data: UpdateAssetCategoryDTO): Promise<AssetCategoryDomain> {
    return this.mapToDomain(await prisma.assetCategory.update({ where: { id }, data }));
  }
  async delete(id: string): Promise<void> {
    await prisma.assetCategory.delete({ where: { id } });
  }
  async hasAssets(id: string): Promise<boolean> {
    const count = await prisma.asset.count({ where: { categoryId: id } });
    return count > 0;
  }
}
