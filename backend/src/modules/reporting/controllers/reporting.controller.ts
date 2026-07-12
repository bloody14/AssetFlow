import { Request, Response } from 'express';
import { ReportingService } from '../services/reporting.service';
import { sendSuccess } from '../../../shared/response';

export class ReportingController {
  constructor(private readonly service: ReportingService) {}

  getSummary = async (_req: Request, res: Response) => {
    const data = await this.service.getDashboardSummary();
    return sendSuccess(res, 'Dashboard summary retrieved successfully', data);
  };

  getAssetStats = async (_req: Request, res: Response) => {
    const data = await this.service.getAssetStatistics();
    return sendSuccess(res, 'Asset statistics retrieved successfully', data);
  };
}
