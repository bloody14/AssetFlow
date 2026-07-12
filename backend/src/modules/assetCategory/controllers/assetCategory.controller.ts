import { Request, Response } from 'express';
import { AssetCategoryService } from '../services/assetCategory.service';
import { sendSuccess } from '../../../shared/response';

export class AssetCategoryController {
  constructor(private readonly service: AssetCategoryService) {}
  create = async (req: Request, res: Response) =>
    sendSuccess(res, 'Category created', await this.service.createCategory(req.body));
  getAll = async (_req: Request, res: Response) =>
    sendSuccess(res, 'Categories retrieved', await this.service.getAllCategories());
  getById = async (req: Request, res: Response) =>
    sendSuccess(res, 'Category retrieved', await this.service.getCategory(req.params.id as string));
  update = async (req: Request, res: Response) =>
    sendSuccess(
      res,
      'Category updated',
      await this.service.updateCategory(req.params.id as string, req.body)
    );
  delete = async (req: Request, res: Response) => {
    await this.service.deleteCategory(req.params.id as string);
    return sendSuccess(res, 'Category deleted');
  };
}
