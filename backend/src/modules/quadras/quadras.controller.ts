import { Request, Response } from 'express';
import { lotesService } from '../lotes/lotes.service';
import { quadrasService } from './quadras.service';

export const quadrasController = {
  async list(_req: Request, res: Response) {
    const items = await quadrasService.list();
    res.json(items);
  },

  async create(req: Request, res: Response) {
    const quadra = await quadrasService.create(req.body);
    res.status(201).json(quadra);
  },

  async getById(req: Request, res: Response) {
    const quadra = await quadrasService.getById(req.params.id);
    res.json(quadra);
  },

  async update(req: Request, res: Response) {
    const quadra = await quadrasService.update(req.params.id, req.body);
    res.json(quadra);
  },

  async remove(req: Request, res: Response) {
    await quadrasService.remove(req.params.id);
    res.status(204).send();
  },

  async lotesDaQuadra(req: Request, res: Response) {
    const items = await lotesService.listByQuadra(req.params.id);
    res.json(items);
  },
};
