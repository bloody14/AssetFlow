export interface AllocateAssetDTO {
  assetId: string;
  allocatedToId: string;
  notes?: string;
}

export interface ReturnAssetDTO {
  assetId: string;
  notes?: string;
}

export interface TransferAssetDTO {
  assetId: string;
  newAllocatedToId: string;
  notes?: string;
}

export interface AssetAllocationDomain {
  id: string;
  assetId: string;
  allocatedToId: string;
  allocatedById: string;
  allocatedAt: Date;
  returnedAt: Date | null;
  returnedById: string | null;
  status: 'ACTIVE' | 'RETURNED';
  notes: string | null;
}

export interface AuditLogDomain {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  details: Record<string, unknown> | null;
  createdAt: Date;
}
