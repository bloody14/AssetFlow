"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./modules/auth/routes/auth.routes"));
const department_routes_1 = __importDefault(require("./modules/department/routes/department.routes"));
const employee_routes_1 = __importDefault(require("./modules/employee/routes/employee.routes"));
const assetCategory_routes_1 = __importDefault(require("./modules/assetCategory/routes/assetCategory.routes"));
const asset_routes_1 = __importDefault(require("./modules/asset/routes/asset.routes"));
const assetAllocation_routes_1 = __importDefault(require("./modules/assetAllocation/routes/assetAllocation.routes"));
const booking_routes_1 = __importDefault(require("./modules/booking/routes/booking.routes"));
const maintenance_routes_1 = __importDefault(require("./modules/maintenance/routes/maintenance.routes"));
const reporting_routes_1 = __importDefault(require("./modules/reporting/routes/reporting.routes"));
const errorHandler_1 = require("./shared/errorHandler");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// Configure CORS for the frontend Vite server
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/api/v1/auth', auth_routes_1.default);
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'success', message: 'AssetFlow API is running' });
});
app.use('/api/v1/departments', department_routes_1.default);
app.use('/api/v1/employees', employee_routes_1.default);
app.use('/api/v1/asset-categories', assetCategory_routes_1.default);
app.use('/api/v1/assets', asset_routes_1.default);
app.use('/api/v1/asset-allocations', assetAllocation_routes_1.default);
app.use('/api/v1/bookings', booking_routes_1.default);
app.use('/api/v1/maintenance', maintenance_routes_1.default);
app.use('/api/v1/reporting', reporting_routes_1.default);
app.use(errorHandler_1.errorHandler);
exports.default = app;
