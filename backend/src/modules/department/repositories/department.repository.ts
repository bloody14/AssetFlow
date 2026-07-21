import { prisma } from '../../../config/prisma';
import {
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  DepartmentDomain,
} from '../types/department.types';

export class PrismaDepartmentRepository {
  private mapToDomain(dept: import('@prisma/client').Department): DepartmentDomain {
    return {
      id: dept.id,
      name: dept.name,
      parentDepartmentId: dept.parentDepartmentId,
      status: dept.status,
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt,
    };
  }

  async create(data: CreateDepartmentDTO): Promise<DepartmentDomain> {
    const dept = await prisma.department.create({ data });
    return this.mapToDomain(dept);
  }

  async findById(id: string): Promise<DepartmentDomain | null> {
    const dept = await prisma.department.findUnique({ where: { id } });
    return dept ? this.mapToDomain(dept) : null;
  }

  async findByName(name: string): Promise<DepartmentDomain | null> {
    const dept = await prisma.department.findUnique({ where: { name } });
    return dept ? this.mapToDomain(dept) : null;
  }

  async findAll(): Promise<DepartmentDomain[]> {
    const depts = await prisma.department.findMany();
    return depts.map((d) => this.mapToDomain(d));
  }

  async findAllPaginated(
    skip: number,
    take: number
  ): Promise<{ data: DepartmentDomain[]; total: number }> {
    const [depts, total] = await Promise.all([
      prisma.department.findMany({ skip, take }),
      prisma.department.count(),
    ]);
    return {
      data: depts.map((d) => this.mapToDomain(d)),
      total,
    };
  }

  async update(id: string, data: UpdateDepartmentDTO): Promise<DepartmentDomain> {
    const dept = await prisma.department.update({ where: { id }, data });
    return this.mapToDomain(dept);
  }

  async delete(id: string): Promise<void> {
    await prisma.department.delete({ where: { id } });
  }

  async hasUsers(id: string): Promise<boolean> {
    const count = await prisma.user.count({ where: { departmentId: id } });
    return count > 0;
  }

  async hasSubDepartments(id: string): Promise<boolean> {
    const count = await prisma.department.count({ where: { parentDepartmentId: id } });
    return count > 0;
  }
}
