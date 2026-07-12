"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAssetSchema = exports.createAssetSchema = void 0;
const zod_1 = require("zod");
exports.createAssetSchema = zod_1.z.object({
    assetTag: zod_1.z.string().min(2),
    serialNumber: zod_1.z.string().nullable().optional(),
    name: zod_1.z.string().min(2),
    description: zod_1.z.string().nullable().optional(),
    categoryId: zod_1.z.string().uuid(),
    departmentId: zod_1.z.string().uuid(),
    assignedUserId: zod_1.z.string().uuid().nullable().optional(),
    status: zod_1.z.enum(['AVAILABLE', 'ASSIGNED', 'IN_MAINTENANCE', 'RETIRED', 'LOST']).optional(),
    purchaseDate: zod_1.z.string().datetime().nullable().optional(),
    purchaseCost: zod_1.z.number().min(0).nullable().optional(),
});
exports.updateAssetSchema = zod_1.z.object({
    assetTag: zod_1.z.string().min(2).optional(),
    serialNumber: zod_1.z.string().nullable().optional(),
    name: zod_1.z.string().min(2).optional(),
    description: zod_1.z.string().nullable().optional(),
    categoryId: zod_1.z.string().uuid().optional(),
    departmentId: zod_1.z.string().uuid().optional(),
    assignedUserId: zod_1.z.string().uuid().nullable().optional(),
    status: zod_1.z.enum(['AVAILABLE', 'ASSIGNED', 'IN_MAINTENANCE', 'RETIRED', 'LOST']).optional(),
    purchaseDate: zod_1.z.string().datetime().nullable().optional(),
    purchaseCost: zod_1.z.number().min(0).nullable().optional(),
});
