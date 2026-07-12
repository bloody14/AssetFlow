"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const appError_1 = require("./appError");
const httpStatus_1 = require("../constants/httpStatus");
const validateRequest = (schema) => {
    return (req, _res, next) => {
        try {
            const validatedData = schema.parse(req.body);
            req.body = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                const zodError = error;
                next(new appError_1.AppError('Invalid request data', httpStatus_1.HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR', zodError.issues));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validateRequest = validateRequest;
