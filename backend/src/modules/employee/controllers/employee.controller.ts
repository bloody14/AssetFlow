import { Request, Response } from 'express';
import { EmployeeService } from '../services/employee.service';
import { sendSuccess } from '../../../shared/response';

export class EmployeeController {
  constructor(private readonly service: EmployeeService) {}

  create = async (req: Request, res: Response) => {
    const employee = await this.service.createEmployee(req.body);
    return sendSuccess(res, 'Employee created successfully', employee);
  };

  getAll = async (_req: Request, res: Response) => {
    const employees = await this.service.getAllEmployees();
    return sendSuccess(res, 'Employees retrieved successfully', employees);
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
