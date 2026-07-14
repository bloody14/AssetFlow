import { PrismaTimelineRepository, CreateTimelineDTO } from '../repositories/timeline.repository';
import { AssetTimeline } from '@prisma/client';

export class TimelineService {
  constructor(private readonly repo: PrismaTimelineRepository) {}

  async createEvent(data: CreateTimelineDTO): Promise<AssetTimeline> {
    return this.repo.create(data);
  }

  async getAssetTimeline(assetId: string, page: number = 1, limit: number = 20): Promise<{ data: AssetTimeline[], total: number }> {
    const skip = (page - 1) * limit;
    return this.repo.findByAssetId(assetId, skip, limit);
  }
}
