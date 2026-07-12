"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatusSchema = exports.createBookingSchema = void 0;
const zod_1 = require("zod");
exports.createBookingSchema = zod_1.z
    .object({
    assetId: zod_1.z.string().uuid(),
    startTime: zod_1.z.string().datetime(),
    endTime: zod_1.z.string().datetime(),
    notes: zod_1.z.string().optional(),
})
    .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: 'startTime must be before endTime',
    path: ['startTime'],
});
exports.updateBookingStatusSchema = zod_1.z.object({
    notes: zod_1.z.string().optional(),
});
