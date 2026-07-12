"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDepartmentSchema = exports.createDepartmentSchema = void 0;
const zod_1 = require("zod");
exports.createDepartmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    parentDepartmentId: zod_1.z.string().uuid().optional(),
});
exports.updateDepartmentSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    parentDepartmentId: zod_1.z.string().uuid().nullable().optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
