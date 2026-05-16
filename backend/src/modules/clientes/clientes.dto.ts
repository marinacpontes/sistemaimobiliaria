import { z } from 'zod';

const onlyDigits = (v: string) => v.replace(/\D/g, '');
const emptyToUndef = z.literal('').transform(() => undefined);

const cepSchema = z
  .string()
  .min(8)
  .max(10)
  .transform(onlyDigits)
  .refine((v) => v.length === 8, 'CEP deve ter 8 dígitos');

const estadoSchema = z
  .string()
  .length(2, 'Estado deve ter 2 letras (UF)')
  .transform((v) => v.toUpperCase());

export const createClienteSchema = z.object({
  nome: z.string().min(2, 'Nome muito curto').max(120),
  cpf: z
    .string()
    .min(11)
    .max(14)
    .transform(onlyDigits)
    .refine((v) => v.length === 11, 'CPF deve ter 11 dígitos'),
  telefone: z.string().min(8).max(20),
  email: z.string().email().optional().or(emptyToUndef),
  logradouro: z.string().min(2).max(200),
  numeroEndereco: z.string().min(1).max(20),
  bairro: z.string().min(2).max(100),
  complemento: z.string().max(100).optional().or(emptyToUndef),
  cep: cepSchema,
  cidade: z.string().min(2).max(100),
  estado: estadoSchema,
});

export const updateClienteSchema = z.object({
  nome: z.string().min(2).max(120).optional(),
  cpf: z
    .string()
    .min(11)
    .max(14)
    .transform(onlyDigits)
    .refine((v) => v.length === 11, 'CPF deve ter 11 dígitos')
    .optional(),
  telefone: z.string().min(8).max(20).optional(),
  email: z.string().email().optional().or(emptyToUndef),
  logradouro: z.string().min(2).max(200).optional(),
  numeroEndereco: z.string().min(1).max(20).optional(),
  bairro: z.string().min(2).max(100).optional(),
  complemento: z.string().max(100).optional().or(emptyToUndef),
  cep: cepSchema.optional(),
  cidade: z.string().min(2).max(100).optional(),
  estado: estadoSchema.optional(),
});

export const listClientesQuerySchema = z.object({
  search: z.string().optional(),
});

export type CreateClienteInput = z.infer<typeof createClienteSchema>;
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>;
export type ListClientesQuery = z.infer<typeof listClientesQuerySchema>;
