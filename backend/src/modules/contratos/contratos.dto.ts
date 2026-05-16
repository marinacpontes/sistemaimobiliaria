import { z } from 'zod';

export const createContratoSchema = z
  .object({
    clienteId: z.string().min(1, 'clienteId obrigatório'),
    loteId: z.string().min(1, 'loteId obrigatório'),
    valorTotal: z.coerce.number().positive('Valor total deve ser positivo'),
    entrada: z.coerce.number().min(0, 'Entrada não pode ser negativa'),
    numParcelas: z.coerce.number().int().min(1, 'Mínimo 1 parcela').max(360),
    dataVenda: z.coerce.date().optional(),
  })
  .refine((d) => d.entrada <= d.valorTotal, {
    message: 'Entrada não pode ser maior que valor total',
    path: ['entrada'],
  });

export const updateContratoSchema = z.object({
  clienteId: z.string().min(1).optional(),
  dataVenda: z.coerce.date().optional(),
  status: z.enum(['ATIVO', 'QUITADO', 'CANCELADO']).optional(),
});

export type CreateContratoInput = z.infer<typeof createContratoSchema>;
export type UpdateContratoInput = z.infer<typeof updateContratoSchema>;
