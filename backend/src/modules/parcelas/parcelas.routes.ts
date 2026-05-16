import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { asyncHandler } from '../../shared/asyncHandler';
import { parcelasController } from './parcelas.controller';

export const parcelasRoutes = Router();

parcelasRoutes.use(authMiddleware);

parcelasRoutes.post('/:id/pagar', asyncHandler(parcelasController.pay));
