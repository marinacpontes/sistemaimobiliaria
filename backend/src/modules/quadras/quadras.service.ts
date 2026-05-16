import { prisma } from '../../config/prisma';
import { ConflictError, NotFoundError } from '../../shared/errors';
import { CreateQuadraInput, UpdateQuadraInput } from './quadras.dto';

export const quadrasService = {
  async list() {
    return prisma.quadra.findMany({
      orderBy: { nome: 'asc' },
      include: { _count: { select: { lotes: true } } },
    });
  },

  async getById(id: string) {
    const quadra = await prisma.quadra.findUnique({
      where: { id },
      include: { _count: { select: { lotes: true } } },
    });
    if (!quadra) throw new NotFoundError('Quadra não encontrada');
    return quadra;
  },

  async create(data: CreateQuadraInput) {
    return prisma.quadra.create({ data });
  },

  async update(id: string, data: UpdateQuadraInput) {
    const exists = await prisma.quadra.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError('Quadra não encontrada');
    return prisma.quadra.update({ where: { id }, data });
  },

  async remove(id: string) {
    const quadra = await prisma.quadra.findUnique({
      where: { id },
      include: {
        lotes: {
          include: { contrato: { select: { id: true } } },
        },
      },
    });
    if (!quadra) throw new NotFoundError('Quadra não encontrada');

    const lotesVendidos = quadra.lotes.filter((l) => l.contrato !== null);
    if (lotesVendidos.length > 0) {
      throw new ConflictError(
        `Não é possível excluir esta quadra: ${lotesVendidos.length} lote(s) possuem contratos. Cancele os contratos primeiro.`,
      );
    }

    await prisma.quadra.delete({ where: { id } });
  },
};
