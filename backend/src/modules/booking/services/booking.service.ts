import { PrismaBookingRepository } from '../repositories/booking.repository';
import { CreateBookingDTO, BookingDomain } from '../types/booking.types';
import { eventBus } from '../../../shared/events/eventBus';

export class BookingService {
  constructor(private readonly repo: PrismaBookingRepository) {}

  async createBooking(data: CreateBookingDTO, bookedById: string): Promise<BookingDomain> {
    return this.repo.createBooking(data, bookedById);
  }

  async approveBooking(id: string, approvedById: string, notes?: string): Promise<BookingDomain> {
    const booking = await this.repo.updateBookingStatus(id, 'APPROVED', approvedById, notes);
    eventBus.publish('BookingApproved', booking, approvedById);
    return booking;
  }

  async rejectBooking(id: string, rejectedById: string, notes?: string): Promise<BookingDomain> {
    return this.repo.updateBookingStatus(id, 'REJECTED', rejectedById, notes);
  }

  async cancelBooking(id: string, cancelledById: string, notes?: string): Promise<BookingDomain> {
    return this.repo.updateBookingStatus(id, 'CANCELLED', cancelledById, notes);
  }

  async completeBooking(id: string, completedById: string, notes?: string): Promise<BookingDomain> {
    return this.repo.updateBookingStatus(id, 'COMPLETED', completedById, notes);
  }

  async getCalendar(assetId: string, month: number, year: number): Promise<BookingDomain[]> {
    return this.repo.getCalendar(assetId, month, year);
  }

  async getHistory(assetId: string): Promise<BookingDomain[]> {
    return this.repo.getHistory(assetId);
  }
}
