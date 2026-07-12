"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaReportingRepository = void 0;
const prisma_1 = require("../../../config/prisma");
class PrismaReportingRepository {
    async getDashboardSummary() {
        const totalAssets = await prisma_1.prisma.asset.count();
        const availableAssets = await prisma_1.prisma.asset.count({ where: { status: 'AVAILABLE' } });
        const assignedAssets = await prisma_1.prisma.asset.count({ where: { status: 'ASSIGNED' } });
        const maintenanceAssets = await prisma_1.prisma.asset.count({ where: { status: 'IN_MAINTENANCE' } });
        const activeAllocations = await prisma_1.prisma.assetAllocation.count({ where: { status: 'ACTIVE' } });
        const activeBookings = await prisma_1.prisma.resourceBooking.count({ where: { status: 'APPROVED' } });
        const pendingMaintenance = await prisma_1.prisma.maintenanceRequest.count({
            where: { status: 'PENDING' },
        });
        const recentActivity = await prisma_1.prisma.auditLog.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } },
        });
        return {
            totalAssets,
            availableAssets,
            assignedAssets,
            maintenanceAssets,
            activeAllocations,
            activeBookings,
            pendingMaintenance,
            recentActivity,
        };
    }
    async getAssetStatistics() {
        const byCategory = await prisma_1.prisma.asset.groupBy({
            by: ['categoryId'],
            _count: { _all: true },
        });
        const categories = await prisma_1.prisma.assetCategory.findMany({
            where: { id: { in: byCategory.map((c) => c.categoryId) } },
        });
        return byCategory.map((c) => ({
            categoryName: categories.find((cat) => cat.id === c.categoryId)?.name || 'Unknown',
            count: c._count._all,
        }));
    }
}
exports.PrismaReportingRepository = PrismaReportingRepository;
