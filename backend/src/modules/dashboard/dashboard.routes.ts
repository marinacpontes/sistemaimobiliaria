import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { asyncHandler } from '../../shared/asyncHandler';
import { dashboardController } from './dashboard.controller';

export const dashboardRoutes = Router();

dashboardRoutes.use(authMiddleware);

dashboardRoutes.get('/', asyncHandler(dashboardController.getStats));
