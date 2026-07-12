"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetController = void 0;
const response_1 = require("../../../shared/response");
class AssetController {
    service;
    constructor(service) {
        this.service = service;
    }
    create = async (req, res) => (0, response_1.sendSuccess)(res, 'Asset created', await this.service.createAsset(req.body));
    getAll = async (_req, res) => (0, response_1.sendSuccess)(res, 'Assets retrieved', await this.service.getAllAssets());
    getById = async (req, res) => (0, response_1.sendSuccess)(res, 'Asset retrieved', await this.service.getAsset(req.params.id));
    update = async (req, res) => (0, response_1.sendSuccess)(res, 'Asset updated', await this.service.updateAsset(req.params.id, req.body));
    delete = async (req, res) => {
        await this.service.deleteAsset(req.params.id);
        return (0, response_1.sendSuccess)(res, 'Asset deleted');
    };
}
exports.AssetController = AssetController;
