import { Request, Response } from 'express';
import { AssetService } from '../services/asset.service';
import { sendSuccess } from '../../../shared/response';

export class AssetController {
  constructor(private readonly service: AssetService) {}
  create = async (req: Request, res: Response) =>
    sendSuccess(res, 'Asset created', await this.service.createAsset(req.body));
  getAll = async (_req: Request, res: Response) =>
    sendSuccess(res, 'Assets retrieved', await this.service.getAllAssets());
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
