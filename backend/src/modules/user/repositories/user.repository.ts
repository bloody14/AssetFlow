import { prisma } from '../../../config/prisma';
import { IUserRepository, UserDomain } from './user.repository.interface';

export class PrismaUserRepository implements IUserRepository {
  private mapToDomain(user: import('@prisma/client').User): UserDomain {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      status: user.status,
      departmentId: user.departmentId,
    };
  }

  async findByEmail(email: string): Promise<UserDomain | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? this.mapToDomain(user) : null;
  }

  async findById(id: string): Promise<UserDomain | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? this.mapToDomain(user) : null;
  }

  async findAll(): Promise<UserDomain[]> {
    const users = await prisma.user.findMany();
    return users.map((u) => this.mapToDomain(u));
  }

  async findAllPaginated(skip: number, take: number): Promise<{ data: UserDomain[], total: number }> {
    const [users, total] = await Promise.all([
      prisma.user.findMany({ skip, take }),
      prisma.user.count()
    ]);
    return {
      data: users.map((u) => this.mapToDomain(u)),
      total
    };
  }

  async create(data: Omit<UserDomain, 'id'>): Promise<UserDomain> {
    const user = await prisma.user.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: data as any,
    });
    return this.mapToDomain(user);
  }

  async update(
    id: string,
    data: Partial<Omit<UserDomain, 'id' | 'passwordHash'>>
  ): Promise<UserDomain> {
    const user = await prisma.user.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: data as any,
    });
    return this.mapToDomain(user);
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}
