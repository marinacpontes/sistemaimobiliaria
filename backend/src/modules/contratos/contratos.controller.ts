import { Request, Response } from 'express';
import { parcelasService } from '../parcelas/parcelas.service';
import { contratosService } from './contratos.service';

export const contratosController = {
  async list(_req: Request, res: Response) {
    const items = await contratosService.list();
    res.json(items);
  },

  async getById(req: Request, res: Response) {
    const contrato = await contratosService.getById(req.params.id);
    res.json(contrato);
  },

  async create(req: Request, res: Response) {
    const contrato = await contratosService.create(req.body, req.user!.id);
    res.status(201).json(contrato);
  },

  async update(req: Request, res: Response) {
    const contrato = await contratosService.update(req.params.id, req.body);
    res.json(contrato);
  },

  async remove(req: Request, res: Response) {
    await contratosService.remove(req.params.id);
    res.status(204).send();
  },

  async parcelas(req: Request, res: Response) {
    const items = await parcelasService.listByContrato(req.params.id);
    res.json(items);
  },
};
