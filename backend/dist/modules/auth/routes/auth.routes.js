"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_service_1 = require("../services/auth.service");
const auth_repository_1 = require("../repositories/auth.repository");
const user_repository_1 = require("../../user/repositories/user.repository");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const asyncHandler_1 = require("../../../shared/asyncHandler");
const router = (0, express_1.Router)();
// Manual Dependency Injection
const userRepository = new user_repository_1.PrismaUserRepository();
const authRepository = new auth_repository_1.PrismaAuthRepository();
const authService = new auth_service_1.AuthService(authRepository, userRepository);
const authController = new auth_controller_1.AuthController(authService);
const authMiddleware = (0, auth_middleware_1.authenticate)(userRepository);
// Routes mapped to /api/v1/auth (prefix applied in app.ts/server.ts)
router.post('/login', (0, asyncHandler_1.asyncHandler)(authController.login));
router.post('/refresh', (0, asyncHandler_1.asyncHandler)(authController.refreshToken));
router.post('/logout', authMiddleware, (0, asyncHandler_1.asyncHandler)(authController.logout));
router.post('/logout-all', authMiddleware, (0, asyncHandler_1.asyncHandler)(authController.logoutAll));
router.get('/me', authMiddleware, (0, asyncHandler_1.asyncHandler)(authController.me));
exports.default = router;
