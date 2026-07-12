import { Request, Response } from 'express';
import { DepartmentService } from '../services/department.service';
import { sendSuccess } from '../../../shared/response';

export class DepartmentController {
  constructor(private readonly service: DepartmentService) {}

  create = async (req: Request, res: Response) => {
    const dept = await this.service.createDepartment(req.body);
    return sendSuccess(res, 'Department created successfully', dept);
  };

  getAll = async (_req: Request, res: Response) => {
    const depts = await this.service.getAllDepartments();
    return sendSuccess(res, 'Departments retrieved successfully', depts);
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
