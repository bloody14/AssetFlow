import { PrismaDepartmentRepository } from '../repositories/department.repository';
import {
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  DepartmentDomain,
} from '../types/department.types';
import { AppError } from '../../../shared/appError';
import { HTTP_STATUS } from '../../../constants/httpStatus';

export class DepartmentService {
  constructor(private readonly repo: PrismaDepartmentRepository) {}

  async createDepartment(data: CreateDepartmentDTO): Promise<DepartmentDomain> {
    const existing = await this.repo.findByName(data.name);
    if (existing) {
      throw new AppError(
        'Department name already exists',
        HTTP_STATUS.CONFLICT,
        'DEPARTMENT_EXISTS'
      );
    }

    if (data.parentDepartmentId) {
      const parent = await this.repo.findById(data.parentDepartmentId);
      if (!parent) {
        throw new AppError(
          'Parent department not found',
          HTTP_STATUS.NOT_FOUND,
          'PARENT_NOT_FOUND'
        );
      }
    }

    return this.repo.create(data);
  }

  async getDepartment(id: string): Promise<DepartmentDomain> {
    const dept = await this.repo.findById(id);
    if (!dept) {
      throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND, 'DEPARTMENT_NOT_FOUND');
    }
    return dept;
  }

  async getAllDepartments(): Promise<DepartmentDomain[]> {
    return this.repo.findAll();
  }

  async updateDepartment(id: string, data: UpdateDepartmentDTO): Promise<DepartmentDomain> {
    const dept = await this.repo.findById(id);
    if (!dept) {
      throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND, 'DEPARTMENT_NOT_FOUND');
    }

    if (data.name && data.name !== dept.name) {
      const existing = await this.repo.findByName(data.name);
      if (existing) {
        throw new AppError(
          'Department name already exists',
          HTTP_STATUS.CONFLICT,
          'DEPARTMENT_EXISTS'
        );
      }
    }

    if (data.parentDepartmentId) {
      if (data.parentDepartmentId === id) {
        throw new AppError(
          'Department cannot be its own parent',
          HTTP_STATUS.BAD_REQUEST,
          'INVALID_PARENT'
        );
      }
      const parent = await this.repo.findById(data.parentDepartmentId);
      if (!parent) {
        throw new AppError(
          'Parent department not found',
          HTTP_STATUS.NOT_FOUND,
          'PARENT_NOT_FOUND'
        );
      }
    }

    return this.repo.update(id, data);
  }

  async deleteDepartment(id: string): Promise<void> {
    const dept = await this.repo.findById(id);
    if (!dept) {
      throw new AppError('Department not found', HTTP_STATUS.NOT_FOUND, 'DEPARTMENT_NOT_FOUND');
    }

    const hasUsers = await this.repo.hasUsers(id);
    if (hasUsers) {
      throw new AppError(
        'Cannot delete department with active users',
        HTTP_STATUS.CONFLICT,
        'DEPARTMENT_HAS_USERS'
      );
    }

    const hasSubDepartments = await this.repo.hasSubDepartments(id);
    if (hasSubDepartments) {
      throw new AppError(
        'Cannot delete department with sub-departments',
        HTTP_STATUS.CONFLICT,
        'DEPARTMENT_HAS_SUBDEPARTMENTS'
      );
    }

    await this.repo.delete(id);
  }
}
