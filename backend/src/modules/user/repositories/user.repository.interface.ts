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
  findAll(): Promise<UserDomain[]>;
  findAllPaginated(skip: number, take: number): Promise<{ data: UserDomain[], total: number }>;
  create(data: Omit<UserDomain, 'id'>): Promise<UserDomain>;
  update(id: string, data: Partial<Omit<UserDomain, 'id' | 'passwordHash'>>): Promise<UserDomain>;
  delete(id: string): Promise<void>;
}
