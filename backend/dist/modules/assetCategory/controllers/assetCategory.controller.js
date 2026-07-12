"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetCategoryController = void 0;
const response_1 = require("../../../shared/response");
class AssetCategoryController {
    service;
    constructor(service) {
        this.service = service;
    }
    create = async (req, res) => (0, response_1.sendSuccess)(res, 'Category created', await this.service.createCategory(req.body));
    getAll = async (_req, res) => (0, response_1.sendSuccess)(res, 'Categories retrieved', await this.service.getAllCategories());
    getById = async (req, res) => (0, response_1.sendSuccess)(res, 'Category retrieved', await this.service.getCategory(req.params.id));
    update = async (req, res) => (0, response_1.sendSuccess)(res, 'Category updated', await this.service.updateCategory(req.params.id, req.body));
    delete = async (req, res) => {
        await this.service.deleteCategory(req.params.id);
        return (0, response_1.sendSuccess)(res, 'Category deleted');
    };
}
exports.AssetCategoryController = AssetCategoryController;
