import { z } from 'zod';

const loteStatusEnum = z.enum(['DISPONIVEL', 'RESERVADO', 'VENDIDO']);

export const createLoteSchema = z.object({
  quadraId: z.string().min(1, 'quadraId obrigatório'),
  numero: z.string().min(1, 'Número obrigatório').max(20),
  metragem: z.coerce.number().positive('Metragem deve ser positiva'),
  valor: z.coerce.number().positive('Valor deve ser positivo'),
});

export const updateLoteSchema = z.object({
  numero: z.string().min(1).max(20).optional(),
  metragem: z.coerce.number().positive().optional(),
  valor: z.coerce.number().positive().optional(),
  status: loteStatusEnum.optional(),
});

export const listLotesQuerySchema = z.object({
  status: loteStatusEnum.optional(),
  quadraId: z.string().optional(),
});

export type CreateLoteInput = z.infer<typeof createLoteSchema>;
export type UpdateLoteInput = z.infer<typeof updateLoteSchema>;
export type ListLotesQuery = z.infer<typeof listLotesQuerySchema>;
