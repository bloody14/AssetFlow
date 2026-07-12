"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const appError_1 = require("../../../shared/appError");
const httpStatus_1 = require("../../../constants/httpStatus");
const password_1 = require("../../../shared/password");
class EmployeeService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async createEmployee(data) {
        const existing = await this.repo.findByEmail(data.email);
        if (existing) {
            throw new appError_1.AppError('Email already exists', httpStatus_1.HTTP_STATUS.CONFLICT, 'EMAIL_EXISTS');
        }
        const passwordHash = await (0, password_1.hashPassword)(data.password || 'defaultPassword123!');
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
    async getEmployee(id) {
        const user = await this.repo.findById(id);
        if (!user) {
            throw new appError_1.AppError('Employee not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'EMPLOYEE_NOT_FOUND');
        }
        const { passwordHash: _passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async getAllEmployees() {
        const users = await this.repo.findAll();
        return users.map((user) => {
            const { passwordHash: _passwordHash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }
    async updateEmployee(id, data) {
        const user = await this.repo.findById(id);
        if (!user) {
            throw new appError_1.AppError('Employee not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'EMPLOYEE_NOT_FOUND');
        }
        if (data.email && data.email !== user.email) {
            const existing = await this.repo.findByEmail(data.email);
            if (existing) {
                throw new appError_1.AppError('Email already exists', httpStatus_1.HTTP_STATUS.CONFLICT, 'EMAIL_EXISTS');
            }
        }
        const updated = await this.repo.update(id, data);
        const { passwordHash: _passwordHash, ...userWithoutPassword } = updated;
        return userWithoutPassword;
    }
    async deleteEmployee(id) {
        const user = await this.repo.findById(id);
        if (!user) {
            throw new appError_1.AppError('Employee not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'EMPLOYEE_NOT_FOUND');
        }
        await this.repo.delete(id);
    }
}
exports.EmployeeService = EmployeeService;
