export interface CreateDepartmentDTO {
  name: string;
  parentDepartmentId?: string;
}

export interface UpdateDepartmentDTO {
  name?: string;
  parentDepartmentId?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface DepartmentDomain {
  id: string;
  name: string;
  parentDepartmentId: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}
