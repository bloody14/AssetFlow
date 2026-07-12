import { Request, Response } from 'express';
import { MaintenanceService } from '../services/maintenance.service';
import { sendSuccess } from '../../../shared/response';
import { AppError } from '../../../shared/appError';
import { HTTP_STATUS } from '../../../constants/httpStatus';

export class MaintenanceController {
  constructor(private readonly service: MaintenanceService) {}

  create = async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
    const result = await this.service.createRequest(req.body, req.user.id);
    return sendSuccess(res, 'Maintenance request created successfully', result);
  };

  assign = async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
    const result = await this.service.assignTechnician(
      req.params.id as string,
      req.body,
      req.user.id
    );
    return sendSuccess(res, 'Technician assigned successfully', result);
  };

  updateStatus = async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
    const result = await this.service.updateStatus(
      req.params.id as string,
      req.body.status,
      req.user.id
    );
    return sendSuccess(res, 'Maintenance status updated', result);
  };

  complete = async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
    const result = await this.service.completeMaintenance(
      req.params.id as string,
      req.body,
      req.user.id
    );
    return sendSuccess(res, 'Maintenance completed successfully', result);
  };

  history = async (req: Request, res: Response) => {
    const result = await this.service.getHistory(req.params.assetId as string);
    return sendSuccess(res, 'Maintenance history retrieved', result);
  };
}
