import { Request, Response } from 'express';
import { AssetService } from '../services/asset.service';
import { sendSuccess, sendPaginatedSuccess } from '../../../shared/response';
import { paginationQuerySchema } from '../../../shared/pagination.validation';

export class AssetController {
  constructor(private readonly service: AssetService) {}
  create = async (req: Request, res: Response) =>
    sendSuccess(res, 'Asset created', await this.service.createAsset(req.body));
  getAll = async (req: Request, res: Response) => {
    const { page, limit } = paginationQuerySchema.parse(req.query);
    const { data, total } = await this.service.getAllAssets(page, limit);
    return sendPaginatedSuccess(res, 'Assets retrieved', data, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  };
  getById = async (req: Request, res: Response) =>
    sendSuccess(res, 'Asset retrieved', await this.service.getAsset(req.params.id as string));
  update = async (req: Request, res: Response) =>
    sendSuccess(
      res,
      'Asset updated',
      await this.service.updateAsset(req.params.id as string, req.body)
    );
  delete = async (req: Request, res: Response) => {
    await this.service.deleteAsset(req.params.id as string);
    return sendSuccess(res, 'Asset deleted');
  };
}
