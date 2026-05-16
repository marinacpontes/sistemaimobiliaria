import { LoteStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ConflictError, NotFoundError } from '../../shared/errors';
import { CreateContratoInput, UpdateContratoInput } from './contratos.dto';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export const contratosService = {
  async list() {
    return prisma.contrato.findMany({
      orderBy: { dataVenda: 'desc' },
      include: {
        cliente: { select: { id: true, nome: true, cpf: true } },
        lote: {
          select: {
            id: true,
            numero: true,
            quadra: { select: { id: true, nome: true } },
          },
        },
        vendedor: { select: { id: true, nome: true } },
        _count: { select: { parcelas: true } },
      },
    });
  },

  async getById(id: string) {
    const contrato = await prisma.contrato.findUnique({
      where: { id },
      include: {
        cliente: true,
        lote: {
          include: { quadra: true },
        },
        vendedor: { select: { id: true, nome: true } },
        parcelas: { orderBy: { numero: 'asc' } },
      },
    });
    if (!contrato) throw new NotFoundError('Contrato não encontrado');
    return contrato;
  },

  async create(data: CreateContratoInput, vendedorId: string) {
    const cliente = await prisma.cliente.findUnique({ where: { id: data.clienteId } });
    if (!cliente) throw new NotFoundError('Cliente não encontrado');

    const lote = await prisma.lote.findUnique({
      where: { id: data.loteId },
      include: { contrato: true },
    });
    if (!lote) throw new NotFoundError('Lote não encontrado');

    if (lote.contrato) {
      throw new ConflictError('Este lote já possui um contrato');
    }
    if (lote.status === LoteStatus.VENDIDO) {
      throw new ConflictError('Lote já está vendido');
    }

    const dataVenda = data.dataVenda ?? new Date();
    const saldoFinanciado = data.valorTotal - data.entrada;
    const valorParcelaBase = round2(saldoFinanciado / data.numParcelas);

    return prisma.$transaction(async (tx) => {
      const contrato = await tx.contrato.create({
        data: {
          clienteId: data.clienteId,
          loteId: data.loteId,
          vendedorId,
          valorTotal: data.valorTotal,
          entrada: data.entrada,
          numParcelas: data.numParcelas,
          dataVenda,
        },
      });

      await tx.lote.update({
        where: { id: data.loteId },
        data: { status: LoteStatus.VENDIDO, reservaExpiraEm: null },
      });

      let soma = 0;
      for (let i = 1; i <= data.numParcelas; i++) {
        const valor =
          i === data.numParcelas ? round2(saldoFinanciado - soma) : valorParcelaBase;
        soma += valorParcelaBase;

        const vencimento = new Date(dataVenda);
        vencimento.setMonth(vencimento.getMonth() + i);

        await tx.parcela.create({
          data: {
            contratoId: contrato.id,
            numero: i,
            valor,
            vencimento,
          },
        });
      }

      return tx.contrato.findUniqueOrThrow({
        where: { id: contrato.id },
        include: {
          cliente: true,
          lote: { include: { quadra: true } },
          parcelas: { orderBy: { numero: 'asc' } },
        },
      });
    });
  },

  async update(id: string, data: UpdateContratoInput) {
    const contrato = await prisma.contrato.findUnique({ where: { id } });
    if (!contrato) throw new NotFoundError('Contrato não encontrado');

    if (data.clienteId) {
      const cliente = await prisma.cliente.findUnique({ where: { id: data.clienteId } });
      if (!cliente) throw new NotFoundError('Cliente não encontrado');
    }

    return prisma.contrato.update({
      where: { id },
      data: {
        clienteId: data.clienteId,
        dataVenda: data.dataVenda,
        status: data.status,
      },
      include: {
        cliente: true,
        lote: { include: { quadra: true } },
        parcelas: { orderBy: { numero: 'asc' } },
      },
    });
  },

  async remove(id: string) {
    const contrato = await prisma.contrato.findUnique({ where: { id } });
    if (!contrato) throw new NotFoundError('Contrato não encontrado');

    await prisma.$transaction(async (tx) => {
      await tx.contrato.delete({ where: { id } });
      await tx.lote.update({
        where: { id: contrato.loteId },
        data: { status: LoteStatus.DISPONIVEL, reservaExpiraEm: null },
      });
    });
  },
};
