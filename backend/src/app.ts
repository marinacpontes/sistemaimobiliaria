import cors from 'cors';
import express, { Request, Response } from 'express';
import { env } from './config/env';
import { errorHandler } from './middlewares/error';
import { authRoutes } from './modules/auth/auth.routes';
import { clientesRoutes } from './modules/clientes/clientes.routes';
import { contratosRoutes } from './modules/contratos/contratos.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { lotesRoutes } from './modules/lotes/lotes.routes';
import { parcelasRoutes } from './modules/parcelas/parcelas.routes';
import { quadrasRoutes } from './modules/quadras/quadras.routes';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/quadras', quadrasRoutes);
  app.use('/api/lotes', lotesRoutes);
  app.use('/api/clientes', clientesRoutes);
  app.use('/api/contratos', contratosRoutes);
  app.use('/api/parcelas', parcelasRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Rota não encontrada' });
  });

  app.use(errorHandler);

  return app;
}
