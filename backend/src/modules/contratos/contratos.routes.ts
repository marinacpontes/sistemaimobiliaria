import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { asyncHandler } from '../../shared/asyncHandler';
import { validate } from '../../shared/validate';
import { contratosController } from './contratos.controller';
import { createContratoSchema, updateContratoSchema } from './contratos.dto';

export const contratosRoutes = Router();

contratosRoutes.use(authMiddleware);

contratosRoutes.get('/', asyncHandler(contratosController.list));
contratosRoutes.get('/:id', asyncHandler(contratosController.getById));
contratosRoutes.get('/:id/parcelas', asyncHandler(contratosController.parcelas));
contratosRoutes.post('/', validate(createContratoSchema), asyncHandler(contratosController.create));
contratosRoutes.put(
  '/:id',
  validate(updateContratoSchema),
  asyncHandler(contratosController.update),
);
contratosRoutes.delete('/:id', asyncHandler(contratosController.remove));
