import { prisma } from '../../../config/prisma';
import { DashboardSummaryDomain, AssetStatistic } from '../types/reporting.types';

export class PrismaReportingRepository {
  async getDashboardSummary(): Promise<DashboardSummaryDomain> {
    const totalAssets = await prisma.asset.count();
    const availableAssets = await prisma.asset.count({ where: { status: 'AVAILABLE' } });
    const assignedAssets = await prisma.asset.count({ where: { status: 'ASSIGNED' } });
    const maintenanceAssets = await prisma.asset.count({ where: { status: 'IN_MAINTENANCE' } });

    const activeAllocations = await prisma.assetAllocation.count({ where: { status: 'ACTIVE' } });
    const activeBookings = await prisma.resourceBooking.count({ where: { status: 'APPROVED' } });
    const pendingMaintenance = await prisma.maintenanceRequest.count({
      where: { status: 'PENDING' },
    });

    const recentActivity = await prisma.auditLog.findMany({
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

  async getAssetStatistics(): Promise<AssetStatistic[]> {
    const byCategory = await prisma.asset.groupBy({
      by: ['categoryId'],
      _count: { _all: true },
    });

    const categories = await prisma.assetCategory.findMany({
      where: { id: { in: byCategory.map((c) => c.categoryId) } },
    });

    return byCategory.map((c) => ({
      categoryName: categories.find((cat) => cat.id === c.categoryId)?.name || 'Unknown',
      count: c._count._all,
    }));
  }
}
