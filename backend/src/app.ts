import express from 'express';
import cookieParser from 'cookie-parser';
import { correlationIdMiddleware } from './middlewares/correlationId.middleware';
import authRoutes from './modules/auth/routes/auth.routes';
import departmentRoutes from './modules/department/routes/department.routes';
import employeeRoutes from './modules/employee/routes/employee.routes';
import assetCategoryRoutes from './modules/assetCategory/routes/assetCategory.routes';
import assetRoutes from './modules/asset/routes/asset.routes';
import assetAllocationRoutes from './modules/assetAllocation/routes/assetAllocation.routes';
import bookingRoutes from './modules/booking/routes/booking.routes';
import maintenanceRoutes from './modules/maintenance/routes/maintenance.routes';
import reportingRoutes from './modules/reporting/routes/reporting.routes';
import { errorHandler } from './shared/errorHandler';
import * as healthController from './controllers/health.controller';

import cors from 'cors';

const app = express();

// Inject Correlation ID and Request Logging
app.use(correlationIdMiddleware);
// Configure CORS for the frontend Vite server
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRoutes);

app.get('/health', healthController.healthCheck);
app.get('/live', healthController.livenessCheck);
app.get('/ready', healthController.readinessCheck);
app.get('/version', healthController.versionInfo);

app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/asset-categories', assetCategoryRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/asset-allocations', assetAllocationRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/reporting', reportingRoutes);

app.use(errorHandler);

export default app;
