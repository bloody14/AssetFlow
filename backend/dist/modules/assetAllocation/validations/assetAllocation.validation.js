"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferAssetSchema = exports.returnAssetSchema = exports.allocateAssetSchema = void 0;
const zod_1 = require("zod");
exports.allocateAssetSchema = zod_1.z.object({
    assetId: zod_1.z.string().uuid(),
    allocatedToId: zod_1.z.string().uuid(),
    notes: zod_1.z.string().optional(),
});
exports.returnAssetSchema = zod_1.z.object({
    assetId: zod_1.z.string().uuid(),
    notes: zod_1.z.string().optional(),
});
exports.transferAssetSchema = zod_1.z.object({
    assetId: zod_1.z.string().uuid(),
    newAllocatedToId: zod_1.z.string().uuid(),
    notes: zod_1.z.string().optional(),
});
