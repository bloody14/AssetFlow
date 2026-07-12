"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
class BookingService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async createBooking(data, bookedById) {
        return this.repo.createBooking(data, bookedById);
    }
    async approveBooking(id, approvedById, notes) {
        return this.repo.updateBookingStatus(id, 'APPROVED', approvedById, notes);
    }
    async rejectBooking(id, rejectedById, notes) {
        return this.repo.updateBookingStatus(id, 'REJECTED', rejectedById, notes);
    }
    async cancelBooking(id, cancelledById, notes) {
        return this.repo.updateBookingStatus(id, 'CANCELLED', cancelledById, notes);
    }
    async completeBooking(id, completedById, notes) {
        return this.repo.updateBookingStatus(id, 'COMPLETED', completedById, notes);
    }
    async getCalendar(assetId, month, year) {
        return this.repo.getCalendar(assetId, month, year);
    }
    async getHistory(assetId) {
        return this.repo.getHistory(assetId);
    }
}
exports.BookingService = BookingService;
