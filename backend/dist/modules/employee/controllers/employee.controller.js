"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const response_1 = require("../../../shared/response");
class EmployeeController {
    service;
    constructor(service) {
        this.service = service;
    }
    create = async (req, res) => {
        const employee = await this.service.createEmployee(req.body);
        return (0, response_1.sendSuccess)(res, 'Employee created successfully', employee);
    };
    getAll = async (_req, res) => {
        const employees = await this.service.getAllEmployees();
        return (0, response_1.sendSuccess)(res, 'Employees retrieved successfully', employees);
    };
    getById = async (req, res) => {
        const employee = await this.service.getEmployee(req.params.id);
        return (0, response_1.sendSuccess)(res, 'Employee retrieved successfully', employee);
    };
    update = async (req, res) => {
        const employee = await this.service.updateEmployee(req.params.id, req.body);
        return (0, response_1.sendSuccess)(res, 'Employee updated successfully', employee);
    };
    delete = async (req, res) => {
        await this.service.deleteEmployee(req.params.id);
        return (0, response_1.sendSuccess)(res, 'Employee deleted successfully');
    };
}
exports.EmployeeController = EmployeeController;
