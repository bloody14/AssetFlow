"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const response_1 = require("../../../shared/response");
const appError_1 = require("../../../shared/appError");
const httpStatus_1 = require("../../../constants/httpStatus");
class BookingController {
    service;
    constructor(service) {
        this.service = service;
    }
    create = async (req, res) => {
        if (!req.user)
            throw new appError_1.AppError('Unauthorized', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
        const result = await this.service.createBooking(req.body, req.user.id);
        return (0, response_1.sendSuccess)(res, 'Booking created successfully', result);
    };
    approve = async (req, res) => {
        if (!req.user)
            throw new appError_1.AppError('Unauthorized', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
        const result = await this.service.approveBooking(req.params.id, req.user.id, req.body.notes);
        return (0, response_1.sendSuccess)(res, 'Booking approved', result);
    };
    reject = async (req, res) => {
        if (!req.user)
            throw new appError_1.AppError('Unauthorized', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
        const result = await this.service.rejectBooking(req.params.id, req.user.id, req.body.notes);
        return (0, response_1.sendSuccess)(res, 'Booking rejected', result);
    };
    cancel = async (req, res) => {
        if (!req.user)
            throw new appError_1.AppError('Unauthorized', httpStatus_1.HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
        const result = await this.service.cancelBooking(req.params.id, req.user.id, req.body.notes);
        return (0, response_1.sendSuccess)(res, 'Booking cancelled', result);
    };
    calendar = async (req, res) => {
        const assetId = req.query.assetId;
        const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;
        const year = parseInt(req.query.year, 10) || new Date().getFullYear();
        if (!assetId)
            throw new appError_1.AppError('assetId is required', httpStatus_1.HTTP_STATUS.BAD_REQUEST, 'BAD_REQUEST');
        const result = await this.service.getCalendar(assetId, month, year);
        return (0, response_1.sendSuccess)(res, 'Calendar retrieved', result);
    };
    history = async (req, res) => {
        const result = await this.service.getHistory(req.params.assetId);
        return (0, response_1.sendSuccess)(res, 'Booking history retrieved', result);
    };
}
exports.BookingController = BookingController;
