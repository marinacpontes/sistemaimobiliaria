import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { asyncHandler } from '../../shared/asyncHandler';
import { validate } from '../../shared/validate';
import { lotesController } from './lotes.controller';
import { createLoteSchema, listLotesQuerySchema, updateLoteSchema } from './lotes.dto';

export const lotesRoutes = Router();

lotesRoutes.use(authMiddleware);

lotesRoutes.get('/', validate(listLotesQuerySchema, 'query'), asyncHandler(lotesController.list));
lotesRoutes.get('/:id', asyncHandler(lotesController.getById));

lotesRoutes.post('/', validate(createLoteSchema), asyncHandler(lotesController.create));
lotesRoutes.put('/:id', validate(updateLoteSchema), asyncHandler(lotesController.update));
lotesRoutes.delete('/:id', asyncHandler(lotesController.remove));

lotesRoutes.post('/:id/reservar', asyncHandler(lotesController.reservar));
lotesRoutes.post('/:id/cancelar-reserva', asyncHandler(lotesController.cancelarReserva));
