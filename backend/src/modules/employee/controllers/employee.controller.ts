import { Request, Response } from 'express';
import { EmployeeService } from '../services/employee.service';
import { sendSuccess, sendPaginatedSuccess } from '../../../shared/response';
import { paginationQuerySchema } from '../../../shared/pagination.validation';

export class EmployeeController {
  constructor(private readonly service: EmployeeService) {}

  create = async (req: Request, res: Response) => {
    const employee = await this.service.createEmployee(req.body);
    return sendSuccess(res, 'Employee created successfully', employee);
  };

  getAll = async (req: Request, res: Response) => {
    const { page, limit } = paginationQuerySchema.parse(req.query);
    const { data, total } = await this.service.getAllEmployees(page, limit);
    return sendPaginatedSuccess(res, 'Employees retrieved successfully', data, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  };

  getById = async (req: Request, res: Response) => {
    const employee = await this.service.getEmployee(req.params.id as string);
    return sendSuccess(res, 'Employee retrieved successfully', employee);
  };

  update = async (req: Request, res: Response) => {
    const employee = await this.service.updateEmployee(req.params.id as string, req.body);
    return sendSuccess(res, 'Employee updated successfully', employee);
  };

  delete = async (req: Request, res: Response) => {
    await this.service.deleteEmployee(req.params.id as string);
    return sendSuccess(res, 'Employee deleted successfully');
  };
}
