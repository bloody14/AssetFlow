"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaDepartmentRepository = void 0;
const prisma_1 = require("../../../config/prisma");
class PrismaDepartmentRepository {
    mapToDomain(dept) {
        return {
            id: dept.id,
            name: dept.name,
            parentDepartmentId: dept.parentDepartmentId,
            status: dept.status,
            createdAt: dept.createdAt,
            updatedAt: dept.updatedAt,
        };
    }
    async create(data) {
        const dept = await prisma_1.prisma.department.create({ data });
        return this.mapToDomain(dept);
    }
    async findById(id) {
        const dept = await prisma_1.prisma.department.findUnique({ where: { id } });
        return dept ? this.mapToDomain(dept) : null;
    }
    async findByName(name) {
        const dept = await prisma_1.prisma.department.findUnique({ where: { name } });
        return dept ? this.mapToDomain(dept) : null;
    }
    async findAll() {
        const depts = await prisma_1.prisma.department.findMany();
        return depts.map((d) => this.mapToDomain(d));
    }
    async update(id, data) {
        const dept = await prisma_1.prisma.department.update({ where: { id }, data });
        return this.mapToDomain(dept);
    }
    async delete(id) {
        await prisma_1.prisma.department.delete({ where: { id } });
    }
    async hasUsers(id) {
        const count = await prisma_1.prisma.user.count({ where: { departmentId: id } });
        return count > 0;
    }
    async hasSubDepartments(id) {
        const count = await prisma_1.prisma.department.count({ where: { parentDepartmentId: id } });
        return count > 0;
    }
}
exports.PrismaDepartmentRepository = PrismaDepartmentRepository;
