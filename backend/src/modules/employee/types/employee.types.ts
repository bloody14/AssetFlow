export interface CreateEmployeeDTO {
  name: string;
  email: string;
  password?: string;
  role?: 'ADMIN' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE';
  departmentId?: string;
}

export interface UpdateEmployeeDTO {
  name?: string;
  email?: string;
  role?: 'ADMIN' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE';
  departmentId?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
}
