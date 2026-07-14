export interface CreateMaintenanceDTO {
  assetId: string;
  issue: string;
  attachments?: Record<string, unknown> | null;
}

export interface AssignTechnicianDTO {
  technicianId: string;
  scheduledStart?: string | Date;
  scheduledEnd?: string | Date;
}

export interface UpdateMaintenanceStatusDTO {
  status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'CANCELLED';
}

export interface CompleteMaintenanceDTO {
  resolution: string;
  cost?: number;
  condition?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'DAMAGED' | 'BROKEN';
  attachments?: Record<string, unknown> | null;
}

export interface MaintenanceDomain {
  id: string;
  assetId: string;
  reportedById: string;
  technicianId: string | null;
  issue: string;
  resolution: string | null;
  cost: number | null;
  status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  completedAt: Date | null;
  attachments: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}
