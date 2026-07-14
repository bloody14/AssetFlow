export interface CreateAssetDTO {
  assetTag: string;
  serialNumber?: string | null;
  name: string;
  description?: string | null;
  categoryId: string;
  departmentId: string;
  assignedUserId?: string | null;
  status?: 'AVAILABLE' | 'ASSIGNED' | 'IN_MAINTENANCE' | 'RETIRED' | 'LOST';
  purchaseDate?: Date | null;
  purchaseCost?: number | null;
  condition?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'DAMAGED' | 'BROKEN';
  warrantyProvider?: string | null;
  warrantyStart?: Date | null;
  warrantyEnd?: Date | null;
  warrantyStatus?: string | null;
}

export type UpdateAssetDTO = Partial<CreateAssetDTO>;

export interface AssetDomain {
  id: string;
  assetTag: string;
  serialNumber: string | null;
  name: string;
  description: string | null;
  categoryId: string;
  departmentId: string;
  assignedUserId: string | null;
  status: string;
  purchaseDate: Date | null;
  purchaseCost: number | null;
  condition: string;
  qrIdentity: string | null;
  warrantyProvider: string | null;
  warrantyStart: Date | null;
  warrantyEnd: Date | null;
  warrantyStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
}
