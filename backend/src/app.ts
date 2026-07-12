import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/routes/auth.routes';
import { errorHandler } from './shared/errorHandler';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRoutes);

app.use(errorHandler);

export default app;
