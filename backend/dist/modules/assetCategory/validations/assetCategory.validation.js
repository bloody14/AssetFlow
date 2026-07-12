"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAssetCategorySchema = exports.createAssetCategorySchema = void 0;
const zod_1 = require("zod");
exports.createAssetCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    description: zod_1.z.string().optional(),
});
exports.updateAssetCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    description: zod_1.z.string().nullable().optional(),
});
