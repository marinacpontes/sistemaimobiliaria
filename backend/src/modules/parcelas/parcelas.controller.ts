import { Request, Response } from 'express';
import { parcelasService } from './parcelas.service';

export const parcelasController = {
  async pay(req: Request, res: Response) {
    const parcela = await parcelasService.pay(req.params.id);
    res.json(parcela);
  },
};
