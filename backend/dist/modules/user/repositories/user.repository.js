"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
        const user = await prisma.user.findUnique({ where: { email } });
        return user ? this.mapToDomain(user) : null;
    }
    async findById(id) {
        const user = await prisma.user.findUnique({ where: { id } });
        return user ? this.mapToDomain(user) : null;
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
