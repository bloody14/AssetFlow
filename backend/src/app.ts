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
import { env } from './config/env';

import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// Security: HTTP Headers via Helmet
app.use(helmet());

// Security: Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again after 15 minutes',
    }
  }
});
app.use(globalLimiter);

// Inject Correlation ID and Request Logging
app.use(correlationIdMiddleware);

// Configure CORS for the authorized frontend
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID']
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
