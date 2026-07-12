"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendNoContent = exports.sendCreated = exports.sendSuccess = void 0;
const httpStatus_1 = require("../constants/httpStatus");
const sendSuccess = (res, message, data) => {
    return res.status(httpStatus_1.HTTP_STATUS.OK).json({ success: true, message, data });
};
exports.sendSuccess = sendSuccess;
const sendCreated = (res, message, data) => {
    return res.status(httpStatus_1.HTTP_STATUS.CREATED).json({ success: true, message, data });
};
exports.sendCreated = sendCreated;
const sendNoContent = (res) => {
    return res.status(httpStatus_1.HTTP_STATUS.NO_CONTENT).send();
};
exports.sendNoContent = sendNoContent;
const sendError = (res, statusCode, code, message, details) => {
    return res.status(statusCode).json({
        success: false,
        error: { code, message, details: details || null },
    });
};
exports.sendError = sendError;
