"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeMaintenanceSchema = exports.updateMaintenanceStatusSchema = exports.assignTechnicianSchema = exports.createMaintenanceSchema = void 0;
const zod_1 = require("zod");
exports.createMaintenanceSchema = zod_1.z.object({
    assetId: zod_1.z.string().uuid(),
    issue: zod_1.z.string().min(5),
});
exports.assignTechnicianSchema = zod_1.z
    .object({
    technicianId: zod_1.z.string().uuid(),
    scheduledStart: zod_1.z.string().datetime().optional(),
    scheduledEnd: zod_1.z.string().datetime().optional(),
})
    .refine((data) => {
    if (data.scheduledStart && data.scheduledEnd) {
        return new Date(data.scheduledStart) < new Date(data.scheduledEnd);
    }
    return true;
}, {
    message: 'scheduledStart must be before scheduledEnd',
    path: ['scheduledStart'],
});
exports.updateMaintenanceStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'CANCELLED']),
});
exports.completeMaintenanceSchema = zod_1.z.object({
    resolution: zod_1.z.string().min(5),
    cost: zod_1.z.number().nonnegative().optional(),
});
