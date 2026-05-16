import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { asyncHandler } from '../../shared/asyncHandler';
import { validate } from '../../shared/validate';
import { clientesController } from './clientes.controller';
import {
  createClienteSchema,
  listClientesQuerySchema,
  updateClienteSchema,
} from './clientes.dto';

export const clientesRoutes = Router();

clientesRoutes.use(authMiddleware);

clientesRoutes.get(
  '/',
  validate(listClientesQuerySchema, 'query'),
  asyncHandler(clientesController.list),
);
clientesRoutes.get('/:id', asyncHandler(clientesController.getById));
clientesRoutes.post('/', validate(createClienteSchema), asyncHandler(clientesController.create));
clientesRoutes.put(
  '/:id',
  validate(updateClienteSchema),
  asyncHandler(clientesController.update),
);
clientesRoutes.delete('/:id', asyncHandler(clientesController.remove));
