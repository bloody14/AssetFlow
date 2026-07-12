export interface UserDomain {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  status: string;
  departmentId: string | null;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<UserDomain | null>;
  findById(id: string): Promise<UserDomain | null>;
}
