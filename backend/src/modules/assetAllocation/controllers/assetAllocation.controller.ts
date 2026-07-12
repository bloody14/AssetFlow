import { Request, Response } from 'express';
import { AssetAllocationService } from '../services/assetAllocation.service';
import { sendSuccess } from '../../../shared/response';
import { AppError } from '../../../shared/appError';
import { HTTP_STATUS } from '../../../constants/httpStatus';

export class AssetAllocationController {
  constructor(private readonly service: AssetAllocationService) {}

  allocate = async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
    const result = await this.service.allocateAsset(req.body, req.user.id);
    return sendSuccess(res, 'Asset allocated successfully', result);
  };

  returnAsset = async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
    const result = await this.service.returnAsset(req.body, req.user.id);
    return sendSuccess(res, 'Asset returned successfully', result);
  };

  transfer = async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
    const result = await this.service.transferAsset(req.body, req.user.id);
    return sendSuccess(res, 'Asset transferred successfully', result);
  };

  getHistory = async (req: Request, res: Response) => {
    const result = await this.service.getHistory(req.params.assetId as string);
    return sendSuccess(res, 'Asset allocation history retrieved successfully', result);
  };
}
