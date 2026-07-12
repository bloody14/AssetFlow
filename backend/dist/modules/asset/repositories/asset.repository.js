"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAssetRepository = void 0;
const prisma_1 = require("../../../config/prisma");
class PrismaAssetRepository {
    mapToDomain(asset) {
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
    async create(data) {
        return this.mapToDomain(await prisma_1.prisma.asset.create({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: data,
        }));
    }
    async findById(id) {
        const asset = await prisma_1.prisma.asset.findUnique({ where: { id } });
        return asset ? this.mapToDomain(asset) : null;
    }
    async findByTag(assetTag) {
        const asset = await prisma_1.prisma.asset.findUnique({ where: { assetTag } });
        return asset ? this.mapToDomain(asset) : null;
    }
    async findBySerial(serialNumber) {
        const asset = await prisma_1.prisma.asset.findUnique({ where: { serialNumber } });
        return asset ? this.mapToDomain(asset) : null;
    }
    async findAll() {
        const assets = await prisma_1.prisma.asset.findMany();
        return assets.map((a) => this.mapToDomain(a));
    }
    async update(id, data) {
        return this.mapToDomain(await prisma_1.prisma.asset.update({
            where: { id },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: data,
        }));
    }
    async delete(id) {
        await prisma_1.prisma.asset.delete({ where: { id } });
    }
}
exports.PrismaAssetRepository = PrismaAssetRepository;
