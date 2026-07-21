import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { PrismaAuthRepository } from '../repositories/auth.repository';
import { PrismaUserRepository } from '../../user/repositories/user.repository';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../../../shared/validateRequest';
import { loginSchema } from '../validations/auth.validation';
import { asyncHandler } from '../../../shared/asyncHandler';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many login attempts, please try again after 15 minutes',
    },
  },
});

// Manual Dependency Injection
const userRepository = new PrismaUserRepository();
const authRepository = new PrismaAuthRepository();
const authService = new AuthService(authRepository, userRepository);
const authController = new AuthController(authService);
const authMiddleware = authenticate(userRepository);

// Routes mapped to /api/v1/auth (prefix applied in app.ts/server.ts)
router.post(
  '/login',
  loginLimiter,
  validateRequest(loginSchema),
  asyncHandler(authController.login)
);
router.post('/refresh', asyncHandler(authController.refreshToken));
router.post('/logout', authMiddleware, asyncHandler(authController.logout));
router.post('/logout-all', authMiddleware, asyncHandler(authController.logoutAll));
router.get('/me', authMiddleware, asyncHandler(authController.me));

export default router;
