import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ConflictError, NotFoundError } from '../../shared/errors';
import { CreateClienteInput, ListClientesQuery, UpdateClienteInput } from './clientes.dto';

export const clientesService = {
  async list(query: ListClientesQuery) {
    const where: Prisma.ClienteWhereInput = {};
    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      const digits = term.replace(/\D/g, '');
      where.OR = [
        { nome: { contains: term, mode: 'insensitive' } },
        ...(digits.length > 0 ? [{ cpf: { contains: digits } }] : []),
      ];
    }
    return prisma.cliente.findMany({
      where,
      orderBy: { nome: 'asc' },
      include: { _count: { select: { contratos: true } } },
    });
  },

  async getById(id: string) {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        contratos: {
          orderBy: { dataVenda: 'desc' },
          include: { lote: { include: { quadra: true } } },
        },
      },
    });
    if (!cliente) throw new NotFoundError('Cliente não encontrado');
    return cliente;
  },

  async create(data: CreateClienteInput) {
    return prisma.cliente.create({ data });
  },

  async update(id: string, data: UpdateClienteInput) {
    const exists = await prisma.cliente.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError('Cliente não encontrado');
    return prisma.cliente.update({ where: { id }, data });
  },

  async remove(id: string) {
    const exists = await prisma.cliente.findUnique({
      where: { id },
      include: { contratos: { select: { id: true } } },
    });
    if (!exists) throw new NotFoundError('Cliente não encontrado');
    if (exists.contratos.length > 0) {
      throw new ConflictError(
        'Não é possível excluir cliente com contratos. Cancele os contratos primeiro.',
      );
    }
    await prisma.cliente.delete({ where: { id } });
  },
};
