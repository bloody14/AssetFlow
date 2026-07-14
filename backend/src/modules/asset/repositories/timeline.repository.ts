import { prisma } from '../../../config/prisma';
import { AssetTimeline } from '@prisma/client';

export type CreateTimelineDTO = {
  assetId: string;
  eventType: string;
  actorId: string;
  actorType: string;
  notes?: string;
};

export class PrismaTimelineRepository {
  async create(data: CreateTimelineDTO): Promise<AssetTimeline> {
    return prisma.assetTimeline.create({
      data,
    });
  }

  async findByAssetId(assetId: string, skip: number = 0, take: number = 20): Promise<{ data: AssetTimeline[], total: number }> {
    const [events, total] = await Promise.all([
      prisma.assetTimeline.findMany({
        where: { assetId, deletedAt: null },
        orderBy: { timestamp: 'desc' },
        skip,
        take,
      }),
      prisma.assetTimeline.count({ where: { assetId, deletedAt: null } }),
    ]);

    return { data: events, total };
  }
}
