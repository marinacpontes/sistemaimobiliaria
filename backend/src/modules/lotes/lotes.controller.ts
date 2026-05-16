import { Request, Response } from 'express';
import { ListLotesQuery } from './lotes.dto';
import { lotesService } from './lotes.service';

export const lotesController = {
  async list(req: Request, res: Response) {
    const items = await lotesService.list(req.query as unknown as ListLotesQuery);
    res.json(items);
  },

  async getById(req: Request, res: Response) {
    const lote = await lotesService.getById(req.params.id);
    res.json(lote);
  },

  async create(req: Request, res: Response) {
    const lote = await lotesService.create(req.body);
    res.status(201).json(lote);
  },

  async update(req: Request, res: Response) {
    const lote = await lotesService.update(req.params.id, req.body);
    res.json(lote);
  },

  async remove(req: Request, res: Response) {
    await lotesService.remove(req.params.id);
    res.status(204).send();
  },

  async reservar(req: Request, res: Response) {
    const lote = await lotesService.reservar(req.params.id);
    res.json(lote);
  },

  async cancelarReserva(req: Request, res: Response) {
    const lote = await lotesService.cancelarReserva(req.params.id);
    res.json(lote);
  },
};
