"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentController = void 0;
const response_1 = require("../../../shared/response");
class DepartmentController {
    service;
    constructor(service) {
        this.service = service;
    }
    create = async (req, res) => {
        const dept = await this.service.createDepartment(req.body);
        return (0, response_1.sendSuccess)(res, 'Department created successfully', dept);
    };
    getAll = async (_req, res) => {
        const depts = await this.service.getAllDepartments();
        return (0, response_1.sendSuccess)(res, 'Departments retrieved successfully', depts);
    };
    getById = async (req, res) => {
        const dept = await this.service.getDepartment(req.params.id);
        return (0, response_1.sendSuccess)(res, 'Department retrieved successfully', dept);
    };
    update = async (req, res) => {
        const dept = await this.service.updateDepartment(req.params.id, req.body);
        return (0, response_1.sendSuccess)(res, 'Department updated successfully', dept);
    };
    delete = async (req, res) => {
        await this.service.deleteDepartment(req.params.id);
        return (0, response_1.sendSuccess)(res, 'Department deleted successfully');
    };
}
exports.DepartmentController = DepartmentController;
