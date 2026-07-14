import { Request, Response } from 'express';
import { DepartmentService } from '../services/department.service';
import { sendSuccess, sendPaginatedSuccess } from '../../../shared/response';
import { paginationQuerySchema } from '../../../shared/pagination.validation';

export class DepartmentController {
  constructor(private readonly service: DepartmentService) {}

  create = async (req: Request, res: Response) => {
    const dept = await this.service.createDepartment(req.body);
    return sendSuccess(res, 'Department created successfully', dept);
  };

  getAll = async (req: Request, res: Response) => {
    const { page, limit } = paginationQuerySchema.parse(req.query);
    const { data, total } = await this.service.getAllDepartments(page, limit);
    return sendPaginatedSuccess(res, 'Departments retrieved successfully', data, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  };

  getById = async (req: Request, res: Response) => {
    const dept = await this.service.getDepartment(req.params.id as string);
    return sendSuccess(res, 'Department retrieved successfully', dept);
  };

  update = async (req: Request, res: Response) => {
    const dept = await this.service.updateDepartment(req.params.id as string, req.body);
    return sendSuccess(res, 'Department updated successfully', dept);
  };

  delete = async (req: Request, res: Response) => {
    await this.service.deleteDepartment(req.params.id as string);
    return sendSuccess(res, 'Department deleted successfully');
  };
}
