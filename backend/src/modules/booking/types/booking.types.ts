export interface CreateBookingDTO {
  assetId: string;
  startTime: string | Date;
  endTime: string | Date;
  notes?: string;
}

export interface BookingDomain {
  id: string;
  assetId: string;
  bookedById: string;
  approvedById: string | null;
  startTime: Date;
  endTime: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
