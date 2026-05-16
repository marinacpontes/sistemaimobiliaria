import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { asyncHandler } from '../../shared/asyncHandler';
import { validate } from '../../shared/validate';
import { authController } from './auth.controller';
import { loginSchema } from './auth.dto';

export const authRoutes = Router();

authRoutes.post('/login', validate(loginSchema), asyncHandler(authController.login));
authRoutes.get('/me', authMiddleware, asyncHandler(authController.me));
