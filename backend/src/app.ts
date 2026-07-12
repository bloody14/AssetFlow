import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/routes/auth.routes';
import departmentRoutes from './modules/department/routes/department.routes';
import employeeRoutes from './modules/employee/routes/employee.routes';
import assetCategoryRoutes from './modules/assetCategory/routes/assetCategory.routes';
import assetRoutes from './modules/asset/routes/asset.routes';
import assetAllocationRoutes from './modules/assetAllocation/routes/assetAllocation.routes';
import bookingRoutes from './modules/booking/routes/booking.routes';
import maintenanceRoutes from './modules/maintenance/routes/maintenance.routes';
import { errorHandler } from './shared/errorHandler';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/asset-categories', assetCategoryRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/asset-allocations', assetAllocationRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);

app.use(errorHandler);

export default app;
