import { prisma } from '../../../config/prisma';
import { BookingDomain, CreateBookingDTO } from '../types/booking.types';
import { AppError } from '../../../shared/appError';
import { HTTP_STATUS } from '../../../constants/httpStatus';

export class PrismaBookingRepository {
  private mapToDomain(booking: import('@prisma/client').ResourceBooking): BookingDomain {
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

  async checkConflict(assetId: string, startTime: Date, endTime: Date): Promise<boolean> {
    const conflict = await prisma.resourceBooking.findFirst({
      where: {
        assetId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [{ startTime: { lt: endTime }, endTime: { gt: startTime } }],
      },
    });
    return !!conflict;
  }

  async createBooking(data: CreateBookingDTO, bookedById: string): Promise<BookingDomain> {
    const result = await prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({ where: { id: data.assetId } });
      if (!asset) throw new AppError('Asset not found', HTTP_STATUS.NOT_FOUND, 'ASSET_NOT_FOUND');
      if (['IN_MAINTENANCE', 'RETIRED', 'LOST'].includes(asset.status)) {
        throw new AppError(
          'Asset is not available for booking',
          HTTP_STATUS.CONFLICT,
          'ASSET_UNAVAILABLE'
        );
      }

      const activeAllocation = await tx.assetAllocation.findFirst({
        where: { assetId: data.assetId, status: 'ACTIVE' },
      });
      if (activeAllocation) {
        throw new AppError(
          'Asset is currently allocated and cannot be booked',
          HTTP_STATUS.CONFLICT,
          'ASSET_ALLOCATED'
        );
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
        throw new AppError('Overlapping booking exists', HTTP_STATUS.CONFLICT, 'BOOKING_CONFLICT');

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

  async updateBookingStatus(
    id: string,
    status: import('@prisma/client').BookingStatus,
    actionUserId: string,
    notes?: string
  ): Promise<BookingDomain> {
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.resourceBooking.findUnique({ where: { id } });
      if (!booking)
        throw new AppError('Booking not found', HTTP_STATUS.NOT_FOUND, 'BOOKING_NOT_FOUND');

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

      if (status === 'APPROVED') {
        await tx.assetTimeline.create({
          data: {
            assetId: booking.assetId,
            eventType: 'BOOKED',
            actorId: actionUserId,
            actorType: 'USER',
            notes: `Booking approved for period ${booking.startTime.toISOString()} to ${booking.endTime.toISOString()}. ${notes || ''}`,
          },
        });
      }

      return updated;
    });

    return this.mapToDomain(result);
  }

  async getCalendar(assetId: string, month: number, year: number): Promise<BookingDomain[]> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const bookings = await prisma.resourceBooking.findMany({
      where: {
        assetId,
        status: { in: ['PENDING', 'APPROVED', 'COMPLETED'] },
        OR: [{ startTime: { lte: endOfMonth }, endTime: { gte: startOfMonth } }],
      },
      orderBy: { startTime: 'asc' },
    });
    return bookings.map((b) => this.mapToDomain(b));
  }

  async getHistory(assetId: string): Promise<BookingDomain[]> {
    const history = await prisma.resourceBooking.findMany({
      where: { assetId },
      orderBy: { createdAt: 'desc' },
    });
    return history.map((h) => this.mapToDomain(h));
  }
}
