"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAssetCategoryRepository = void 0;
const prisma_1 = require("../../../config/prisma");
class PrismaAssetCategoryRepository {
    mapToDomain(cat) {
        return {
            id: cat.id,
            name: cat.name,
            description: cat.description,
            createdAt: cat.createdAt,
            updatedAt: cat.updatedAt,
        };
    }
    async create(data) {
        return this.mapToDomain(await prisma_1.prisma.assetCategory.create({ data }));
    }
    async findById(id) {
        const cat = await prisma_1.prisma.assetCategory.findUnique({ where: { id } });
        return cat ? this.mapToDomain(cat) : null;
    }
    async findByName(name) {
        const cat = await prisma_1.prisma.assetCategory.findUnique({ where: { name } });
        return cat ? this.mapToDomain(cat) : null;
    }
    async findAll() {
        const cats = await prisma_1.prisma.assetCategory.findMany();
        return cats.map((c) => this.mapToDomain(c));
    }
    async update(id, data) {
        return this.mapToDomain(await prisma_1.prisma.assetCategory.update({ where: { id }, data }));
    }
    async delete(id) {
        await prisma_1.prisma.assetCategory.delete({ where: { id } });
    }
    async hasAssets(id) {
        const count = await prisma_1.prisma.asset.count({ where: { categoryId: id } });
        return count > 0;
    }
}
exports.PrismaAssetCategoryRepository = PrismaAssetCategoryRepository;
