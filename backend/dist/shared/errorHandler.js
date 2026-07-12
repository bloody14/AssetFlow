"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const appError_1 = require("./appError");
const response_1 = require("./response");
const httpStatus_1 = require("../constants/httpStatus");
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof appError_1.AppError) {
        return (0, response_1.sendError)(res, err.statusCode, err.code, err.message, err.details);
    }
    console.error('[Unhandled Error]', err);
    return (0, response_1.sendError)(res, httpStatus_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred');
};
exports.errorHandler = errorHandler;
