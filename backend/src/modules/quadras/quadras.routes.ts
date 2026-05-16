import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { asyncHandler } from '../../shared/asyncHandler';
import { validate } from '../../shared/validate';
import { quadrasController } from './quadras.controller';
import { createQuadraSchema, updateQuadraSchema } from './quadras.dto';

export const quadrasRoutes = Router();

quadrasRoutes.use(authMiddleware);

quadrasRoutes.get('/', asyncHandler(quadrasController.list));
quadrasRoutes.get('/:id', asyncHandler(quadrasController.getById));
quadrasRoutes.get('/:id/lotes', asyncHandler(quadrasController.lotesDaQuadra));

quadrasRoutes.post('/', validate(createQuadraSchema), asyncHandler(quadrasController.create));
quadrasRoutes.put('/:id', validate(updateQuadraSchema), asyncHandler(quadrasController.update));
quadrasRoutes.delete('/:id', asyncHandler(quadrasController.remove));
