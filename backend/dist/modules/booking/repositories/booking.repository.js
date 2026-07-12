"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaBookingRepository = void 0;
const prisma_1 = require("../../../config/prisma");
const appError_1 = require("../../../shared/appError");
const httpStatus_1 = require("../../../constants/httpStatus");
class PrismaBookingRepository {
    mapToDomain(booking) {
        return {
            id: booking.id,
            assetId: booking.assetId,
            bookedById: booking.bookedById,
            approvedById: booking.approvedById,
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: booking.status,
            notes: booking.notes,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
        };
    }
    async checkConflict(assetId, startTime, endTime) {
        const conflict = await prisma_1.prisma.resourceBooking.findFirst({
            where: {
                assetId,
                status: { in: ['PENDING', 'APPROVED'] },
                OR: [{ startTime: { lt: endTime }, endTime: { gt: startTime } }],
            },
        });
        return !!conflict;
    }
    async createBooking(data, bookedById) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const asset = await tx.asset.findUnique({ where: { id: data.assetId } });
            if (!asset)
                throw new appError_1.AppError('Asset not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'ASSET_NOT_FOUND');
            if (['IN_MAINTENANCE', 'RETIRED', 'LOST'].includes(asset.status)) {
                throw new appError_1.AppError('Asset is not available for booking', httpStatus_1.HTTP_STATUS.CONFLICT, 'ASSET_UNAVAILABLE');
            }
            const sTime = new Date(data.startTime);
            const eTime = new Date(data.endTime);
            const conflict = await tx.resourceBooking.findFirst({
                where: {
                    assetId: data.assetId,
                    status: { in: ['PENDING', 'APPROVED'] },
                    OR: [{ startTime: { lt: eTime }, endTime: { gt: sTime } }],
                },
            });
            if (conflict)
                throw new appError_1.AppError('Overlapping booking exists', httpStatus_1.HTTP_STATUS.CONFLICT, 'BOOKING_CONFLICT');
            const booking = await tx.resourceBooking.create({
                data: {
                    assetId: data.assetId,
                    bookedById,
                    startTime: sTime,
                    endTime: eTime,
                    notes: data.notes,
                    status: 'PENDING',
                },
            });
            await tx.auditLog.create({
                data: {
                    entityType: 'BOOKING',
                    entityId: booking.id,
                    action: 'CREATE',
                    userId: bookedById,
                    details: { startTime: sTime, endTime: eTime, assetId: data.assetId },
                },
            });
            return booking;
        });
        return this.mapToDomain(result);
    }
    async updateBookingStatus(id, status, actionUserId, notes) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const booking = await tx.resourceBooking.findUnique({ where: { id } });
            if (!booking)
                throw new appError_1.AppError('Booking not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'BOOKING_NOT_FOUND');
            const updated = await tx.resourceBooking.update({
                where: { id },
                data: {
                    status,
                    approvedById: ['APPROVED', 'REJECTED'].includes(status)
                        ? actionUserId
                        : booking.approvedById,
                    notes: notes ? `${booking.notes || ''}\n[${status}]: ${notes}` : booking.notes,
                },
            });
            await tx.auditLog.create({
                data: {
                    entityType: 'BOOKING',
                    entityId: booking.id,
                    action: status,
                    userId: actionUserId,
                    details: { previousStatus: booking.status, newStatus: status, notes },
                },
            });
            return updated;
        });
        return this.mapToDomain(result);
    }
    async getCalendar(assetId, month, year) {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
        const bookings = await prisma_1.prisma.resourceBooking.findMany({
            where: {
                assetId,
                status: { in: ['PENDING', 'APPROVED', 'COMPLETED'] },
                OR: [{ startTime: { lte: endOfMonth }, endTime: { gte: startOfMonth } }],
            },
            orderBy: { startTime: 'asc' },
        });
        return bookings.map((b) => this.mapToDomain(b));
    }
    async getHistory(assetId) {
        const history = await prisma_1.prisma.resourceBooking.findMany({
            where: { assetId },
            orderBy: { createdAt: 'desc' },
        });
        return history.map((h) => this.mapToDomain(h));
    }
}
exports.PrismaBookingRepository = PrismaBookingRepository;
