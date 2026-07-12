export interface CreateAssetCategoryDTO {
  name: string;
  description?: string;
}

export interface UpdateAssetCategoryDTO {
  name?: string;
  description?: string | null;
}

export interface AssetCategoryDomain {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}
