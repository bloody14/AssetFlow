import { PrismaReportingRepository } from '../repositories/reporting.repository';
import { DashboardSummaryDomain, AssetStatistic } from '../types/reporting.types';

export class ReportingService {
  constructor(private readonly repo: PrismaReportingRepository) {}

  async getDashboardSummary(): Promise<DashboardSummaryDomain> {
    return this.repo.getDashboardSummary();
  }

  async getAssetStatistics(): Promise<AssetStatistic[]> {
    return this.repo.getAssetStatistics();
  }
}
