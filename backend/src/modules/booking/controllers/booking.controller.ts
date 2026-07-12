import { Request, Response } from 'express';
import { BookingService } from '../services/booking.service';
import { sendSuccess } from '../../../shared/response';
import { AppError } from '../../../shared/appError';
import { HTTP_STATUS } from '../../../constants/httpStatus';

export class BookingController {
  constructor(private readonly service: BookingService) {}

  create = async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
    const result = await this.service.createBooking(req.body, req.user.id);
    return sendSuccess(res, 'Booking created successfully', result);
  };

  approve = async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
    const result = await this.service.approveBooking(
      req.params.id as string,
      req.user.id,
      req.body.notes
    );
    return sendSuccess(res, 'Booking approved', result);
  };

  reject = async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
    const result = await this.service.rejectBooking(
      req.params.id as string,
      req.user.id,
      req.body.notes
    );
    return sendSuccess(res, 'Booking rejected', result);
  };

  cancel = async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
    const result = await this.service.cancelBooking(
      req.params.id as string,
      req.user.id,
      req.body.notes
    );
    return sendSuccess(res, 'Booking cancelled', result);
  };

  calendar = async (req: Request, res: Response) => {
    const assetId = req.query.assetId as string;
    const month = parseInt(req.query.month as string, 10) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();

    if (!assetId) throw new AppError('assetId is required', HTTP_STATUS.BAD_REQUEST, 'BAD_REQUEST');
    const result = await this.service.getCalendar(assetId, month, year);
    return sendSuccess(res, 'Calendar retrieved', result);
  };

  history = async (req: Request, res: Response) => {
    const result = await this.service.getHistory(req.params.assetId as string);
    return sendSuccess(res, 'Booking history retrieved', result);
  };
}
