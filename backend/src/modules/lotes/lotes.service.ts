import { LoteStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ConflictError, NotFoundError } from '../../shared/errors';
import { CreateLoteInput, ListLotesQuery, UpdateLoteInput } from './lotes.dto';

const RESERVA_DURACAO_MS = 7 * 24 * 60 * 60 * 1000;

async function liberarReservasExpiradas() {
  await prisma.lote.updateMany({
    where: {
      status: LoteStatus.RESERVADO,
      reservaExpiraEm: { lt: new Date() },
    },
    data: { status: LoteStatus.DISPONIVEL, reservaExpiraEm: null },
  });
}

export const lotesService = {
  async list(query: ListLotesQuery) {
    await liberarReservasExpiradas();

    const where: Prisma.LoteWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.quadraId) where.quadraId = query.quadraId;

    return prisma.lote.findMany({
      where,
      orderBy: [{ quadra: { nome: 'asc' } }, { numero: 'asc' }],
      include: {
        quadra: { select: { id: true, nome: true } },
      },
    });
  },

  async listByQuadra(quadraId: string) {
    await liberarReservasExpiradas();
    const quadra = await prisma.quadra.findUnique({ where: { id: quadraId } });
    if (!quadra) throw new NotFoundError('Quadra não encontrada');
    return prisma.lote.findMany({
      where: { quadraId },
      orderBy: { numero: 'asc' },
    });
  },

  async getById(id: string) {
    await liberarReservasExpiradas();
    const lote = await prisma.lote.findUnique({
      where: { id },
      include: {
        quadra: { select: { id: true, nome: true } },
        contrato: {
          select: {
            id: true,
            cliente: { select: { id: true, nome: true } },
          },
        },
      },
    });
    if (!lote) throw new NotFoundError('Lote não encontrado');
    return lote;
  },

  async create(data: CreateLoteInput) {
    const quadra = await prisma.quadra.findUnique({ where: { id: data.quadraId } });
    if (!quadra) throw new NotFoundError('Quadra não encontrada');
    return prisma.lote.create({
      data: {
        quadraId: data.quadraId,
        numero: data.numero,
        metragem: data.metragem,
        valor: data.valor,
      },
    });
  },

  async update(id: string, data: UpdateLoteInput) {
    const exists = await prisma.lote.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError('Lote não encontrado');
    return prisma.lote.update({
      where: { id },
      data,
    });
  },

  async remove(id: string) {
    const lote = await prisma.lote.findUnique({
      where: { id },
      include: { contrato: true },
    });
    if (!lote) throw new NotFoundError('Lote não encontrado');
    if (lote.contrato) {
      throw new ConflictError('Não é possível excluir lote com contrato ativo');
    }
    await prisma.lote.delete({ where: { id } });
  },

  async reservar(id: string) {
    const lote = await prisma.lote.findUnique({ where: { id } });
    if (!lote) throw new NotFoundError('Lote não encontrado');
    if (lote.status !== LoteStatus.DISPONIVEL) {
      throw new ConflictError('Apenas lotes disponíveis podem ser reservados');
    }
    return prisma.lote.update({
      where: { id },
      data: {
        status: LoteStatus.RESERVADO,
        reservaExpiraEm: new Date(Date.now() + RESERVA_DURACAO_MS),
      },
    });
  },

  async cancelarReserva(id: string) {
    const lote = await prisma.lote.findUnique({ where: { id } });
    if (!lote) throw new NotFoundError('Lote não encontrado');
    if (lote.status !== LoteStatus.RESERVADO) {
      throw new ConflictError('Lote não está reservado');
    }
    return prisma.lote.update({
      where: { id },
      data: { status: LoteStatus.DISPONIVEL, reservaExpiraEm: null },
    });
  },
};
