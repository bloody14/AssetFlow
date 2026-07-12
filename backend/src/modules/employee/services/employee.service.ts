import { PrismaUserRepository } from '../../user/repositories/user.repository';
import { CreateEmployeeDTO, UpdateEmployeeDTO } from '../types/employee.types';
import { AppError } from '../../../shared/appError';
import { HTTP_STATUS } from '../../../constants/httpStatus';
import { hashPassword } from '../../../shared/password';
import { UserDomain } from '../../user/repositories/user.repository.interface';

export class EmployeeService {
  constructor(private readonly repo: PrismaUserRepository) {}

  async createEmployee(data: CreateEmployeeDTO): Promise<Omit<UserDomain, 'passwordHash'>> {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) {
      throw new AppError('Email already exists', HTTP_STATUS.CONFLICT, 'EMAIL_EXISTS');
    }

    const passwordHash = await hashPassword(data.password || 'defaultPassword123!');
    const role = data.role || 'EMPLOYEE';

    const user = await this.repo.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role,
      status: 'ACTIVE',
      departmentId: data.departmentId || null,
    });

    const { passwordHash: _passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getEmployee(id: string): Promise<Omit<UserDomain, 'passwordHash'>> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new AppError('Employee not found', HTTP_STATUS.NOT_FOUND, 'EMPLOYEE_NOT_FOUND');
    }
    const { passwordHash: _passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAllEmployees(): Promise<Omit<UserDomain, 'passwordHash'>[]> {
    const users = await this.repo.findAll();
    return users.map((user) => {
      const { passwordHash: _passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async updateEmployee(
    id: string,
    data: UpdateEmployeeDTO
  ): Promise<Omit<UserDomain, 'passwordHash'>> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new AppError('Employee not found', HTTP_STATUS.NOT_FOUND, 'EMPLOYEE_NOT_FOUND');
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.repo.findByEmail(data.email);
      if (existing) {
        throw new AppError('Email already exists', HTTP_STATUS.CONFLICT, 'EMAIL_EXISTS');
      }
    }

    const updated = await this.repo.update(id, data);
    const { passwordHash: _passwordHash, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  async deleteEmployee(id: string): Promise<void> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new AppError('Employee not found', HTTP_STATUS.NOT_FOUND, 'EMPLOYEE_NOT_FOUND');
    }
    await this.repo.delete(id);
  }
}
