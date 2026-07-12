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
}
