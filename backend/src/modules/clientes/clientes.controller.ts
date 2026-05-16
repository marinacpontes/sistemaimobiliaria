import { Request, Response } from 'express';
import { ListClientesQuery } from './clientes.dto';
import { clientesService } from './clientes.service';

export const clientesController = {
  async list(req: Request, res: Response) {
    const items = await clientesService.list(req.query as unknown as ListClientesQuery);
    res.json(items);
  },

  async getById(req: Request, res: Response) {
    const cliente = await clientesService.getById(req.params.id);
    res.json(cliente);
  },

  async create(req: Request, res: Response) {
    const cliente = await clientesService.create(req.body);
    res.status(201).json(cliente);
  },

  async update(req: Request, res: Response) {
    const cliente = await clientesService.update(req.params.id, req.body);
    res.json(cliente);
  },

  async remove(req: Request, res: Response) {
    await clientesService.remove(req.params.id);
    res.status(204).send();
  },
};
