"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentService = void 0;
const appError_1 = require("../../../shared/appError");
const httpStatus_1 = require("../../../constants/httpStatus");
class DepartmentService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async createDepartment(data) {
        const existing = await this.repo.findByName(data.name);
        if (existing) {
            throw new appError_1.AppError('Department name already exists', httpStatus_1.HTTP_STATUS.CONFLICT, 'DEPARTMENT_EXISTS');
        }
        if (data.parentDepartmentId) {
            const parent = await this.repo.findById(data.parentDepartmentId);
            if (!parent) {
                throw new appError_1.AppError('Parent department not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'PARENT_NOT_FOUND');
            }
        }
        return this.repo.create(data);
    }
    async getDepartment(id) {
        const dept = await this.repo.findById(id);
        if (!dept) {
            throw new appError_1.AppError('Department not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'DEPARTMENT_NOT_FOUND');
        }
        return dept;
    }
    async getAllDepartments() {
        return this.repo.findAll();
    }
    async updateDepartment(id, data) {
        const dept = await this.repo.findById(id);
        if (!dept) {
            throw new appError_1.AppError('Department not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'DEPARTMENT_NOT_FOUND');
        }
        if (data.name && data.name !== dept.name) {
            const existing = await this.repo.findByName(data.name);
            if (existing) {
                throw new appError_1.AppError('Department name already exists', httpStatus_1.HTTP_STATUS.CONFLICT, 'DEPARTMENT_EXISTS');
            }
        }
        if (data.parentDepartmentId) {
            if (data.parentDepartmentId === id) {
                throw new appError_1.AppError('Department cannot be its own parent', httpStatus_1.HTTP_STATUS.BAD_REQUEST, 'INVALID_PARENT');
            }
            const parent = await this.repo.findById(data.parentDepartmentId);
            if (!parent) {
                throw new appError_1.AppError('Parent department not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'PARENT_NOT_FOUND');
            }
        }
        return this.repo.update(id, data);
    }
    async deleteDepartment(id) {
        const dept = await this.repo.findById(id);
        if (!dept) {
            throw new appError_1.AppError('Department not found', httpStatus_1.HTTP_STATUS.NOT_FOUND, 'DEPARTMENT_NOT_FOUND');
        }
        const hasUsers = await this.repo.hasUsers(id);
        if (hasUsers) {
            throw new appError_1.AppError('Cannot delete department with active users', httpStatus_1.HTTP_STATUS.CONFLICT, 'DEPARTMENT_HAS_USERS');
        }
        const hasSubDepartments = await this.repo.hasSubDepartments(id);
        if (hasSubDepartments) {
            throw new appError_1.AppError('Cannot delete department with sub-departments', httpStatus_1.HTTP_STATUS.CONFLICT, 'DEPARTMENT_HAS_SUBDEPARTMENTS');
        }
        await this.repo.delete(id);
    }
}
exports.DepartmentService = DepartmentService;
