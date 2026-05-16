import { z } from 'zod';

export const createQuadraSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório').max(50),
});

export const updateQuadraSchema = z.object({
  nome: z.string().min(1).max(50).optional(),
});

export type CreateQuadraInput = z.infer<typeof createQuadraSchema>;
export type UpdateQuadraInput = z.infer<typeof updateQuadraSchema>;
