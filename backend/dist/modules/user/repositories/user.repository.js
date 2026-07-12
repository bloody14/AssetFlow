"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const prisma_1 = require("../../../config/prisma");
class PrismaUserRepository {
    mapToDomain(user) {
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
    async findByEmail(email) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        return user ? this.mapToDomain(user) : null;
    }
    async findById(id) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id } });
        return user ? this.mapToDomain(user) : null;
    }
    async findAll() {
        const users = await prisma_1.prisma.user.findMany();
        return users.map((u) => this.mapToDomain(u));
    }
    async create(data) {
        const user = await prisma_1.prisma.user.create({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: data,
        });
        return this.mapToDomain(user);
    }
    async update(id, data) {
        const user = await prisma_1.prisma.user.update({
            where: { id },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: data,
        });
        return this.mapToDomain(user);
    }
    async delete(id) {
        await prisma_1.prisma.user.delete({ where: { id } });
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
